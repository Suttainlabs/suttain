import { z } from "npm:zod@3.24.2";

// ── Input sanitization ──────────────────────────────────────────
// Strips HTML tags, script blocks, javascript: URIs, and inline event
// handlers from any string field before it reaches the auth layer.
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// ── Zod schemas ─────────────────────────────────────────────────
const emailSchema = z.string()
  .min(5, 'email')
  .max(254, 'email')
  .email('email')
  .transform(sanitizeString);

const passwordSchema = z.string()
  .min(8, 'password')
  .max(128, 'password');

const displayNameSchema = z.string()
  .min(1, 'display_name')
  .max(50, 'display_name')
  .transform(sanitizeString);

const usernameSchema = z.string()
  .min(3, 'username')
  .max(30, 'username')
  .regex(/^[a-zA-Z0-9_]+$/, 'username')
  .transform(sanitizeString);

const GENERIC_ERROR = "Invalid input. Please check your details and try again.";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, email, password, display_name, username } = body;

    const failedFields = [];
    const sanitized = {};

    // ── Email: required for both login and signup ──
    try {
      sanitized.email = emailSchema.parse(email);
    } catch {
      failedFields.push('email');
    }

    // ── Password: required for both login and signup ──
    try {
      passwordSchema.parse(password);
    } catch {
      failedFields.push('password');
    }

    // ── Signup-only optional fields ──
    if (action === 'signup') {
      if (display_name !== undefined && display_name !== '') {
        try {
          sanitized.display_name = displayNameSchema.parse(display_name);
        } catch {
          failedFields.push('display_name');
        }
      }
      if (username !== undefined && username !== '') {
        try {
          sanitized.username = usernameSchema.parse(username);
        } catch {
          failedFields.push('username');
        }
      }
    }

    // ── Generic response on any failure (field details logged only) ──
    if (failedFields.length > 0) {
      console.log(
        `[validateAuthInput] Validation failed: action=${action || 'unknown'}, ` +
        `fields=[${failedFields.join(', ')}]`
      );
      return Response.json(
        { valid: false, error: GENERIC_ERROR },
        { status: 400 }
      );
    }

    return Response.json({ valid: true, sanitized });
  } catch (error) {
    console.log(`[validateAuthInput] Server error: ${error.message}`);
    return Response.json(
      { valid: false, error: GENERIC_ERROR },
      { status: 400 }
    );
  }
});
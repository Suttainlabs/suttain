// Retired: a separate browser preflight cannot enforce limits on the
// platform authentication endpoint. Never trust forwarded headers or
// create privileged tracker records for unauthenticated requests.
export default async function(req) {
  return Response.json(
    { allowed: false, error: 'Use the platform authentication endpoint.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  );
}
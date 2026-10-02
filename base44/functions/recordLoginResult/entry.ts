// Retired: client-supplied outcomes do not prove an authentication failure
// or success. Only the platform authentication service can enforce its
// own attempt limits; this endpoint must not mutate accounts or send mail.
export default async function(req) {
  return Response.json(
    { error: 'Client-reported login outcomes are not accepted.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  );
}
// Healthcheck do container. Nao depende da API: responde se o Next esta de pe.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' });
}

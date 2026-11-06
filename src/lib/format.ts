/** Centavos -> "R$ 1.234,56". O banco guarda inteiro; a tela mostra formatado. */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

const TZ = 'America/Sao_Paulo';

/**
 * DIA puro (`@db.Date`, "2026-03-01" ou "2026-03-01T00:00:00.000Z") -> "01/03/2026".
 * Fatia o texto, NÃO usa `new Date`: no fuso de Brasília a meia-noite UTC vira o
 * dia anterior (armadilha 3 do todosDan-client).
 */
export function formatDay(value: string | null | undefined): string {
  if (!value) return '—';
  const [y, m, d] = value.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Data do banco (`@db.Date`) → "dd/mm/aaaa" para o campo; vazio fica "" (sem fuso). */
export function diaParaCampo(value: string | null | undefined): string {
  return value ? formatDay(value) : '';
}

/**
 * "01/05/1990" digitado -> "1990-05-01" para a API (`@db.Date`), sem `new Date`
 * no meio (fuso). Null se incompleta ou impossível (31/02).
 */
export function diaDigitadoParaIso(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const [, d, mo, y] = m;
  const check = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (check.getUTCDate() !== Number(d) || check.getUTCMonth() !== Number(mo) - 1) return null;
  return `${y}-${mo}-${d}`;
}

/** INSTANTE (`DateTime`: createdAt, updatedAt) -> "01/03/2026", no fuso de Brasília. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

/** INSTANTE -> "01/03/2026 12:05", no fuso de Brasília. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
  return parts.replace(',', '');
}

/** "Maria da Silva" → "MS": a bolinha de quem não tem foto. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

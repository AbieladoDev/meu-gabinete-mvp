import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatDay, diaDigitadoParaIso, diaParaCampo } from './format';

// Intl com locale pt-BR usa espaço não separável (U+00A0) entre "R$" e o número.
describe('formatCurrency', () => {
  it('formata centavos em real', () => {
    expect(formatCurrency(123456)).toBe('R$ 1.234,56');
  });

  it('formata zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });
});

describe('formatDay', () => {
  // Campo @db.Date chega como meia-noite UTC; com new Date() no fuso de
  // Brasília ele vira o dia ANTERIOR (armadilha 3 do todosDan-client).
  it('lê o dia pelo texto, sem fuso', () => {
    expect(formatDay('2026-03-01T00:00:00.000Z')).toBe('01/03/2026');
    expect(formatDay('2026-03-01')).toBe('01/03/2026');
  });

  it('vazio vira traço', () => {
    expect(formatDay(null)).toBe('—');
  });
});

describe('formatDate / formatDateTime', () => {
  it('instante (DateTime) no fuso de Brasília', () => {
    expect(formatDate('2026-03-01T02:30:00.000Z')).toBe('28/02/2026');
    expect(formatDateTime('2026-03-01T15:05:00.000Z')).toBe('01/03/2026 12:05');
  });

  it('vazio vira traço', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('diaDigitadoParaIso (data de nascimento do Meu perfil)', () => {
  it('converte dd/mm/aaaa em aaaa-mm-dd, sem passar por fuso', () => {
    expect(diaDigitadoParaIso('01/05/1990')).toBe('1990-05-01');
  });

  it('recusa data incompleta ou impossível', () => {
    expect(diaDigitadoParaIso('01/05/19')).toBeNull();
    expect(diaDigitadoParaIso('31/02/1990')).toBeNull();
    expect(diaDigitadoParaIso('')).toBeNull();
  });
});

// Bug do UserForm até 03/11/2026: lia a data com getDate() local e no Brasil
// mostrava 30/04 para 01/05 — e cada salvamento recuava um dia no banco.
describe('diaParaCampo (data do banco → campo dd/mm/aaaa)', () => {
  it('não recua um dia no fuso do Brasil', () => {
    expect(diaParaCampo('1990-05-01T00:00:00.000Z')).toBe('01/05/1990');
  });

  it('vazio fica vazio (não "—")', () => {
    expect(diaParaCampo(null)).toBe('');
  });
});

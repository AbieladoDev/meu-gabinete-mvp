import { describe, it, expect } from 'vitest';
import { rotaValida } from './voltar-para';

describe('rotaValida (volta para onde estava)', () => {
  it('aceita rota interna com filtro', () => {
    expect(rotaValida('/historico?acao=UPDATE')).toBe('/historico?acao=UPDATE');
  });

  it('recusa URL de fora e "//" (redirecionamento aberto)', () => {
    expect(rotaValida('https://golpe.com')).toBeNull();
    expect(rotaValida('//golpe.com')).toBeNull();
    expect(rotaValida('/\\golpe.com')).toBeNull();
  });

  it('não volta para as telas de entrada', () => {
    expect(rotaValida('/login')).toBeNull();
    expect(rotaValida('/session-expired?motivo=X')).toBeNull();
    expect(rotaValida(null)).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { mediaUrl } from './media-url';

describe('mediaUrl', () => {
  const base = 'https://midia.exemplo.com';

  it('monta a URL pública a partir da chave', () => {
    expect(mediaUrl('users/a.png', base)).toBe('https://midia.exemplo.com/users/a.png');
  });

  it('devolve null para vazio, null ou não-string', () => {
    expect(mediaUrl('', base)).toBeNull();
    expect(mediaUrl('   ', base)).toBeNull();
    expect(mediaUrl(null, base)).toBeNull();
    expect(mediaUrl(42, base)).toBeNull();
  });

  it('devolve null sem base configurada', () => {
    expect(mediaUrl('users/a.png', '')).toBeNull();
  });
});

import { LABEL_PALETTE } from '@opentask/contracts/projects/label';
import { describe, expect, it } from 'vitest';
import { contrastRatio, readableTextColor } from './color';
import { initialsOf } from './initials';
import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it('accepte les chemins internes', () => {
    expect(safeRedirect('/w/123/members?tab=1')).toBe('/w/123/members?tab=1');
  });

  it('refuse les redirections vers un autre site', () => {
    for (const target of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
      '',
    ]) {
      expect(safeRedirect(target)).toBe('/');
    }
    expect(safeRedirect(null, '/login')).toBe('/login');
  });
});

describe('couleurs des tags', () => {
  it.each(LABEL_PALETTE)('%s reste lisible (WCAG AA)', (color) => {
    expect(contrastRatio(color, readableTextColor(color))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('initiales', () => {
  it('garde deux initiales', () => {
    expect(initialsOf('Awa Koné Diallo')).toBe('AK');
    expect(initialsOf('')).toBe('?');
  });
});

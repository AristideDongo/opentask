import { describe, expect, it } from 'vitest';
import { extractMentionIds, formatMention, MAX_MENTIONS_PER_TEXT, splitMentions } from './mention';

describe('mentions', () => {
  it('extrait les identifiants mentionnés sans doublon', () => {
    expect(extractMentionIds('Salut <@u1> et <@u2>, <@u1> !')).toEqual(['u1', 'u2']);
    expect(extractMentionIds('pas de mention <@> ni <@a b>')).toEqual([]);
  });

  it('limite le nombre de mentions', () => {
    const body = Array.from({ length: 30 }, (_, i) => formatMention(`u${i}`)).join(' ');
    expect(extractMentionIds(body)).toHaveLength(MAX_MENTIONS_PER_TEXT);
  });

  it('découpe un texte en segments', () => {
    expect(splitMentions('Bonjour <@u1>, merci')).toEqual([
      { type: 'text', text: 'Bonjour ' },
      { type: 'mention', userId: 'u1' },
      { type: 'text', text: ', merci' },
    ]);
  });
});

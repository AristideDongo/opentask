import { describe, expect, it } from 'vitest';
import {
  formatFileSize,
  fromMentionMarkup,
  toAttachmentVM,
  toMentionMarkup,
  toTextSegments,
} from './content.mapper';

const people = [
  { id: 'u1', name: 'Alice Martin' },
  { id: 'u2', name: 'Alice' },
];

describe('mentions dans les textes', () => {
  it('transforme les @noms choisis en jetons, nom le plus long d’abord', () => {
    expect(toMentionMarkup('Merci @Alice Martin et @Alice !', people)).toBe(
      'Merci <@u1> et <@u2> !',
    );
    expect(toMentionMarkup('@Alicette reste du texte', people)).toBe('@Alicette reste du texte');
  });

  it('revient au texte éditable', () => {
    expect(fromMentionMarkup('Salut <@u1> et <@u9>', people)).toEqual({
      text: 'Salut @Alice Martin et ',
      picked: [{ id: 'u1', name: 'Alice Martin' }],
    });
  });

  it('découpe le texte affiché et repère les mentions qui me concernent', () => {
    expect(toTextSegments('Hé <@u2>, vu ?', people, 'u2')).toEqual([
      { type: 'text', text: 'Hé ' },
      { type: 'mention', id: 'u2', name: 'Alice', isMe: true },
      { type: 'text', text: ', vu ?' },
    ]);
  });
});

describe('fichiers', () => {
  it('formate les tailles', () => {
    expect(formatFileSize(512, 'fr')).toBe('512 o');
    expect(formatFileSize(1536, 'fr')).toBe('1,5 Ko');
    expect(formatFileSize(5 * 1024 * 1024, 'en')).toBe('5 MB');
  });

  it('autorise la suppression à l’auteur de l’envoi et aux administrateurs', () => {
    const attachment = {
      id: 'a1',
      fileName: 'a.png',
      mimeType: 'image/png',
      size: 10,
      isImage: true,
      url: '/x',
      uploadedBy: { id: 'u1', name: 'Alice' },
      createdAt: '2026-10-20T10:00:00.000Z',
    };
    expect(toAttachmentVM(attachment, { userId: 'u1', role: 'member' }).canDelete).toBe(true);
    expect(toAttachmentVM(attachment, { userId: 'u2', role: 'admin' }).canDelete).toBe(true);
    expect(toAttachmentVM(attachment, { userId: 'u2', role: 'member' }).canDelete).toBe(false);
  });
});

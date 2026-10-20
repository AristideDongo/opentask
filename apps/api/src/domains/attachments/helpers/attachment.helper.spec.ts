import { describe, expect, it } from 'vitest';
import {
  AttachmentDeleteForbiddenError,
  AttachmentNotFoundError,
} from '../errors/attachment.errors';
import {
  assertCanDeleteAttachment,
  assertCanReadAttachment,
  downloadHeaders,
  safeFileName,
  sniffImageType,
  storedFileFacts,
} from './attachment.helper';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

describe('fichiers joints', () => {
  it('reconnaît les images par leur contenu, pas par leur nom', () => {
    expect(sniffImageType(PNG)).toBe('image/png');
    expect(sniffImageType(JPEG)).toBe('image/jpeg');
    expect(sniffImageType(SVG)).toBeNull();
    expect(storedFileFacts('photo.png', 'image/png', SVG)).toEqual({
      fileName: 'photo.png',
      mimeType: 'image/png',
      isImage: false,
    });
    expect(storedFileFacts('capture.bin', 'application/octet-stream', PNG).isImage).toBe(true);
  });

  it('nettoie les noms de fichiers', () => {
    expect(safeFileName('../../etc/passwd')).toBe('passwd');
    expect(safeFileName('C:\\Users\\a\\rapport "final".pdf')).toBe('rapport final.pdf');
    expect(safeFileName('   ')).toBe('fichier');
    expect(safeFileName('a'.repeat(400))).toHaveLength(255);
  });

  it('n’affiche dans le navigateur que les vraies images', () => {
    const image = downloadHeaders({ fileName: 'été.png', mimeType: 'image/png', isImage: true });
    expect(image['Content-Type']).toBe('image/png');
    expect(image['Content-Disposition']).toBe(
      `inline; filename="_t_.png"; filename*=UTF-8''%C3%A9t%C3%A9.png`,
    );
    const html = downloadHeaders({ fileName: 'page.html', mimeType: 'text/html', isImage: false });
    expect(html['Content-Type']).toBe('application/octet-stream');
    expect(html['Content-Disposition']).toMatch(/^attachment;/);
    expect(html['X-Content-Type-Options']).toBe('nosniff');
  });

  it('réserve les fichiers d’un canal privé à ses membres', () => {
    const facts = (isPrivate: boolean, isChannelMember: boolean) => ({
      uploadedById: 'u1',
      taskId: null,
      message: { authorId: 'u1', channel: { isPrivate, isChannelMember } },
    });
    expect(() =>
      assertCanReadAttachment({ userId: 'u2', role: 'member' }, facts(false, false)),
    ).not.toThrow();
    expect(() =>
      assertCanReadAttachment({ userId: 'u2', role: 'admin' }, facts(true, false)),
    ).toThrow(AttachmentNotFoundError);
    expect(() =>
      assertCanReadAttachment({ userId: 'u2', role: 'guest' }, facts(false, false)),
    ).toThrow(AttachmentNotFoundError);
  });

  it('ne laisse lire un fichier pas encore utilisé qu’à son auteur', () => {
    const facts = { uploadedById: 'u1', taskId: null, message: null };
    expect(() => assertCanReadAttachment({ userId: 'u1', role: 'guest' }, facts)).not.toThrow();
    expect(() => assertCanReadAttachment({ userId: 'u2', role: 'owner' }, facts)).toThrow(
      AttachmentNotFoundError,
    );
  });

  it('autorise la suppression à l’auteur de l’envoi et aux administrateurs', () => {
    const facts = { uploadedById: 'u1', taskId: 't1', message: null };
    expect(() => assertCanDeleteAttachment({ userId: 'u1', role: 'member' }, facts)).not.toThrow();
    expect(() => assertCanDeleteAttachment({ userId: 'u2', role: 'admin' }, facts)).not.toThrow();
    expect(() => assertCanDeleteAttachment({ userId: 'u2', role: 'member' }, facts)).toThrow(
      AttachmentDeleteForbiddenError,
    );
  });
});

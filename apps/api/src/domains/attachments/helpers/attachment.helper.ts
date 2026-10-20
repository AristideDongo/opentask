import { INLINE_IMAGE_TYPES } from '@opentask/contracts/attachments/attachment';
import { isAtLeast } from '@opentask/contracts/workspaces/roles';
import { FALLBACK_FILE_NAME, MAX_FILE_NAME_LENGTH } from '../attachments.const';
import {
  AttachmentDeleteForbiddenError,
  AttachmentNotFoundError,
} from '../errors/attachment.errors';
import type {
  AttachmentAccessFacts,
  AttachmentActor,
  StoredFileFacts,
} from '../types/attachment.types';

const SIGNATURES: { mime: (typeof INLINE_IMAGE_TYPES)[number]; test: (b: Buffer) => boolean }[] = [
  {
    mime: 'image/png',
    test: (b) =>
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  { mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/gif',
    test: (b) => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii')),
  },
  {
    mime: 'image/webp',
    test: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export const sniffImageType = (content: Buffer) =>
  SIGNATURES.find((s) => s.test(content))?.mime ?? null;

export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const clean = Array.from(base)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 0x1f && code !== 0x7f && char !== '"';
    })
    .join('')
    .trim();
  return (clean || FALLBACK_FILE_NAME).slice(0, MAX_FILE_NAME_LENGTH);
}

const MIME_TOKEN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

export function storedFileFacts(
  originalName: string,
  declaredMime: string,
  content: Buffer,
): StoredFileFacts {
  const image = sniffImageType(content);
  return {
    fileName: safeFileName(originalName),
    mimeType:
      image ??
      (MIME_TOKEN.test(declaredMime) ? declaredMime.toLowerCase() : 'application/octet-stream'),
    isImage: image !== null,
  };
}

export function downloadHeaders(file: StoredFileFacts) {
  const ascii = file.fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(file.fileName);
  return {
    'Content-Type': file.isImage ? file.mimeType : 'application/octet-stream',
    'Content-Disposition': `${file.isImage ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${encoded}`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  };
}

export function canReadAttachment(actor: AttachmentActor, facts: AttachmentAccessFacts): boolean {
  if (facts.message) {
    const { channel } = facts.message;
    return channel.isChannelMember || (!channel.isPrivate && isAtLeast(actor.role, 'member'));
  }
  if (facts.taskId) return true;
  return facts.uploadedById === actor.userId;
}

export function assertCanReadAttachment<T extends AttachmentAccessFacts>(
  actor: AttachmentActor,
  facts: T | null,
): asserts facts is T {
  if (!facts || !canReadAttachment(actor, facts)) throw new AttachmentNotFoundError();
}

export function assertCanDeleteAttachment(
  actor: AttachmentActor,
  facts: AttachmentAccessFacts,
): void {
  if (facts.uploadedById !== actor.userId && !isAtLeast(actor.role, 'admin')) {
    throw new AttachmentDeleteForbiddenError();
  }
}

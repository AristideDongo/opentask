import type { Attachment } from '@opentask/contracts/attachments/attachment';
import { formatMention, splitMentions } from '@opentask/contracts/mentions/mention';
import { isAtLeast, type WorkspaceRole } from '@opentask/contracts/workspaces/roles';
import type { AttachmentVM, MentionRefVM, TextSegmentVM } from '../types/content.types';

export const toAttachmentVM = (
  a: Attachment,
  actor: { userId: string; role: WorkspaceRole },
): AttachmentVM => ({
  id: a.id,
  fileName: a.fileName,
  size: a.size,
  isImage: a.isImage,
  url: a.url,
  canDelete: a.uploadedBy?.id === actor.userId || isAtLeast(actor.role, 'admin'),
});

export function toTextSegments(
  body: string,
  mentions: MentionRefVM[],
  meId: string,
): TextSegmentVM[] {
  const names = new Map(mentions.map((m) => [m.id, m.name]));
  return splitMentions(body).map((segment) => {
    if (segment.type === 'text') return segment;
    const name = names.get(segment.userId);
    return name
      ? { type: 'mention', id: segment.userId, name, isMe: segment.userId === meId }
      : { type: 'text', text: '@?' };
  });
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function toMentionMarkup(text: string, picked: MentionRefVM[]): string {
  const byName = [...picked].sort((a, b) => b.name.length - a.name.length);
  return byName.reduce(
    (out, person) =>
      out.replace(
        new RegExp(`@${escapeRegExp(person.name)}(?![\\p{L}\\p{N}])`, 'gu'),
        formatMention(person.id),
      ),
    text,
  );
}

export function fromMentionMarkup(
  body: string,
  mentions: MentionRefVM[],
): { text: string; picked: MentionRefVM[] } {
  const names = new Map(mentions.map((m) => [m.id, m.name]));
  const picked = new Map<string, MentionRefVM>();
  const text = splitMentions(body)
    .map((segment) => {
      if (segment.type === 'text') return segment.text;
      const name = names.get(segment.userId);
      if (!name) return '';
      picked.set(segment.userId, { id: segment.userId, name });
      return `@${name}`;
    })
    .join('');
  return { text, picked: [...picked.values()] };
}

export function formatFileSize(bytes: number, locale: string): string {
  const units = locale === 'en' ? ['B', 'KB', 'MB', 'GB'] : ['o', 'Ko', 'Mo', 'Go'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}

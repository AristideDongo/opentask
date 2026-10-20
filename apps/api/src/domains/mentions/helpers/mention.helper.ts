import { splitMentions } from '@opentask/contracts/mentions/mention';
import { isAtLeast } from '@opentask/contracts/workspaces/roles';
import type { MentionCandidate, MentionRef } from '../types/mention.types';

const EXCERPT_LENGTH = 140;

export const canSeeChannel = (candidate: MentionCandidate, isPrivate: boolean) =>
  candidate.isChannelMember || (!isPrivate && isAtLeast(candidate.role, 'member'));

export function mentionExcerpt(body: string, mentions: MentionRef[]): string {
  const names = new Map(mentions.map((m) => [m.id, m.name]));
  const text = splitMentions(body)
    .map((segment) =>
      segment.type === 'text' ? segment.text : `@${names.get(segment.userId) ?? 'quelqu’un'}`,
    )
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text;
}

export function newlyMentioned(
  before: string[],
  after: MentionRef[],
  authorId: string,
): MentionRef[] {
  const previous = new Set(before);
  return after.filter((m) => m.id !== authorId && !previous.has(m.id));
}

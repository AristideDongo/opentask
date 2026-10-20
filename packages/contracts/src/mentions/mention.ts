export const MENTION_PATTERN = /<@([A-Za-z0-9-]{1,64})>/g;

export const MAX_MENTIONS_PER_TEXT = 20;

export const formatMention = (userId: string) => `<@${userId}>`;

export function extractMentionIds(body: string): string[] {
  const ids = new Set<string>();
  for (const match of body.matchAll(MENTION_PATTERN)) {
    if (match[1]) ids.add(match[1]);
    if (ids.size >= MAX_MENTIONS_PER_TEXT) break;
  }
  return [...ids];
}

export type MentionSegment = { type: 'text'; text: string } | { type: 'mention'; userId: string };

export function splitMentions(body: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let last = 0;
  for (const match of body.matchAll(MENTION_PATTERN)) {
    const at = match.index ?? 0;
    if (at > last) segments.push({ type: 'text', text: body.slice(last, at) });
    segments.push({ type: 'mention', userId: match[1] ?? '' });
    last = at + match[0].length;
  }
  if (last < body.length) segments.push({ type: 'text', text: body.slice(last) });
  return segments;
}

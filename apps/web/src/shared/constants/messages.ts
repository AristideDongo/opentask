import { enCore, frCore } from './messages/core.messages';
import { enWork, frWork } from './messages/work.messages';

export const fr = { ...frCore, ...frWork };
export type MessageKey = keyof typeof fr;
export const en: Record<MessageKey, string> = { ...enCore, ...enWork };

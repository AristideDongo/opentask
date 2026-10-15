import { enCore, frCore } from './messages/core.messages';
import { enIntegrations, frIntegrations } from './messages/integrations.messages';
import { enWork, frWork } from './messages/work.messages';

export const fr = { ...frCore, ...frWork, ...frIntegrations };
export type MessageKey = keyof typeof fr;
export const en: Record<MessageKey, string> = { ...enCore, ...enWork, ...enIntegrations };

import { toApiTokenVM } from '../mappers/api-token.mapper';
import { fetchApiTokens } from './profile.service';

export async function profileLoader() {
  const { items } = await fetchApiTokens();
  return { tokens: items.map((token) => toApiTokenVM(token)) };
}

import type { PersonVM } from './person.types';

export interface TeamVM {
  id: string;
  name: string;
  description: string;
  members: PersonVM[];
  projectCount: number;
}

import type { PersonVM } from '../../shared/types/person.types';

export interface TeamMemberRowVM extends PersonVM {
  email: string;
}

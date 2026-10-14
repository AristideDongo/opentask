import type { MessageKey } from '../../shared/constants/messages';
import type { MyTaskVM } from '../../shared/types/task.types';

export interface TaskGroupVM {
  key: Extract<MessageKey, `myTasks.${string}`>;
  items: MyTaskVM[];
}

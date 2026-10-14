import { useState } from 'react';
import type { TaskVM } from '../../../shared/types/task.types';

export function useOptimisticTasks(loaded: TaskVM[]) {
  const [tasks, setTasks] = useState(loaded);
  const [source, setSource] = useState(loaded);
  if (source !== loaded) {
    setSource(loaded);
    setTasks(loaded);
  }
  return [tasks, setTasks] as const;
}

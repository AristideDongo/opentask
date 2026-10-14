import { useRouteLoaderData } from 'react-router';
import { ROUTE_IDS } from '../constants/route-ids';
import type { ProjectVM } from '../types/project.types';

export const useOptionalProjectData = () =>
  useRouteLoaderData(ROUTE_IDS.project) as { project: ProjectVM } | undefined;

import { useRouteLoaderData } from 'react-router';
import { ROUTE_IDS } from '../constants/route-ids';
import type { WorkspaceData } from '../types/route-data.types';

export const useWorkspaceData = () => useRouteLoaderData(ROUTE_IDS.workspace) as WorkspaceData;

export const useOptionalWorkspaceData = () =>
  useRouteLoaderData(ROUTE_IDS.workspace) as WorkspaceData | undefined;

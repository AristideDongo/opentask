import { useRouteLoaderData } from 'react-router';
import { ROUTE_IDS } from '../constants/route-ids';
import type { SessionData } from '../types/route-data.types';

export const useSessionData = () => useRouteLoaderData(ROUTE_IDS.session) as SessionData;

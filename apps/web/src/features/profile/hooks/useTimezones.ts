import { useMemo } from 'react';

export const useTimezones = () => useMemo(() => Intl.supportedValuesOf('timeZone'), []);

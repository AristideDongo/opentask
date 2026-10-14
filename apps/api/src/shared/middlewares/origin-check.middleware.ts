import type { ApiError } from '@opentask/contracts/errors/api-error';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originCheck(publicUrl: string) {
  const allowed = new URL(publicUrl).origin;
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.headers.origin;
    const crossSite = req.headers['sec-fetch-site'] === 'cross-site';
    if ((origin && origin !== allowed) || crossSite) {
      const body: ApiError = {
        error: {
          code: 'FORBIDDEN',
          message: 'Origine de la requête non autorisée.',
          requestId: String(req.id ?? ''),
        },
      };
      res.status(403).json(body);
      return;
    }
    next();
  };
}

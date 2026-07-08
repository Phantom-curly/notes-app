import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}
export declare const authenticate: (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map

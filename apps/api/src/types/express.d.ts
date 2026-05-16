import type { RequestHandler } from "express";

declare module "cookie-parser" {
  function cookieParser(secret?: string | string[], options?: Record<string, unknown>): RequestHandler;
  export default cookieParser;
}

declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
      signedCookies?: Record<string, string>;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

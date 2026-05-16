export {};

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

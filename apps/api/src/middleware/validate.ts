import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type RequestSource = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    req[source] = result.data;
    next();
  };

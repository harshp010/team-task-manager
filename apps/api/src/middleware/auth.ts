import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { verifyAuthToken } from "../utils/jwt.js";

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) return undefined;
  return authorization.slice("Bearer ".length);
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.auth_token ?? getBearerToken(req.headers.authorization);

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      throw new HttpError(401, "Invalid authentication token");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid authentication token"));
  }
};

import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getCurrentUser, login, signup } from "./auth.service.js";

const cookieOptions = (): CookieOptions => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    domain: env.COOKIE_DOMAIN
  };
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("auth_token", token, cookieOptions());
};

export const signupController = asyncHandler(async (req: Request, res: Response) => {
  const result = await signup(req.body);
  setAuthCookie(res, result.token);

  res.status(201).json(result);
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  setAuthCookie(res, result.token);

  res.json(result);
});

export const logoutController = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    ...cookieOptions(),
    maxAge: undefined
  });

  res.status(204).send();
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  res.json({ user });
});

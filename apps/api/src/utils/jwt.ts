import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

export const signAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as SignOptions);
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
};

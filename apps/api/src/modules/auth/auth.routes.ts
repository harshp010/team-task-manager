import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  loginController,
  logoutController,
  meController,
  signupController
} from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.schemas.js";

export const authRoutes = Router();

authRoutes.post("/signup", validate(signupSchema), signupController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.post("/logout", requireAuth, logoutController);
authRoutes.get("/me", requireAuth, meController);

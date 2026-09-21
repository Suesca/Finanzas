import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma";
import { env } from "../env";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { AUTH_COOKIE_NAME, requireAuth } from "../middleware/auth";

export const authRouter = Router();

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const loginSchema = z.object({
  pin: z.string().min(1, "El PIN es obligatorio"),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { pin } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst();
    if (!user) {
      throw new ApiError(500, "No hay un usuario configurado. Corre el seed del proyecto.");
    }

    const isValid = await bcrypt.compare(pin, user.pinHash);
    if (!isValid) {
      throw new ApiError(401, "PIN incorrecto");
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "30d" });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      maxAge: THIRTY_DAYS_MS,
    });

    res.json({ ok: true });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ ok: true });
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ userId: req.userId });
  })
);

import { Router } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { syncBankData } from "../services/sync.service";

export const bankRouter = Router();

bankRouter.get(
  "/connections",
  asyncHandler(async (_req, res) => {
    const connections = await prisma.bankConnection.findMany({ include: { accounts: true } });
    res.json(connections);
  })
);

bankRouter.get(
  "/accounts",
  asyncHandler(async (_req, res) => {
    const accounts = await prisma.bankAccount.findMany({ include: { bankConnection: true } });
    res.json(accounts);
  })
);

bankRouter.post(
  "/sync",
  asyncHandler(async (_req, res) => {
    const result = await syncBankData();
    if (!result.ok) {
      return res.status(502).json({ error: result.error });
    }
    res.json(result);
  })
);

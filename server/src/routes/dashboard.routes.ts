import { Router } from "express";
import { computeBudgetSummary } from "../services/budget.service";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const month = req.query.month as string | undefined;
    const summary = await computeBudgetSummary(month);
    res.json(summary);
  })
);

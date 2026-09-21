import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { incomesRouter } from "./routes/incomes.routes";
import { fixedExpensesRouter } from "./routes/fixedExpenses.routes";
import { savingsRulesRouter } from "./routes/savingsRules.routes";
import { debtsRouter } from "./routes/debts.routes";
import { categoriesRouter } from "./routes/categories.routes";
import { quickTemplatesRouter } from "./routes/quickTemplates.routes";
import { transactionsRouter } from "./routes/transactions.routes";
import { bankRouter } from "./routes/bank.routes";
import { requireAuth } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  // Necesario detrás de un proxy TLS-terminating como el de Render, para
  // que Express detecte correctamente conexiones HTTPS (cookies "Secure",
  // IPs de cliente, etc.).
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", requireAuth, dashboardRouter);
  app.use("/api/incomes", requireAuth, incomesRouter);
  app.use("/api/fixed-expenses", requireAuth, fixedExpensesRouter);
  app.use("/api/savings-rules", requireAuth, savingsRulesRouter);
  app.use("/api/debts", requireAuth, debtsRouter);
  app.use("/api/categories", requireAuth, categoriesRouter);
  app.use("/api/quick-templates", requireAuth, quickTemplatesRouter);
  app.use("/api/transactions", requireAuth, transactionsRouter);
  app.use("/api/bank", requireAuth, bankRouter);

  app.use("/api", notFoundHandler);

  // En producción, el mismo servidor sirve el build estático del cliente
  // (una sola URL, sin problemas de CORS/cookies entre orígenes).
  const clientDist = path.resolve(__dirname, "../../client/dist");
  if (env.NODE_ENV === "production" && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}

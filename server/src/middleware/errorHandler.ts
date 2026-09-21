import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/asyncHandler";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error("Error inesperado:", err);
  const message = err instanceof Error ? err.message : "Error inesperado del servidor";
  return res.status(500).json({ error: message });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

import type { Express } from "express";
import type { Server } from "http";
import { requireAuth } from "./auth";
import { storage } from "./storage";
import { w2FormSchema, identityFormSchema } from "@shared/types/w2-validation";
import { createEmptyReturnData, createEmptyW2, createEmptyPerson } from "@shared/types/pipeline";
import type { ReturnData } from "@shared/types/pipeline";
import { processW2s } from "./processing/w2-processor";
import { z } from "zod";
import crypto from "crypto";

async function runProcessing(returnId: number, userId: number) {
  const taxReturn = await storage.getReturn(returnId, userId);
  if (!taxReturn) return;

  const returnData = taxReturn.returnData as ReturnData;
  const processed = processW2s(returnData);

  (returnData as any).income = processed.income;
  (returnData as any).payments = processed.payments;
  (returnData as any).provenance = processed.provenance;
  (returnData as any).diagnostics = processed.diagnostics;

  await storage.updateReturnData(returnId, userId, returnData);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/returns", requireAuth, async (req, res) => {
    const returns = await storage.listReturns(req.session.userId!);
    res.json(returns);
  });

  app.post("/api/returns", requireAuth, async (req, res) => {
    const taxYear = req.body.taxYear || 2023;
    const returnData = createEmptyReturnData();

    const taxReturn = await storage.createReturn({
      userId: req.session.userId!,
      taxYear,
      returnData,
      status: "draft",
    });

    res.status(201).json(taxReturn);
  });

  app.get("/api/returns/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    const taxReturn = await storage.getReturn(id, req.session.userId!);
    if (!taxReturn) return res.status(404).json({ message: "Return not found" });

    res.json(taxReturn);
  });

  app.delete("/api/returns/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    await storage.deleteReturn(id, req.session.userId!);
    res.status(204).send();
  });

  app.put("/api/returns/:id/identity", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    try {
      const input = identityFormSchema.parse(req.body);

      const taxReturn = await storage.getReturn(id, req.session.userId!);
      if (!taxReturn) return res.status(404).json({ message: "Return not found" });

      const returnData = taxReturn.returnData as ReturnData;

      returnData.identity.taxpayer.name.first_name = input.taxpayer_first_name;
      returnData.identity.taxpayer.name.middle_name = input.taxpayer_middle_name ?? null;
      returnData.identity.taxpayer.name.last_name = input.taxpayer_last_name;
      returnData.identity.taxpayer.ssn = input.taxpayer_ssn ?? null;

      if (input.spouse_first_name && input.spouse_last_name) {
        if (!returnData.identity.spouse) {
          returnData.identity.spouse = createEmptyPerson("spouse");
        }
        returnData.identity.spouse.name.first_name = input.spouse_first_name;
        returnData.identity.spouse.name.middle_name = input.spouse_middle_name ?? null;
        returnData.identity.spouse.name.last_name = input.spouse_last_name;
        returnData.identity.spouse.ssn = input.spouse_ssn ?? null;
      } else {
        returnData.identity.spouse = null;
      }

      returnData.identity.address.address_raw = input.address ?? null;
      returnData.identity.phone = input.phone ?? null;
      returnData.identity.email = input.email ?? null;

      const updated = await storage.updateReturnData(id, req.session.userId!, returnData);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get("/api/returns/:id/w2", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    const taxReturn = await storage.getReturn(id, req.session.userId!);
    if (!taxReturn) return res.status(404).json({ message: "Return not found" });

    const returnData = taxReturn.returnData as ReturnData;
    res.json(returnData.documents.w2);
  });

  app.post("/api/returns/:id/w2", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    try {
      const input = w2FormSchema.parse(req.body);

      const taxReturn = await storage.getReturn(id, req.session.userId!);
      if (!taxReturn) return res.status(404).json({ message: "Return not found" });

      const returnData = taxReturn.returnData as ReturnData;
      const docId = crypto.randomUUID();
      const w2 = createEmptyW2(docId);

      Object.assign(w2, {
        ...input,
        document_id: docId,
        document_type: "W-2" as const,
        source_type: "manual_entry" as const,
        tax_year: 2023,
        issuer_name: input.employer_name,
        recipient_name: `${input.employee_first_name} ${input.employee_last_name}`,
        recipient_tin: input.employee_ssn,
        employee_name: [input.employee_first_name, input.employee_middle_initial, input.employee_last_name, input.employee_suffix]
          .filter(Boolean).join(" "),
      });

      returnData.documents.w2.push(w2);
      await storage.updateReturnData(id, req.session.userId!, returnData);
      await runProcessing(id, req.session.userId!);

      res.status(201).json(w2);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
      }
      throw err;
    }
  });

  app.put("/api/returns/:id/w2/:docId", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });
    const docId = req.params.docId;

    try {
      const input = w2FormSchema.parse(req.body);

      const taxReturn = await storage.getReturn(id, req.session.userId!);
      if (!taxReturn) return res.status(404).json({ message: "Return not found" });

      const returnData = taxReturn.returnData as ReturnData;
      const idx = returnData.documents.w2.findIndex((w) => w.document_id === docId);
      if (idx === -1) return res.status(404).json({ message: "W-2 not found" });

      const existing = returnData.documents.w2[idx];
      Object.assign(existing, {
        ...input,
        document_id: docId,
        document_type: "W-2" as const,
        source_type: "manual_entry" as const,
        tax_year: 2023,
        issuer_name: input.employer_name,
        recipient_name: `${input.employee_first_name} ${input.employee_last_name}`,
        recipient_tin: input.employee_ssn,
        employee_name: [input.employee_first_name, input.employee_middle_initial, input.employee_last_name, input.employee_suffix]
          .filter(Boolean).join(" "),
      });

      await storage.updateReturnData(id, req.session.userId!, returnData);
      await runProcessing(id, req.session.userId!);

      res.json(existing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
      }
      throw err;
    }
  });

  app.delete("/api/returns/:id/w2/:docId", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });
    const docId = req.params.docId;

    const taxReturn = await storage.getReturn(id, req.session.userId!);
    if (!taxReturn) return res.status(404).json({ message: "Return not found" });

    const returnData = taxReturn.returnData as ReturnData;
    const idx = returnData.documents.w2.findIndex((w) => w.document_id === docId);
    if (idx === -1) return res.status(404).json({ message: "W-2 not found" });

    returnData.documents.w2.splice(idx, 1);
    await storage.updateReturnData(id, req.session.userId!, returnData);
    await runProcessing(id, req.session.userId!);

    res.status(204).send();
  });

  app.get("/api/returns/:id/processing", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid return ID" });

    const taxReturn = await storage.getReturn(id, req.session.userId!);
    if (!taxReturn) return res.status(404).json({ message: "Return not found" });

    const returnData = taxReturn.returnData as any;
    res.json({
      income: returnData.income || null,
      payments: returnData.payments || null,
      provenance: returnData.provenance || [],
      diagnostics: returnData.diagnostics || { errors: [], warnings: [], corrections: [], open_questions: [], duplicate_entities: [], ambiguities: [] },
    });
  });

  return httpServer;
}

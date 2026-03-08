
import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // e.g., "Add", "Subtract", "Difference"
  input1: text("input1").notNull(),       // e.g., "Ad3n5"
  input2: text("input2").notNull(),       // e.g., "50" or "Be1a1"
  result: text("result").notNull(),       // e.g., "Ad4a1" or "1250"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHistorySchema = createInsertSchema(history).omit({ 
  id: true, 
  createdAt: true 
});

export type HistoryItem = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;

// Request Types
export type CreateHistoryRequest = InsertHistory;

// Coordinate System Configuration
export const INV_CONFIG = {
  RACKS: 52,    // a-z, A-Z
  SHELVES: 20,  // a-t
  TRAYS: 4,     // 1-4
  BINS: 15,     // a-o
  ITEMS: 5      // 1-5
};

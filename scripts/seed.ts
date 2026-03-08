
import { storage } from "../server/storage";
import { db } from "../server/db";

async function seed() {
  console.log("Seeding history...");
  
  // Add some sample calculations
  await storage.createHistory({
    operation: "Add Items",
    input1: "Ad3n5",
    input2: "500",
    result: "Ae1a5" // Hypothetical result
  });

  await storage.createHistory({
    operation: "Difference",
    input1: "Ad3n5",
    input2: "Be1a1",
    result: "12500" // Hypothetical result
  });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

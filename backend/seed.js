import { createDocument, saveToDatabase } from "./assemblyModule.js";

async function seed() {
  try {
    // Seed content table
    await saveToDatabase("welcome", "Welcome to AetherPress!");
    await saveToDatabase("about", "This is a seeded content entry.");

    // Seed documents table
    await createDocument(
      "Sample Document 1",
      "This is the content of sample document 1."
    );
    await createDocument(
      "Sample Document 2",
      "This is the content of sample document 2."
    );
    await createDocument(
      "Getting Started",
      "Instructions for getting started with AetherPress."
    );

    console.log("Database seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();

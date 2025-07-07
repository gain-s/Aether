import express from "express";
import cors from "cors";
import { handleContent } from "./contentModule.js";
import { handleImageGeneration } from "./imageModule.js";
import { generateLayout } from "./layoutModule.js";
import {
  saveToDatabase,
  fetchFromDatabase,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
} from "./assemblyModule.js";
import { exportToPDF } from "./pdfModule.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, "frontend/build")));

// Add specific route for manifest.json before other routes
app.get("/manifest.json", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.sendFile(path.join(__dirname, "frontend", "public", "manifest.json"));
});

// Updated error-handling middleware to use the `error` parameter
app.use((err, req, res, next) => {
  console.error(`Error occurred during request: ${req.method} ${req.url}`);
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
// Updated Prompt -> AI Processing with validation
app.post("/prompt", async (req, res) => {
  console.log("Handling /prompt request");
  const { prompt } = req.body;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res
      .status(400)
      .json({ error: "Prompt is required and must be a non-empty string." });
  }
  try {
    const aiContent = await handleContent(prompt);
    saveToDatabase("content", aiContent);
    res.json({ content: aiContent });
  } catch (error) {
    console.error("Error in /prompt route:", error);
    res
      .status(500)
      .json({ error: "AI processing failed. Please try again later." });
  }
});

// Updated Preview with validation
app.get("/preview", async (req, res) => {
  console.log("Handling /preview request");
  try {
    const content = await fetchFromDatabase("content");
    if (!content) {
      return res
        .status(404)
        .json({ error: "No content found. Please submit a prompt first." });
    }
    const images = await handleImageGeneration("example query");
    const layout = generateLayout(content, images);
    res.send(layout);
  } catch (error) {
    console.error("Error in /preview route:", error);
    res
      .status(500)
      .json({ error: "Preview generation failed. Please try again later." });
  }
});

// Basic Override with validation
app.post("/override", (req, res) => {
  const { content, override } = req.body;
  if (
    typeof content !== "string" ||
    typeof override !== "string" ||
    !content.trim() ||
    !override.trim()
  ) {
    return res.status(400).json({
      error:
        "Both content and override are required and must be non-empty strings.",
    });
  }
  const updatedContent = `${content} ${override}`;
  res.json({ updatedContent });
});

// Updated PDF Export with validation
app.get("/export", async (req, res) => {
  console.log("Handling /export request");
  try {
    const content = await fetchFromDatabase("content");
    if (!content) {
      return res.status(404).json({
        error: "No content found to export. Please submit a prompt first.",
      });
    }
    const pdfBuffer = await exportToPDF(content);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in /export route:", error);
    res
      .status(500)
      .json({ error: "PDF generation failed. Please try again later." });
  }
});

// Test route for database integration with validation
app.get("/test-db", (req, res) => {
  console.log("Handling /test-db request");
  const testKey = "testKey";
  const testValue = "This is a test value";
  try {
    saveToDatabase(testKey, testValue);
    fetchFromDatabase(testKey)
      .then((value) => {
        if (value) {
          res.json({ message: "Database test successful", value });
        } else {
          res.status(500).json({ error: "Failed to fetch from database" });
        }
      })
      .catch((err) => {
        console.error("Error in /test-db route:", err);
        res.status(500).json({ error: "Database operation failed." });
      });
  } catch (error) {
    console.error("Error in /test-db route:", error);
    res.status(500).json({ error: "Database operation failed." });
  }
});

// Document CRUD endpoints
app.post("/documents", async (req, res) => {
  const { title, content } = req.body;
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    return res.status(400).json({
      error: "Title and content are required and must be non-empty strings.",
    });
  }
  try {
    const doc = await createDocument(title, content);
    res.status(201).json(doc);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document." });
  }
});

app.get("/documents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await getDocument(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found." });
    }
    res.json(doc);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document." });
  }
});

app.put("/documents/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof content !== "string" ||
    !content.trim()
  ) {
    return res.status(400).json({
      error: "Title and content are required and must be non-empty strings.",
    });
  }
  try {
    const doc = await updateDocument(id, title, content);
    res.json(doc);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Failed to update document." });
  }
});

app.delete("/documents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDocument(id);
    res.json({ message: "Document deleted.", id });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document." });
  }
});

app.get("/documents", async (req, res) => {
  try {
    const docs = await listDocuments();
    res.json(docs);
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ error: "Failed to list documents." });
  }
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`AetherPress prototype listening on port ${port}`);
});

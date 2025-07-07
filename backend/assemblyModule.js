import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable for DB path, fallback to default
const dbPath =
  process.env.AETHERPRESS_DB_PATH ||
  path.resolve(__dirname, "../data/aetherpress.db");

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
    db.run(
      `CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        }
      }
    );

    // Create documents table
    db.run(
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        preview_html TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Error creating documents table:", err.message);
        } else {
          console.log("Documents table ready");
        }
      }
    );
  }
});

// Database operations
function saveToDatabase(key, value) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO content (key, value) VALUES (?, ?) 
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value`;
    db.run(query, [key, value], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function fetchFromDatabase(key) {
  return new Promise((resolve, reject) => {
    const query = `SELECT value FROM content WHERE key = ?`;
    db.get(query, [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : null);
    });
  });
}

// Check if title exists
async function checkTitleExists(title) {
  return new Promise((resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM documents WHERE title = ?`;
    db.get(query, [title], (err, row) => {
      if (err) reject(err);
      else resolve(row.count > 0);
    });
  });
}

// Enhanced document creation with validation
async function createDocument(title, content) {
  if (!title?.trim() || !content?.trim()) {
    throw new Error("Title and content are required");
  }

  const titleExists = await checkTitleExists(title);
  if (titleExists) {
    throw new Error("A document with this title already exists");
  }

  return new Promise((resolve, reject) => {
    const query = `INSERT INTO documents (
      title, 
      content, 
      preview_html,
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

    // Store both content and its preview
    const previewHtml = generatePreview(content);

    db.run(query, [title, content, previewHtml], function (err) {
      if (err) reject(err);
      else
        resolve({
          id: this.lastID,
          title,
          content,
          preview_html: previewHtml,
          created_at: new Date().toISOString(),
        });
    });
  });
}

// Helper function to generate preview HTML
function generatePreview(content) {
  return `<div class="preview">${content}</div>`;
}

function getDocument(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM documents WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function updateDocument(id, title, content) {
  return new Promise((resolve, reject) => {
    // Validation: Ensure id is a positive integer, title/content are non-empty strings
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return reject(new Error("A valid document id is required"));
    }
    if (typeof title !== "string" || !title.trim()) {
      return reject(
        new Error("Title is required and must be a non-empty string")
      );
    }
    if (typeof content !== "string" || !content.trim()) {
      return reject(
        new Error("Content is required and must be a non-empty string")
      );
    }
    // Optionally, add length/format checks here
    const query = `UPDATE documents SET title = ?, content = ?, 
                  updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [title, content, id], function (err) {
      if (err) {
        // Handle unique constraint violation for title
        if (
          err.message &&
          err.message.includes("UNIQUE constraint failed: documents.title")
        ) {
          return reject(new Error("A document with this title already exists"));
        }
        return reject(err);
      }
      if (this.changes === 0) {
        return reject(new Error("No document found with the given id"));
      }
      resolve({ id, title, content });
    });
  });
}

function deleteDocument(id) {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM documents WHERE id = ?`;
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve({ id });
    });
  });
}

function listDocuments() {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM documents ORDER BY updated_at DESC`;
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export {
  saveToDatabase,
  fetchFromDatabase,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
};

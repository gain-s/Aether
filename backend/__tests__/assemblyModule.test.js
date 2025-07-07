import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments,
  saveToDatabase,
  fetchFromDatabase,
} from "../assemblyModule.js";

// Simple async test runner
async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✔ ${name}`);
  } catch (err) {
    console.error(`✖ ${name}`);
    console.error("  ", err.message);
  }
}

(async () => {
  // Test content table
  await runTest("saveToDatabase and fetchFromDatabase", async () => {
    await saveToDatabase("testkey", "testvalue");
    const value = await fetchFromDatabase("testkey");
    if (value !== "testvalue") throw new Error("Value mismatch");
  });

  // Test document creation
  let docId;
  await runTest("createDocument", async () => {
    const doc = await createDocument("Test Title", "Test Content");
    docId = doc.id;
    if (!docId) throw new Error("No document id returned");
  });

  // Test getDocument
  await runTest("getDocument", async () => {
    const doc = await getDocument(docId);
    if (!doc || doc.title !== "Test Title")
      throw new Error("Document not found or title mismatch");
  });

  // Test updateDocument
  await runTest("updateDocument", async () => {
    const updated = await updateDocument(
      docId,
      "Updated Title",
      "Updated Content"
    );
    if (updated.title !== "Updated Title") throw new Error("Title not updated");
  });

  // Test listDocuments
  await runTest("listDocuments", async () => {
    const docs = await listDocuments();
    if (!Array.isArray(docs) || docs.length === 0)
      throw new Error("No documents found");
  });

  // Test deleteDocument
  await runTest("deleteDocument", async () => {
    const result = await deleteDocument(docId);
    if (result.id !== docId) throw new Error("Document not deleted");
  });

  // Test validation: createDocument with empty title
  await runTest("createDocument validation (empty title)", async () => {
    let threw = false;
    try {
      await createDocument("", "Content");
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("Validation did not throw for empty title");
  });

  // Test validation: updateDocument with empty content
  await runTest("updateDocument validation (empty content)", async () => {
    let threw = false;
    try {
      await updateDocument(9999, "Title", "");
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("Validation did not throw for empty content");
  });
})();

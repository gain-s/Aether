import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

const baseUrl = "http://localhost:3000";

describe("API: /prompt (AI Processing Layer)", () => {
  let createdPromptIds = [];

  // Verify server is running before tests
  beforeAll(async () => {
    try {
      const res = await request(baseUrl).get("/health");
      expect(res.status).toBe(200);
    } catch (error) {
      throw new Error("Server must be running on " + baseUrl);
    }
  });

  // Cleanup any test prompts
  afterAll(async () => {
    for (const id of createdPromptIds) {
      try {
        await request(baseUrl).delete(`/api/prompts/${id}`);
      } catch (error) {
        console.warn("Cleanup failed for prompt:", id);
      }
    }
  });

  it("should return a structured AI response for a valid prompt", async () => {
    const testPrompt = "Write a poem about the sea.";
    const res = await request(baseUrl)
      .post("/prompt")
      .send({ prompt: testPrompt });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("result");
    expect(res.body).toHaveProperty("meta");
    expect(res.body).toHaveProperty("promptId");

    // Content validation
    expect(typeof res.body.result).toBe("string");
    expect(res.body.result.length).toBeGreaterThan(0);

    // Meta validation
    expect(res.body.meta).toHaveProperty("provider", "mock");
    expect(res.body.meta).toHaveProperty("timestamp");
    expect(res.body.meta).toHaveProperty("tokens");

    // Store ID for cleanup
    createdPromptIds.push(res.body.promptId);

    // Verify prompt was stored
    const stored = await request(baseUrl).get(
      `/api/prompts/${res.body.promptId}`
    );
    expect(stored.status).toBe(200);
    expect(stored.body.prompt).toBe(testPrompt);
  });

  it("should return 400 for missing or empty prompt", async () => {
    const res = await request(baseUrl).post("/prompt").send({ prompt: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for missing prompt field", async () => {
    const res = await request(baseUrl).post("/prompt").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for invalid prompt type", async () => {
    const res = await request(baseUrl)
      .post("/prompt")
      .send({ prompt: { invalid: "object" } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

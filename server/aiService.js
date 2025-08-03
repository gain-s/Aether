// AI Service Abstraction for AetherPressDeux
// This module defines the interface and mock implementation for AI-powered content generation.

class AIService {
  /**
   * Generate text content from a prompt.
   * @param {string} prompt - The user prompt.
   * @returns {Promise<{ result: string, meta?: object }>} - Structured AI response.
   */
  async generateText(prompt) {
    throw new Error("Not implemented");
  }
}

// Mock implementation for development and testing
class MockAIService extends AIService {
  async generateText(prompt) {
    // Simulate realistic, structured AI output
    return {
      result: `AI (mock) response to: "${prompt}"`,
      meta: {
        provider: "mock",
        timestamp: new Date().toISOString(),
        tokens: prompt.split(/\s+/).length,
      },
    };
  }
}

module.exports = {
  AIService,
  MockAIService,
};

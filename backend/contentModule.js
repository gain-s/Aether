import * as aiService from "../shared/aiService.js";
const { generateText } = aiService;

async function handleContent(prompt) {
  return await generateText(prompt);
}

export { handleContent };

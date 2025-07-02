import OpenAI from "openai";
import config from "config";

import prompts from "../../../..//constants/prompts.js";

const client = new OpenAI({
  apiKey: config.get("OPENAI_API_KEY"),
});

const chatGPT = async (message) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1",
      instructions: prompts.SYSTEM_PROMPT,
      input: `${message}`.slice(0, 30000),
    });

    console.log(response.output_text);
    return response.output_text;
  } catch (error) {
    console.error("Error during chat:", error);
  }
  return "";
};

const chatService = {
  chatGPT,
};

export default chatService;

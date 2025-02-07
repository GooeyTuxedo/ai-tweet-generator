"use server"

import type { TweetRequest } from "@/types/tweet"
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createStreamableValue } from "ai/rsc"

const { USE_OLLAMA, OPENAI_API_KEY } = process.env;

// Create a configurable AI client
const aiClient = createOpenAI({
  baseURL: USE_OLLAMA === "true" ? "http://localhost:11434/v1" : "https://api.openai.com/v1",
  apiKey:
    USE_OLLAMA === "true"
      ? "ollama" // Ollama doesn't require an API key, but we need to provide a non-empty string
      : OPENAI_API_KEY,
})

export type Message = {
  role: "user" | "assistant"
  content: string
}

export async function generateTweet(data: TweetRequest) {
  const stream = createStreamableValue("")

  const prompt = `Generate a tweet about "${data.topic}". 
    The tweet should be in the style of a "${data.type}".
    Additional instructions: ${data.instructions}
    Keep it under 280 characters.`
  ;(async () => {
    const { textStream } = streamText({
      model: aiClient(USE_OLLAMA === "true" ? "tinyllama" : "gpt-4o-mini"),
      messages: [{ role: "user", content: prompt }],
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}


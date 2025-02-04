"use server"

import type { TweetRequest, TweetResponse } from "@/types/tweet"

export async function generateTweets(data: TweetRequest): Promise<TweetResponse> {
  try {
    const isOllama = process.env.USE_OLLAMA === "true"
    const apiUrl = isOllama ? "http://localhost:11434/api/generate" : "https://api.openai.com/v1/chat/completions"

    const prompt = `Generate a tweet about "${data.topic}". 
      The tweet should be in the style of a "${data.type}".
      Additional instructions: ${data.instructions}
      Keep it under 280 characters.`

    if (isOllama) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tinyllama",
          prompt: prompt,
          stream: false,
        }),
      })
      const result = await response.json()
      return { tweets: [result.response] }
    } else {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 100,
        }),
      })
      const result = await response.json()
      return { tweets: [result.choices[0].message.content] }
    }
  } catch (error) {
    return { tweets: [], error: "Failed to generate tweet" }
  }
}


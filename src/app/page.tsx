"use client"

import { useState } from "react"
import { Bookmark, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TweetRequest, TweetType } from "@/types/tweet"
import { generateTweets } from "./actions"

export default function TweetGenerator() {
  const [isLoading, setIsLoading] = useState(false)
  const [tweets, setTweets] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const data: TweetRequest = {
      instructions: formData.get("instructions") as string,
      topic: formData.get("topic") as string,
      type: formData.get("type") as TweetType,
    }

    const response = await generateTweets(data)
    setIsLoading(false)

    if (response.error) {
      setError(response.error)
    } else {
      setTweets(response.tweets)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container flex justify-center">
        <div className="w-full max-w-2xl py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">AI Tweet Generator</h1>
              <p className="text-muted-foreground">Generate engaging Twitter posts with AI</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="instructions">Custom Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Add any custom writing instructions that will be applied to all generations..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" name="topic" placeholder="Enter your topic..." required />
                </div>

                <div className="space-y-2">
                  <Label>Tweet Type</Label>
                  <ToggleGroup type="single" defaultValue="Statement" className="justify-start">
                    <ToggleGroupItem value="Statement">Statement</ToggleGroupItem>
                    <ToggleGroupItem value="Question">Question</ToggleGroupItem>
                    <ToggleGroupItem value="Opinion">Opinion</ToggleGroupItem>
                    <ToggleGroupItem value="Announcement">Announcement</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Tweets"}
                </Button>
              </form>

              {error && <div className="mt-4 p-4 text-red-600 bg-red-50 rounded-md">{error}</div>}

              {tweets.length > 0 && (
                <div className="mt-6 space-y-4">
                  {tweets.map((tweet, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <p>{tweet}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}


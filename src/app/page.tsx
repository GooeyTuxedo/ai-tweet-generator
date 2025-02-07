"use client"

import { useState } from "react"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { Bookmark, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { readStreamableValue } from "ai/rsc"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TweetRequest, TweetType } from "@/types/tweet"
import { generateTweet } from "./actions"
import { Spinner } from "@/components/ui/spinner"
import { CharacterCounter } from "@/components/ui/character-counter"

export default function TweetGenerator() {
  const [isLoading, setIsLoading] = useState(false)
  const [streamedTweet, setStreamedTweet] = useState("")
  const [error, setError] = useState<string>("")
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TweetRequest>({
    defaultValues: {
      type: "Statement",
    },
  })

  const onSubmit: SubmitHandler<TweetRequest> = async (data) => {
    setIsLoading(true)
    setError("")
    setStreamedTweet("")

    try {
      const { output } = await generateTweet(data)

      let textContent = ""
      for await (const delta of readStreamableValue(output)) {
        textContent = `${textContent}${delta}`
        setStreamedTweet(textContent)
      }
    } catch (err) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container flex justify-center">
        <div className="w-full max-w-2xl py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
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
          </motion.div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="instructions">Custom Instructions</Label>
                  <Textarea
                    id="instructions"
                    {...register("instructions")}
                    placeholder="Add any custom writing instructions that will be applied to all generations..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    {...register("topic", { required: "Topic is required" })}
                    placeholder="Enter your topic..."
                  />
                  {errors.topic && <p className="text-red-500 text-sm">{errors.topic.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Tweet Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Tweet type is required" }}
                    render={({ field }) => (
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as TweetType)}
                        className="justify-start"
                      >
                        {["Statement", "Question", "Opinion", "Announcement"].map((type) => (
                          <ToggleGroupItem key={type} value={type}>
                            {type}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}
                  />
                  {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  {isLoading ? "Generating..." : "Generate Tweet"}
                </Button>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 p-4 text-red-600 bg-red-50 rounded-md"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {streamedTweet && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardContent className="p-4">
                        <p>{streamedTweet}</p>
                        <CharacterCounter text={streamedTweet} limit={280} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export type TweetType = "Statement" | "Question" | "Opinion" | "Announcement"

export interface TweetRequest {
  instructions: string
  topic: string
  type: TweetType
}

export interface TweetResponse {
  tweets: string[]
  error?: string
}

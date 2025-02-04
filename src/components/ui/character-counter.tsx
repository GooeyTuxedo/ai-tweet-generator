import { useState, useEffect } from 'react'

interface CharacterCounterProps {
  text: string
  limit: number
}

export function CharacterCounter({ text, limit }: CharacterCounterProps) {
  const [count, setCount] = useState(0)
  const [isOverLimit, setIsOverLimit] = useState(false)

  useEffect(() => {
    setCount(text.length)
    setIsOverLimit(text.length > limit)
  }, [text, limit])

  return (
    <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
      {count}/{limit} characters
    </div>
  )
}

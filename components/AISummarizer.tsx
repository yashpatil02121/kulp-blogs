'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface AISummarizerProps {
  content: string
}

export default function AISummarizer({ content }: AISummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    setSummarizing(true)
    setError(null)
    try {
      console.log('Sending content to summarize, length:', content.length)
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to summarize')
        console.error('Failed to summarize:', errorData)
      }
    } catch (error) {
      setError('Network error occurred. Please try again.')
      console.error('Error summarizing:', error)
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <>
      {/* AI Summarize Button */}
      <div className="mt-6">
        <Button
          onClick={handleSummarize}
          disabled={summarizing}
          className="bg-transparent border-1 border-white hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {summarizing ? 'Summarizing...' : 'Summarize using AI'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            AI Summary
          </h3>
          <p className="text-gray-200 leading-relaxed">{summary}</p>
        </div>
      )}
    </>
  )
}

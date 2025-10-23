import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const apiKey = process.env.GOOGLE_GEMINI_API

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({
        error: 'GOOGLE_GEMINI_API environment variable is not set. Please add your Google Gemini API key to your .env.local file.'
      }, { status: 500 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    console.log('API Key exists:', !!apiKey)
    console.log('Content length:', content.length)

    // Validate API key format (should start with specific prefix)
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        error: 'Invalid API key format. Google Gemini API keys should start with "AIza". Please check your GOOGLE_GEMINI_API environment variable.'
      }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Use the latest and most capable models available
    let model;
    try {
      // Try the latest Gemini 2.5 Flash first
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      console.log('Using Gemini 2.5 Flash')
    } catch (modelError) {
      console.log('Gemini 2.5 Flash not available, trying Gemini 2.5 Pro:', modelError)
      try {
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
        console.log('Using Gemini 2.5 Pro')
      } catch (fallbackError) {
        console.log('Gemini 2.5 Pro not available, trying Gemini 2.0 Flash:', fallbackError)
        try {
          model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          console.log('Using Gemini 2.0 Flash')
        } catch (finalError) {
          console.log('Gemini 2.0 Flash not available, trying Gemini 2.0 Flash Lite:', finalError)
          try {
            model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
            console.log('Using Gemini 2.0 Flash Lite')
          } catch (lastError) {
            console.log('No supported Gemini models available:', lastError)
            throw new Error('No supported Gemini models available. Please check your API key and ensure the Generative Language API is enabled.')
          }
        }
      }
    }

    // Truncate content if it's too long (Gemini has token limits)
    const truncatedContent = content.length > 10000 ? content.substring(0, 10000) + '...' : content

    const prompt = `Please summarize the following blog post content in approximately 50 words. Make it concise and capture the main points:

${truncatedContent}

Summary:`

    console.log('Making API call to Gemini...')
    const result = await model.generateContent(prompt)
    console.log('API call successful')
    const response = await result.response
    const summary = response.text()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)

    // Return more detailed error information for debugging
    let errorMessage = 'Failed to generate summary'
    if (error instanceof Error) {
      errorMessage = error.message

      // Check for common API errors
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key. Please check your GOOGLE_GEMINI_API environment variable.'
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'API key does not have permission to use Gemini API. Please enable the Generative Language API in Google Cloud Console.'
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'API quota exceeded. Please check your Google Cloud Console for usage limits.'
      } else if (error.message.includes('MODEL_NOT_FOUND')) {
        errorMessage = 'Model not found. The Gemini API might not be enabled for your project.'
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

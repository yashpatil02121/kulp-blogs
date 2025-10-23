import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_GEMINI_API environment variable is not set.'
      }, { status: 500 })
    }

    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. Google Gemini API keys should start with "AIza".'
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

    // Simple test prompt
    const result = await model.generateContent('Say "Hello, World!" in one word.')
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      message: 'API key is working!',
      response: text.trim()
    })

  } catch (error) {
    console.error('Gemini API test failed:', error)

    let errorMessage = 'API test failed'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

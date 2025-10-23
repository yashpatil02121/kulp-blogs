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

    // List available models
    const models = await genAI.listModels()
    const modelNames = models.map(model => model.name)

    return NextResponse.json({
      success: true,
      availableModels: modelNames,
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods
      }))
    })

  } catch (error) {
    console.error('Error listing models:', error)

    let errorMessage = 'Failed to list models'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { buildIdeationPrompt } from '@/lib/prompts/ideation'
import { callCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { IdeationCard, } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userInput, modelSettings } = body as {
      userInput: string
      modelSettings?: ModelSettings
    }

    if (!userInput?.trim()) {
      return NextResponse.json({ error: '请输入创作方向' }, { status: 400 })
    }

    const settings = modelSettings ?? DEFAULT_SETTINGS
    const model = getModelId(settings, 'ideation')

    const { text } = await callCompletion(settings, {
      model,
      maxTokens: 3000,
      messages: [{ role: 'user', content: buildIdeationPrompt(userInput.trim()) }],
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[ideation] No JSON in response:', text.slice(0, 200))
      return NextResponse.json({ error: '解析失败，请重试' }, { status: 500 })
    }

    const cards: IdeationCard[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ cards })
  } catch (error) {
    console.error('[ideation] error:', error)
    const msg = error instanceof Error ? error.message : '生成失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

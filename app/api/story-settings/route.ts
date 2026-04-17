import { NextRequest, NextResponse } from 'next/server'
import { callCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { IdeationCard } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { card, modelSettings } = body as {
      card: IdeationCard
      modelSettings?: ModelSettings
    }

    if (!card) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const settings = modelSettings ?? DEFAULT_SETTINGS
    const model = getModelId(settings, 'ideation')

    const prompt = `你是顶级短剧/漫剧编剧。根据以下选题，生成核心冲突和世界观设定，用于指导全集规划和每集剧本创作。

【选题信息】
标题：${card.title}
故事核心：${card.logline}
核心情感：${card.coreEmotion}
流量底座：${card.trafficBase}
开场钩子：${card.hook}
时代情绪：${card.eraEmotion}

【输出要求】
coreConflict（核心冲突）：1句话，点明全剧最根本的对立与张力。
- 必须包含「利益/权力冲突 × 情感冲突」双重维度
- 让观众一眼明白「这是一部关于什么的剧」
- 格式：[主角] vs [对立方/命运/自我]，表层是[X]，底层是[Y]

worldBuilding（世界观）：2-3句话，描述故事背景、特殊规则、时代氛围。
- 突出与普通故事的差异化设定
- 包含：时代背景 + 权力结构/规则 + 主角所处位置

只输出JSON，不含任何其他文字：
{"coreConflict":"...","worldBuilding":"..."}`

    const { text } = await callCompletion(settings, {
      model,
      maxTokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('[story-settings]', error)
    const msg = error instanceof Error ? error.message : '生成失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

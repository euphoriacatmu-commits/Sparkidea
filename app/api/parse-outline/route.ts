import { NextRequest, NextResponse } from 'next/server'
import { buildParseOutlinePrompt } from '@/lib/prompts/parseOutline'
import { callCompletion, getModelId } from '@/lib/api-client'
import { DEFAULT_SETTINGS } from '@/lib/model-config'
import type { ParsedOutline } from '@/lib/types'
import type { ModelSettings } from '@/lib/model-config'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let outlineText = ''
    let modelSettings: ModelSettings = DEFAULT_SETTINGS

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const settingsRaw = formData.get('modelSettings') as string | null

      if (settingsRaw) {
        try { modelSettings = JSON.parse(settingsRaw) } catch {}
      }

      if (!file) {
        return NextResponse.json({ error: '未找到文件' }, { status: 400 })
      }

      const fileName = file.name.toLowerCase()
      const buffer = Buffer.from(await file.arrayBuffer())

      if (fileName.endsWith('.txt')) {
        outlineText = buffer.toString('utf-8')
      } else if (fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        outlineText = result.value
      } else if (fileName.endsWith('.pdf')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any
        const pdfParse = pdfParseModule.default || pdfParseModule
        const data = await pdfParse(buffer)
        outlineText = data.text
      } else {
        return NextResponse.json(
          { error: '不支持的文件格式，请上传 .txt、.docx 或 .pdf 文件' },
          { status: 400 }
        )
      }
    } else {
      const body = await req.json()
      outlineText = body.text || ''
      modelSettings = body.modelSettings ?? DEFAULT_SETTINGS
    }

    if (!outlineText.trim()) {
      return NextResponse.json({ error: '文件内容为空' }, { status: 400 })
    }

    const model = getModelId(modelSettings, 'parse')

    const { text } = await callCompletion(modelSettings, {
      model,
      maxTokens: 2000,
      messages: [{ role: 'user', content: buildParseOutlinePrompt(outlineText) }],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[parse-outline] No JSON:', text.slice(0, 200))
      return NextResponse.json({ error: '大纲解析失败，请重试' }, { status: 500 })
    }

    const outline: ParsedOutline = JSON.parse(jsonMatch[0])
    return NextResponse.json({ outline })
  } catch (error) {
    console.error('[parse-outline] error:', error)
    const msg = error instanceof Error ? error.message : '解析失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildParseOutlinePrompt } from '@/lib/prompts/parseOutline'
import type { ParsedOutline } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let outlineText = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: '未找到文件' }, { status: 400 })
      }

      const fileName = file.name.toLowerCase()
      const buffer = Buffer.from(await file.arrayBuffer())

      if (fileName.endsWith('.txt')) {
        outlineText = buffer.toString('utf-8')
      } else if (fileName.endsWith('.docx')) {
        // 动态导入避免 webpack 打包问题
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        outlineText = result.value
      } else if (fileName.endsWith('.pdf')) {
        // 动态导入避免 pdf-parse 启动读文件问题
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
    }

    if (!outlineText.trim()) {
      return NextResponse.json({ error: '文件内容为空' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildParseOutlinePrompt(outlineText),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[parse-outline] No JSON found:', text.slice(0, 200))
      return NextResponse.json({ error: '大纲解析失败，请重试' }, { status: 500 })
    }

    const outline: ParsedOutline = JSON.parse(jsonMatch[0])
    return NextResponse.json({ outline })
  } catch (error) {
    console.error('[parse-outline] error:', error)
    return NextResponse.json(
      { error: '解析失败，请检查文件格式后重试' },
      { status: 500 }
    )
  }
}

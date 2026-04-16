/**
 * 服务端工具：根据前端传入的模型设置，返回对应的 API 调用参数
 *
 * - Anthropic：使用 @anthropic-ai/sdk 原生客户端
 * - OpenRouter：使用 OpenAI 兼容接口（fetch）
 * - 火山引擎：使用 OpenAI 兼容接口（fetch），Base URL 不同
 */

import Anthropic from '@anthropic-ai/sdk'
import type { ModelSettings } from './model-config'

// ——————————————————————————————————————
// 类型
// ——————————————————————————————————————

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CompletionOptions {
  model: string
  messages: ChatMessage[]
  maxTokens: number
  stream?: false
}

export interface CompletionResult {
  text: string
}

// ——————————————————————————————————————
// 读取环境变量中的 Anthropic Key（作为后备）
// ——————————————————————————————————————
function getEffectiveApiKey(settings: ModelSettings): string {
  if (settings.apiKey?.trim()) return settings.apiKey.trim()
  // 如果是 Anthropic，从环境变量读取
  if (settings.provider === 'anthropic') {
    return process.env.ANTHROPIC_API_KEY ?? ''
  }
  return ''
}

// ——————————————————————————————————————
// 获取任务对应的 model id
// ——————————————————————————————————————
export function getModelId(
  settings: ModelSettings,
  task: keyof ModelSettings['taskModels']
): string {
  if (settings.provider === 'volcengine') {
    const ep = settings.volcengineEndpoints[task]
    if (ep?.trim()) return ep.trim()
    // 若未填接入点，回退到 taskModels（允许用户手填）
    return settings.taskModels[task]
  }
  return settings.taskModels[task]
}

// ——————————————————————————————————————
// 工具：429 限流自动重试（指数退避）
// ——————————————————————————————————————
function is429(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return (
    err.message.includes('429') ||
    err.message.includes('TooManyRequests') ||
    err.message.includes('RequestBurstTooFast') ||
    err.message.includes('rate_limit') ||
    err.message.includes('RateLimitError')
  )
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 4,
  baseDelayMs = 3000
): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (!is429(err) || attempt === maxRetries) throw err
      const delay = baseDelayMs * Math.pow(2, attempt) // 3s, 6s, 12s, 24s
      console.warn(`[api-client] 429 限流，${delay / 1000}s 后重试（第 ${attempt + 1} 次）`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

// ——————————————————————————————————————
// 非流式调用
// ——————————————————————————————————————
export async function callCompletion(
  settings: ModelSettings,
  options: CompletionOptions
): Promise<CompletionResult> {
  const apiKey = getEffectiveApiKey(settings)

  if (settings.provider === 'anthropic') {
    const client = new Anthropic({ apiKey })
    return withRetry(async () => {
      const res = await client.messages.create({
        model: options.model,
        max_tokens: options.maxTokens,
        messages: options.messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })
      const text = res.content[0].type === 'text' ? res.content[0].text : ''
      return { text }
    })
  }

  // OpenRouter 或 火山引擎 —— OpenAI 兼容格式
  const baseURL =
    settings.provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1'
      : 'https://ark.cn-beijing.volces.com/api/v3'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  if (settings.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://sparkidea.app'
    headers['X-Title'] = '火花剧本'
  }

  const body = {
    model: options.model,
    max_tokens: options.maxTokens,
    messages: options.messages,
  }

  return withRetry(async () => {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (res.status === 429) {
      const errText = await res.text()
      throw new Error(`[${settings.provider}] 429: ${errText}`)
    }

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`[${settings.provider}] ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content ?? ''
    return { text }
  })
}

// ——————————————————————————————————————
// 流式调用（返回 ReadableStream，SSE 格式）
// ——————————————————————————————————————
export function streamCompletion(
  settings: ModelSettings,
  options: CompletionOptions
): ReadableStream<Uint8Array> {
  const apiKey = getEffectiveApiKey(settings)
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        if (settings.provider === 'anthropic') {
          const client = new Anthropic({ apiKey })
          const stream = client.messages.stream({
            model: options.model,
            max_tokens: options.maxTokens,
            messages: options.messages.map(m => ({
              role: m.role === 'system' ? 'user' : m.role as 'user' | 'assistant',
              content: m.content,
            })),
          })

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              )
            }
          }
        } else {
          // OpenRouter / 火山引擎 — OpenAI 流式（含 429 重试）
          const baseURL =
            settings.provider === 'openrouter'
              ? 'https://openrouter.ai/api/v1'
              : 'https://ark.cn-beijing.volces.com/api/v3'

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          }
          if (settings.provider === 'openrouter') {
            headers['HTTP-Referer'] = 'https://sparkidea.app'
            headers['X-Title'] = '火花剧本'
          }

          // 流式请求带重试
          let res: Response | null = null
          for (let attempt = 0; attempt <= 4; attempt++) {
            res = await fetch(`${baseURL}/chat/completions`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: options.model,
                max_tokens: options.maxTokens,
                messages: options.messages,
                stream: true,
              }),
            })
            if (res.status === 429) {
              if (attempt === 4) {
                const errText = await res.text()
                throw new Error(`[${settings.provider}] 429: ${errText}`)
              }
              const delay = 3000 * Math.pow(2, attempt)
              console.warn(`[streamCompletion] 429 限流，${delay / 1000}s 后重试（第 ${attempt + 1} 次）`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            break
          }

          if (!res || !res.ok || !res.body) {
            const errText = res ? await res.text() : 'no response'
            throw new Error(`[${settings.provider}] ${res?.status ?? 0}: ${errText}`)
          }

          const reader = res.body.getReader()
          const dec = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = dec.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                const text: string = parsed.choices?.[0]?.delta?.content ?? ''
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  )
                }
              } catch {
                // 忽略无效 JSON 行
              }
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('[streamCompletion] error:', err)
        const msg = err instanceof Error ? err.message : '生成失败'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        )
        controller.close()
      }
    },
  })
}

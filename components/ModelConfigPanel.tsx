'use client'

import { useState } from 'react'
import { useModelConfigStore } from '@/store/model-config'
import {
  PROVIDER_INFO,
  getModelsForProvider,
  type Provider,
  type ModelSettings,
} from '@/lib/model-config'

const PROVIDERS: Provider[] = ['anthropic', 'openrouter', 'volcengine']

const TASK_LABELS: Record<keyof ModelSettings['taskModels'], string> = {
  ideation: '选题策划',
  planning: '全集规划',
  episode:  '单集生成（最重要）',
  parse:    '大纲解析',
}

interface Props {
  onClose: () => void
}

export default function ModelConfigPanel({ onClose }: Props) {
  const { settings, setProvider, setApiKey, setTaskModel, setVolcengineEndpoint, resetToDefaults } =
    useModelConfigStore()

  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const provider = settings.provider
  const info = PROVIDER_INFO[provider]
  const models = getModelsForProvider(provider)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* 标题栏 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI 模型配置</h2>
            <p className="text-xs text-gray-400 mt-0.5">配置信息保存在本地浏览器，不会上传</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 transition"
          >
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* 1. 选择提供商 */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-700">API 提供商</h3>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => {
                const pi = PROVIDER_INFO[p]
                return (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition
                      ${provider === p
                        ? 'border-spark-400 bg-spark-50 ring-2 ring-spark-100'
                        : 'border-gray-200 hover:border-spark-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-xl">
                      {p === 'anthropic' ? '🤖' : p === 'openrouter' ? '🔀' : '🌋'}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 leading-tight">
                      {pi.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* 2. API Key */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">API Key</h3>
              <a
                href={info.docsURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-spark-500 hover:underline"
              >
                获取密钥 →
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={info.keyPlaceholder}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm font-mono focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showKey ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">{info.keyHint}</p>
          </section>

          {/* 3. 火山引擎：接入点 ID 配置 */}
          {provider === 'volcengine' && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-700">接入点 ID（Endpoint ID）</h3>
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                <p className="font-semibold mb-1">⚠️ 火山引擎使用说明</p>
                <p>火山引擎的 model 字段必须填写你在控制台创建的「接入点 ID」，格式为 <code className="bg-amber-100 px-1 rounded">ep-xxxxxxxxxxxxxxxx-xxxxx</code>。</p>
                <p className="mt-1">每个任务可以使用不同的接入点（指向不同模型）。</p>
                <a
                  href="https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block underline"
                >
                  前往控制台创建接入点 →
                </a>
              </div>
              <div className="flex flex-col gap-3">
                {(Object.keys(TASK_LABELS) as Array<keyof ModelSettings['taskModels']>).map((task) => (
                  <div key={task}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {TASK_LABELS[task]}
                    </label>
                    <input
                      type="text"
                      value={settings.volcengineEndpoints[task]}
                      onChange={(e) => setVolcengineEndpoint(task, e.target.value)}
                      placeholder="ep-xxxxxxxxxxxxxxxx-xxxxx"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Anthropic / OpenRouter：各任务模型选择 */}
          {provider !== 'volcengine' && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-700">各任务使用的模型</h3>
              <div className="flex flex-col gap-3">
                {(Object.keys(TASK_LABELS) as Array<keyof ModelSettings['taskModels']>).map((task) => (
                  <div key={task} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-gray-600">{TASK_LABELS[task]}</span>
                    <select
                      value={settings.taskModels[task]}
                      onChange={(e) => setTaskModel(task, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
                    >
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                建议「单集生成」使用最强模型以保证剧本质量
              </p>
            </section>
          )}

          {/* OpenRouter 额外说明 */}
          {provider === 'openrouter' && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">ℹ️ OpenRouter 说明</p>
              <p>OpenRouter 汇聚多家模型提供商，使用统一的 OpenAI 兼容接口。</p>
              <p className="mt-1">费用按所选模型的实际用量计算，详见{' '}
                <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="underline">模型定价页面</a>。
              </p>
            </div>
          )}

          {/* 底部按钮 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={resetToDefaults}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              恢复默认（Anthropic 原生）
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition
                  ${saved ? 'bg-green-500' : 'bg-spark-500 hover:bg-spark-600 active:scale-95'}
                `}
              >
                {saved ? '✓ 已保存' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

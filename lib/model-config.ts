// ============================================================
// AI 模型提供商配置
// ============================================================

export type Provider = 'anthropic' | 'openrouter' | 'volcengine'

// 每个任务使用哪个模型
export type TaskType = 'ideation' | 'planning' | 'episode' | 'parse'

export interface ModelOption {
  id: string           // 发送给 API 的 model id
  label: string        // 界面显示名
  provider: Provider
  contextWindow?: number
  isDefault?: boolean
}

// ——————————————————————————————————————
// Anthropic 原生
// ——————————————————————————————————————
export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: 'claude-opus-4-5',    label: 'Claude Opus 4.5',    provider: 'anthropic', contextWindow: 200000 },
  { id: 'claude-sonnet-4-5',  label: 'Claude Sonnet 4.5',  provider: 'anthropic', contextWindow: 200000, isDefault: true },
  { id: 'claude-haiku-4-5',   label: 'Claude Haiku 4.5',   provider: 'anthropic', contextWindow: 200000 },
]

// ——————————————————————————————————————
// OpenRouter（兼容 OpenAI 格式）
// 文档：https://openrouter.ai/docs
// Base URL: https://openrouter.ai/api/v1
// ——————————————————————————————————————
export const OPENROUTER_MODELS: ModelOption[] = [
  // Claude via OpenRouter
  { id: 'anthropic/claude-opus-4-5',   label: 'Claude Opus 4.5 (OR)',   provider: 'openrouter' },
  { id: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (OR)', provider: 'openrouter', isDefault: true },
  { id: 'anthropic/claude-haiku-4-5',  label: 'Claude Haiku 4.5 (OR)',  provider: 'openrouter' },
  // GPT
  { id: 'openai/gpt-4o',               label: 'GPT-4o',                  provider: 'openrouter' },
  { id: 'openai/gpt-4o-mini',          label: 'GPT-4o mini',             provider: 'openrouter' },
  // Gemini
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash',        provider: 'openrouter' },
  { id: 'google/gemini-pro-1.5',       label: 'Gemini 1.5 Pro',          provider: 'openrouter' },
  // DeepSeek
  { id: 'deepseek/deepseek-r1',        label: 'DeepSeek R1',             provider: 'openrouter' },
  { id: 'deepseek/deepseek-chat-v3-0324', label: 'DeepSeek V3',          provider: 'openrouter' },
  // Qwen
  { id: 'qwen/qwen-2.5-72b-instruct',  label: 'Qwen 2.5 72B',           provider: 'openrouter' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B',    provider: 'openrouter' },
]

// ——————————————————————————————————————
// 火山引擎（豆包大模型）
// 文档：https://www.volcengine.com/docs/82379/1302008
// Base URL: https://ark.cn-beijing.volces.com/api/v3
// 使用 OpenAI 兼容接口
// model 字段传「接入点 ID」，由用户在火山引擎控制台创建并复制
// ——————————————————————————————————————
export const VOLCENGINE_MODELS: ModelOption[] = [
  // 豆包系列（用户需填入自己的接入点 ID）
  { id: 'ep-xxxxxxxx-doubao-pro-32k',   label: '豆包 Pro 32K',           provider: 'volcengine', isDefault: true },
  { id: 'ep-xxxxxxxx-doubao-pro-128k',  label: '豆包 Pro 128K',          provider: 'volcengine' },
  { id: 'ep-xxxxxxxx-doubao-lite-32k',  label: '豆包 Lite 32K',          provider: 'volcengine' },
  // DeepSeek via 火山引擎
  { id: 'ep-xxxxxxxx-deepseek-r1',      label: 'DeepSeek R1 (火山)',      provider: 'volcengine' },
  { id: 'ep-xxxxxxxx-deepseek-v3',      label: 'DeepSeek V3 (火山)',      provider: 'volcengine' },
]

export const ALL_MODELS: ModelOption[] = [
  ...ANTHROPIC_MODELS,
  ...OPENROUTER_MODELS,
  ...VOLCENGINE_MODELS,
]

// ——————————————————————————————————————
// 提供商元信息
// ——————————————————————————————————————
export interface ProviderInfo {
  label: string
  baseURL: string
  keyPlaceholder: string
  keyHint: string
  docsURL: string
  needsCustomModelId: boolean  // 是否允许用户自填 model id（火山引擎接入点）
}

export const PROVIDER_INFO: Record<Provider, ProviderInfo> = {
  anthropic: {
    label: 'Anthropic（原生）',
    baseURL: 'https://api.anthropic.com',
    keyPlaceholder: 'sk-ant-api03-...',
    keyHint: '在 https://console.anthropic.com/settings/keys 获取',
    docsURL: 'https://docs.anthropic.com',
    needsCustomModelId: false,
  },
  openrouter: {
    label: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    keyPlaceholder: 'sk-or-v1-...',
    keyHint: '在 https://openrouter.ai/settings/keys 获取',
    docsURL: 'https://openrouter.ai/docs',
    needsCustomModelId: false,
  },
  volcengine: {
    label: '火山引擎（豆包）',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    keyPlaceholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    keyHint: '在火山引擎控制台 → 密钥管理 获取 API Key',
    docsURL: 'https://www.volcengine.com/docs/82379/1302008',
    needsCustomModelId: true,
  },
}

// ——————————————————————————————————————
// 默认任务→模型映射（Anthropic 原生）
// ——————————————————————————————————————
export interface TaskModelConfig {
  provider: Provider
  modelId: string
}

export interface ModelSettings {
  provider: Provider
  apiKey: string
  // 火山引擎专用：自定义接入点 ID（覆盖下方 taskModels）
  volcengineEndpoints: {
    ideation: string
    planning: string
    episode: string
    parse: string
  }
  // 各任务选用的 model id（对 anthropic/openrouter 生效）
  taskModels: {
    ideation: string
    planning: string
    episode: string
    parse: string
  }
}

export const DEFAULT_SETTINGS: ModelSettings = {
  provider: 'anthropic',
  apiKey: '',
  volcengineEndpoints: {
    ideation: '',
    planning: '',
    episode: '',
    parse: '',
  },
  taskModels: {
    ideation: 'claude-sonnet-4-5',
    planning: 'claude-sonnet-4-5',
    episode: 'claude-opus-4-5',
    parse:   'claude-haiku-4-5',
  },
}

export function getModelsForProvider(provider: Provider): ModelOption[] {
  if (provider === 'anthropic') return ANTHROPIC_MODELS
  if (provider === 'openrouter') return OPENROUTER_MODELS
  if (provider === 'volcengine') return VOLCENGINE_MODELS
  return []
}

export function getDefaultModelForProvider(provider: Provider): string {
  const models = getModelsForProvider(provider)
  return models.find(m => m.isDefault)?.id ?? models[0]?.id ?? ''
}

// 当切换 provider 时，重置 taskModels 为新 provider 的默认值
export function getDefaultTaskModels(provider: Provider): ModelSettings['taskModels'] {
  const def = getDefaultModelForProvider(provider)
  if (provider === 'anthropic') {
    return {
      ideation: 'claude-sonnet-4-5',
      planning: 'claude-sonnet-4-5',
      episode:  'claude-opus-4-5',
      parse:    'claude-haiku-4-5',
    }
  }
  return { ideation: def, planning: def, episode: def, parse: def }
}

'use client'

import { useState } from 'react'
import type { ProjectConfig, Genre, Platform, Audience } from '@/lib/types'
import { PLATFORM_SPECS } from '@/lib/platform-presets'

interface ConfigFormProps {
  initialValues?: Partial<ProjectConfig>
  onSubmit: (config: ProjectConfig) => void
}

const GENRE_OPTIONS: Array<{ value: Genre; label: string }> = [
  { value: 'romance', label: '甜宠' },
  { value: 'comedy', label: '喜剧' },
  { value: 'suspense', label: '悬疑' },
  { value: 'revenge', label: '复仇爽剧' },
  { value: 'darkRevenge', label: '暗黑复仇' },
  { value: 'cyberpunk', label: '赛博朋克' },
  { value: 'ancient', label: '古风宫斗' },
  { value: 'urbanFantasy', label: '都市异能' },
  { value: 'rebirth', label: '穿越重生' },
  { value: 'apocalypse', label: '末世求生' },
  { value: 'system', label: '系统觉醒' },
]

const PLATFORM_OPTIONS: Array<{ value: Platform; label: string }> = [
  { value: 'hongguo', label: '红果漫剧' },
  { value: 'douyin', label: '抖音短剧' },
  { value: 'xiaoyunque', label: '小云雀' },
  { value: 'oiioii', label: 'oiioii' },
  { value: 'tapnow', label: 'TapNow' },
  { value: 'liblib', label: 'LibLib' },
  { value: 'universal', label: '通用格式' },
]

const AUDIENCE_OPTIONS: Array<{ value: Audience; label: string }> = [
  { value: 'f18-24', label: '18-24岁女性' },
  { value: 'f25-35', label: '25-35岁女性' },
  { value: 'm18-30', label: '18-30岁男性' },
  { value: 'all-age', label: '全年龄段' },
]

const DIALOGUE_DENSITY_OPTIONS = [
  { value: 'extreme' as const, label: '极高密度', desc: '≥80%台词，靠对话推动一切' },
  { value: 'high' as const, label: '高密度', desc: '≥65%台词，少量场景叙述' },
  { value: 'balanced' as const, label: '平衡', desc: '台词与叙述各半' },
  { value: 'narrative' as const, label: '叙事型', desc: '<50%台词，更多内心/旁白' },
]

const PACE_OPTIONS = [
  { value: 'ultra' as const, label: '极速癫', desc: '每集必反转，无废话' },
  { value: 'fast' as const, label: '快节奏', desc: '强情节推进，爽感优先' },
  { value: 'slow_burn' as const, label: '虐心慢熬', desc: '积累委屈后集中爆发' },
]

const MEME_LABELS = ['', '几乎无梗', '偶尔有梗', '适量网络感', '高密度互联网', '极度癫']

export default function ConfigForm({ initialValues, onSubmit }: ConfigFormProps) {
  const defaultPlatform: Platform = (initialValues?.platform as Platform) || 'douyin'
  const preset = PLATFORM_SPECS[defaultPlatform]

  const [form, setForm] = useState<ProjectConfig>({
    title: initialValues?.title || '',
    totalEpisodes: initialValues?.totalEpisodes || preset.defaultTotalEpisodes,
    episodeDuration: initialValues?.episodeDuration || preset.defaultEpisodeDuration,
    genres: initialValues?.genres || [],
    paceStyle: initialValues?.paceStyle || 'fast',
    targetAudience: initialValues?.targetAudience || ['f18-24'],
    memeIntensity: initialValues?.memeIntensity || 3,
    dialogueDensity: initialValues?.dialogueDensity || 'high',
    platform: defaultPlatform,
    visualStylePrompt: initialValues?.visualStylePrompt || '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectConfig, string>>>({})

  const updatePlatform = (platform: Platform) => {
    const p = PLATFORM_SPECS[platform]
    setForm(prev => ({
      ...prev,
      platform,
      totalEpisodes: p.defaultTotalEpisodes,
      episodeDuration: p.defaultEpisodeDuration,
    }))
  }

  const toggleGenre = (genre: Genre) => {
    setForm(prev => {
      const existing = prev.genres.includes(genre)
      if (existing) {
        return { ...prev, genres: prev.genres.filter(g => g !== genre) }
      }
      if (prev.genres.length >= 3) return prev
      return { ...prev, genres: [...prev.genres, genre] }
    })
  }

  const toggleAudience = (audience: Audience) => {
    setForm(prev => {
      const existing = prev.targetAudience.includes(audience)
      if (existing && prev.targetAudience.length === 1) return prev
      if (existing) {
        return { ...prev, targetAudience: prev.targetAudience.filter(a => a !== audience) }
      }
      return { ...prev, targetAudience: [...prev.targetAudience, audience] }
    })
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectConfig, string>> = {}
    if (!form.title.trim()) newErrors.title = '请填写剧名'
    if (form.totalEpisodes < 1) newErrors.totalEpisodes = '集数至少为 1'
    if (form.episodeDuration < 1) newErrors.episodeDuration = '时长至少为 1 分钟'
    if (form.genres.length === 0) newErrors.genres = '请至少选择一个类型'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const platformSpec = PLATFORM_SPECS[form.platform]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* 基本信息 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-800">基本信息</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">剧名 *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="给你的短剧起个名字"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">总集数 *</label>
            <input
              type="number"
              min={1}
              value={form.totalEpisodes}
              onChange={e => setForm(prev => ({ ...prev, totalEpisodes: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">每集时长（分钟）*</label>
            <input
              type="number"
              min={1}
              value={form.episodeDuration}
              onChange={e => setForm(prev => ({ ...prev, episodeDuration: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
            />
          </div>
        </div>
      </section>

      {/* 目标平台 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">目标平台</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLATFORM_OPTIONS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => updatePlatform(p.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition
                ${form.platform === p.value
                  ? 'border-spark-400 bg-spark-50 text-spark-700'
                  : 'border-gray-200 text-gray-600 hover:border-spark-200'
                }
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
        {platformSpec && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            💡 {platformSpec.spec}
          </p>
        )}
      </section>

      {/* 剧本类型 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">剧本类型 <span className="text-sm font-normal text-gray-400">（最多选3个）</span></h2>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => toggleGenre(g.value)}
              className={`rounded-full border px-3 py-1 text-sm transition
                ${form.genres.includes(g.value)
                  ? 'border-spark-400 bg-spark-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-spark-300'
                }
              `}
            >
              {g.label}
            </button>
          ))}
        </div>
        {errors.genres && <p className="text-xs text-red-500">{errors.genres}</p>}
      </section>

      {/* 节奏风格 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">节奏风格</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PACE_OPTIONS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, paceStyle: p.value }))}
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition
                ${form.paceStyle === p.value
                  ? 'border-spark-400 bg-spark-50'
                  : 'border-gray-200 hover:border-spark-200'
                }
              `}
            >
              <span className="text-sm font-semibold text-gray-800">{p.label}</span>
              <span className="text-xs text-gray-500">{p.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 台词密度 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">台词密度</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DIALOGUE_DENSITY_OPTIONS.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, dialogueDensity: d.value }))}
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition
                ${form.dialogueDensity === d.value
                  ? 'border-spark-400 bg-spark-50'
                  : 'border-gray-200 hover:border-spark-200'
                }
              `}
            >
              <span className="text-sm font-semibold text-gray-800">{d.label}</span>
              <span className="text-xs text-gray-500">{d.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 受众画像 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">受众画像</h2>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_OPTIONS.map(a => (
            <button
              key={a.value}
              type="button"
              onClick={() => toggleAudience(a.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition
                ${form.targetAudience.includes(a.value)
                  ? 'border-spark-400 bg-spark-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-spark-300'
                }
              `}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      {/* 梗文化强度 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">
          梗文化强度
          <span className="ml-2 text-sm font-normal text-spark-600">
            {MEME_LABELS[form.memeIntensity]}
          </span>
        </h2>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={form.memeIntensity}
          onChange={e => setForm(prev => ({ ...prev, memeIntensity: parseInt(e.target.value) as 1|2|3|4|5 }))}
          className="w-full accent-spark-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 几乎无梗</span>
          <span>3 适量网络感</span>
          <span>5 极度癫</span>
        </div>
      </section>

      {/* 视觉风格提示词（可选） */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">AI 画风提示词 <span className="text-sm font-normal text-gray-400">（可选）</span></h2>
        <input
          type="text"
          value={form.visualStylePrompt || ''}
          onChange={e => setForm(prev => ({ ...prev, visualStylePrompt: e.target.value }))}
          placeholder="例如：赛博朋克霓虹风、古风水墨、现代都市写实…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-spark-400 focus:outline-none focus:ring-2 focus:ring-spark-100"
        />
      </section>

      {/* 提交 */}
      <button
        type="submit"
        className="w-full rounded-xl bg-spark-500 py-3 text-base font-bold text-white shadow transition hover:bg-spark-600 active:scale-95"
      >
        确认配置，开始规划全集 →
      </button>
    </form>
  )
}

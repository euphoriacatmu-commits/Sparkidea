'use client'

import { useRouter } from 'next/navigation'
import type { SeriesPlan, EpisodeOutline, PlotBomb } from '@/lib/types'

interface PlanningMapProps {
  plan: SeriesPlan
  projectTitle: string
}

const NODE_LABELS: Record<string, string> = {
  normal: '普通',
  plot_bomb: '💥 爆点',
  major_twist: '🔥 大反转',
  emotional_peak: '💔 情感高潮',
  comedy_peak: '😂 喜剧高潮',
}

const HOOK_LABELS: Record<string, string> = {
  emotion_unresolved: '情绪悬',
  info_bomb: '信息炸',
  identity_question: '身份谜',
  cp_tension: 'CP张力',
  moral_dilemma: '道德两难',
  cliffhanger: '悬崖式',
}

const ACT_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-purple-100 border-purple-300 text-purple-800',
]

// 爆点列表卡片配色
const BOMB_CARD_STYLES: Record<string, { card: string; badge: string }> = {
  betrayal:        { card: 'bg-red-100 border-l-4 border-l-red-500 text-red-900',          badge: 'bg-red-500 text-white' },
  twist:           { card: 'bg-amber-100 border-l-4 border-l-amber-500 text-amber-900',    badge: 'bg-amber-500 text-white' },
  identity_reveal: { card: 'bg-violet-100 border-l-4 border-l-violet-500 text-violet-900', badge: 'bg-violet-500 text-white' },
  emotional_peak:  { card: 'bg-rose-100 border-l-4 border-l-rose-500 text-rose-900',       badge: 'bg-rose-500 text-white' },
}

const BOMB_TYPE_LABELS: Record<string, string> = {
  identity_reveal: '身份揭露',
  betrayal: '背叛',
  twist: '大反转',
  emotional_peak: '情感高潮',
}

// 分集梗概卡片配色：8种明显不同的颜色
function getEpisodeStyle(ep: EpisodeOutline): string {
  const { nodeType, emotionPeak } = ep
  const peak = emotionPeak ?? 5

  if (nodeType === 'major_twist')    return 'bg-red-100 border-red-400 text-red-900'
  if (nodeType === 'plot_bomb')      return 'bg-amber-100 border-amber-400 text-amber-900'
  if (nodeType === 'emotional_peak') return 'bg-rose-100 border-rose-400 text-rose-900'
  if (nodeType === 'comedy_peak')    return 'bg-lime-100 border-lime-400 text-lime-900'

  // normal — 按情绪峰值细分4个色阶
  if (peak >= 8) return 'bg-violet-100 border-violet-400 text-violet-900'
  if (peak >= 6) return 'bg-teal-100 border-teal-400 text-teal-900'
  if (peak >= 4) return 'bg-sky-100 border-sky-300 text-sky-900'
  return           'bg-slate-100 border-slate-300 text-slate-700'
}

export default function PlanningMap({ plan, projectTitle }: PlanningMapProps) {
  const router = useRouter()
  const hotSet = new Set(plan.hotEpisodes || [])
  const bombMap = new Map(plan.plotBombs?.map(b => [b.episodeNumber, b]) || [])

  const hasEpisodes = plan.episodes && plan.episodes.length > 0
  const hasActs     = plan.acts && plan.acts.length > 0

  // SVG 情绪曲线
  const renderEmotionCurve = () => {
    const eps = plan.episodes
    if (!eps || eps.length === 0) {
      return <p className="text-sm text-gray-400 py-4 text-center">情绪曲线将在分集规划生成后显示</p>
    }

    const W = 600
    const H = 80
    const padding = 10
    const innerW = W - padding * 2
    const innerH = H - padding * 2

    const points = eps.map((ep, i) => {
      const x = padding + (i / Math.max(eps.length - 1, 1)) * innerW
      const peak = ep.emotionPeak ?? 5
      const y = padding + ((10 - peak) / 10) * innerH
      return { x, y, ep }
    })

    let path = ''
    points.forEach((pt, i) => {
      if (i === 0) {
        path = `M ${pt.x} ${pt.y}`
      } else {
        const prev = points[i - 1]
        const cpx = (prev.x + pt.x) / 2
        path += ` C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`
      }
    })

    return (
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
          {/* 网格线 */}
          {[2, 5, 8].map(level => (
            <line
              key={level}
              x1={padding}
              y1={padding + ((10 - level) / 10) * innerH}
              x2={W - padding}
              y2={padding + ((10 - level) / 10) * innerH}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}
          {/* 曲线 */}
          <path d={path} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
          {/* 爆款集标注 */}
          {points.filter(pt => hotSet.has(pt.ep.episodeNumber)).map(pt => (
            <circle key={pt.ep.episodeNumber} cx={pt.x} cy={pt.y} r={4} fill="#f97316" stroke="white" strokeWidth="1.5" />
          ))}
          {/* 爆点集标注 */}
          {points.filter(pt => bombMap.has(pt.ep.episodeNumber)).map(pt => (
            <circle key={`bomb_${pt.ep.episodeNumber}`} cx={pt.x} cy={pt.y} r={5} fill="#ef4444" stroke="white" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 项目概览 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{projectTitle}</h2>
        <p className="text-sm text-gray-500">
          共 {plan.episodes?.length ?? 0} 集 · {plan.acts?.length ?? 0} 幕结构
        </p>

        {/* 五幕结构条 */}
        {hasActs ? (
          <>
            <div className="mt-4 flex gap-1 h-6 rounded-lg overflow-hidden">
              {plan.acts.map((act, i) => {
                const total = Math.max(plan.episodes?.length || 1, 1)
                const width = ((act.episodeRange[1] - act.episodeRange[0] + 1) / total) * 100
                return (
                  <div
                    key={i}
                    style={{ width: `${width}%` }}
                    className={`flex items-center justify-center text-xs font-medium rounded-sm border ${ACT_COLORS[i % ACT_COLORS.length]}`}
                    title={`${act.name}（第${act.episodeRange[0]}-${act.episodeRange[1]}集）：${act.emotionTarget}`}
                  >
                    {width > 8 ? act.name : ''}
                  </div>
                )
              })}
            </div>
            <div className="mt-1 flex gap-2 flex-wrap">
              {plan.acts.map((act, i) => (
                <span key={i} className="text-xs text-gray-400">
                  {act.name}（第{act.episodeRange[0]}-{act.episodeRange[1]}集）
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            五幕结构未生成，请点击上方「重新规划」按钮重新生成
          </p>
        )}
      </div>

      {/* 情绪曲线 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">情绪强度曲线</h3>
        {renderEmotionCurve()}
        {hasEpisodes && (
          <div className="mt-2 flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              ⚡ 预测爆款集
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              🔥 大反转节点
            </span>
          </div>
        )}
      </div>

      {/* 角色列表 */}
      {plan.characters && plan.characters.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-1">主要角色</h3>
          <p className="text-xs text-gray-400 mb-4">以下描述可直接用于 AI 角色三视图生成</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plan.characters.map((char, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-2">
                {/* 标题行 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">{char.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    char.role === 'protagonist' ? 'bg-orange-100 text-orange-700' :
                    char.role === 'antagonist'  ? 'bg-red-100 text-red-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {char.role === 'protagonist' ? '主角' : char.role === 'antagonist' ? '反派' : '配角'}
                  </span>
                  {char.archetype && (
                    <span className="text-xs text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{char.archetype}</span>
                  )}
                </div>

                {/* 外形描述（三视图核心） */}
                {char.appearance && (
                  <div className="text-xs leading-relaxed bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <span className="font-semibold text-gray-700">外形：</span>
                    <span className="text-gray-600">{char.appearance}</span>
                  </div>
                )}

                {/* 性格 */}
                {char.personality && (
                  <div className="text-xs leading-relaxed">
                    <span className="font-medium text-gray-700">性格：</span>
                    <span className="text-gray-600">{char.personality}</span>
                  </div>
                )}

                {/* 服装风格 */}
                {char.clothingStyle && (
                  <div className="text-xs leading-relaxed">
                    <span className="font-medium text-gray-700">造型：</span>
                    <span className="text-gray-600">{char.clothingStyle}</span>
                  </div>
                )}

                {/* 人性劣根 */}
                {char.flaw && (
                  <div className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-medium">人性劣根：</span>{char.flaw}
                  </div>
                )}

                {/* 弧光 */}
                {char.arc && (
                  <div className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-medium">角色弧光：</span>{char.arc}
                  </div>
                )}

                {/* 标志台词 */}
                {char.signatureLine && (
                  <p className="text-xs text-gray-400 italic border-l-2 border-gray-300 pl-2 mt-1">「{char.signatureLine}」</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 爆点节点 */}
      {plan.plotBombs && plan.plotBombs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">全剧爆点节点</h3>
          <div className="flex flex-col gap-3">
            {plan.plotBombs.map((bomb: PlotBomb, i) => {
              const style = BOMB_CARD_STYLES[bomb.type] || { card: 'bg-red-100 border-l-4 border-l-red-500 text-red-900', badge: 'bg-red-500 text-white' }
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 pl-4 ${style.card}`}>
                  <span className="text-base shrink-0 mt-0.5">🔥</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">第 {bomb.episodeNumber} 集</span>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-semibold ${style.badge}`}>
                        {BOMB_TYPE_LABELS[bomb.type] || bomb.type}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed">{bomb.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 分集梗概总表 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">分集梗概总表</h3>

        {!hasEpisodes ? (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-3 text-center">
            分集规划未生成，请点击上方「重新规划」按钮重新生成
          </p>
        ) : (
          <>
            {/* 图例 */}
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {[
                { bg: 'bg-red-100 border-red-400',       label: '🔥 大反转' },
                { bg: 'bg-amber-100 border-amber-400',   label: '💥 爆点' },
                { bg: 'bg-rose-100 border-rose-400',     label: '💔 情感高潮' },
                { bg: 'bg-lime-100 border-lime-400',     label: '😂 喜剧高潮' },
                { bg: 'bg-violet-100 border-violet-400', label: '⚡ 高燃≥8' },
                { bg: 'bg-teal-100 border-teal-400',     label: '💧 起伏≥6' },
                { bg: 'bg-sky-100 border-sky-300',       label: '🌤 推进≥4' },
                { bg: 'bg-slate-100 border-slate-300',   label: '·· 铺垫' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1 text-gray-600">
                  <span className={`inline-block w-3.5 h-3.5 rounded border ${item.bg}`} />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[600px] overflow-y-auto pr-1">
              {plan.episodes.map((ep: EpisodeOutline) => {
                const isHot   = hotSet.has(ep.episodeNumber)
                const hasBomb = bombMap.has(ep.episodeNumber)
                const nodeStyle = getEpisodeStyle(ep)
                const peak = ep.emotionPeak ?? 5
                const barWidth = `${peak * 10}%`

                return (
                  <div key={ep.episodeNumber} className={`rounded-xl border p-3 ${nodeStyle}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-bold">第{ep.episodeNumber}集</span>
                      {isHot   && <span className="text-xs">⚡</span>}
                      {hasBomb && <span className="text-xs">🔥</span>}
                      <span className="ml-auto text-xs opacity-70">{NODE_LABELS[ep.nodeType]}</span>
                    </div>
                    <p className="text-xs font-semibold mb-1 leading-snug">{ep.title}</p>
                    <p className="text-xs opacity-80 leading-relaxed line-clamp-2">{ep.synopsis}</p>
                    {/* 情绪强度条 */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1 rounded-full bg-black/10 overflow-hidden">
                        <div className="h-full rounded-full bg-current opacity-40 transition-all" style={{ width: barWidth }} />
                      </div>
                      <span className="text-xs font-medium opacity-60 shrink-0">{peak}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs opacity-60">
                        {HOOK_LABELS[ep.hookType] || ep.hookType}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 开始创作 CTA */}
      {hasEpisodes && (
        <div className="flex justify-center pb-4">
          <button
            onClick={() => router.push('/episode/1')}
            className="rounded-2xl bg-orange-500 px-10 py-4 text-base font-bold text-white shadow-lg transition hover:bg-orange-600 active:scale-95"
          >
            🎬 开始创作第一集
          </button>
        </div>
      )}
    </div>
  )
}

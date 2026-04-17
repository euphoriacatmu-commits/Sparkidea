'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import NavBar from '@/components/NavBar'

const GENRE_LABELS: Record<string, string> = {
  romance: '甜宠',
  comedy: '喜剧',
  suspense: '悬疑',
  revenge: '复仇爽剧',
  darkRevenge: '暗黑复仇',
  cyberpunk: '赛博朋克',
  ancient: '古风宫斗',
  urbanFantasy: '都市异能',
  rebirth: '穿越重生',
  apocalypse: '末世求生',
  system: '系统觉醒',
}

export default function ProjectsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const savedProjects = useProjectStore(s => s.savedProjects)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar backHref="/" backLabel="返回首页" />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">项目频道</h1>
          <p className="text-sm text-gray-500 mt-1">你的所有创作项目记录</p>
        </div>
        {savedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📁</span>
            <p className="text-gray-500 font-medium">暂无项目记录</p>
            <p className="text-gray-400 text-sm mt-1">完成全集规划后，项目将自动保存到这里</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 rounded-xl bg-spark-500 px-6 py-2 text-sm font-semibold text-white hover:bg-spark-600 transition"
            >
              开始创作
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {savedProjects.map(p => (
              <div
                key={p.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-spark-200 transition cursor-pointer"
                onClick={() => router.push('/planning')}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-gray-900 text-base leading-snug">{p.title}</h2>
                  <span className="shrink-0 rounded-full bg-spark-50 px-2 py-0.5 text-xs font-medium text-spark-600">
                    {p.episodesGenerated > 0 ? `${p.episodesGenerated}集已生成` : '规划完成'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.genres.map(g => (
                    <span key={g} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {GENRE_LABELS[g] || g}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{p.totalEpisodes}集 · {p.episodeDuration}分钟/集</span>
                  <span>最近编辑：{formatDate(p.updatedAt)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">创建于 {formatDate(p.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

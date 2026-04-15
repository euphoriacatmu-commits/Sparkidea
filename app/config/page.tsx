'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/project'
import ConfigForm from '@/components/ConfigForm'
import NavBar from '@/components/NavBar'
import type { ProjectConfig } from '@/lib/types'

export default function ConfigPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const selectedCard = useProjectStore(s => s.selectedCard)
  const parsedOutline = useProjectStore(s => s.parsedOutline)
  const { setConfig } = useProjectStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !selectedCard && !parsedOutline) router.replace('/')
  }, [mounted, selectedCard, parsedOutline, router])

  if (!mounted) return null

  const handleSubmit = (config: ProjectConfig) => {
    setConfig(config)
    router.push('/planning')
  }

  const getInitialValues = (): Partial<ProjectConfig> => {
    if (parsedOutline) {
      return { title: parsedOutline.title || '', genres: parsedOutline.suggestedGenre?.slice(0, 3) || [] }
    }
    if (selectedCard) return { title: selectedCard.title || '' }
    return {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar backHref="/ideation" backLabel="返回选题" step={2} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {selectedCard && (
          <div className="mb-6 rounded-xl border border-spark-200 bg-spark-50 p-4">
            <p className="text-xs font-semibold text-spark-500 mb-1">已选方案</p>
            <p className="text-sm font-bold text-gray-900">{selectedCard.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{selectedCard.logline}</p>
          </div>
        )}
        {parsedOutline && !selectedCard && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-500 mb-1">已解析大纲</p>
            <p className="text-sm font-bold text-gray-900">{parsedOutline.title || '（无标题）'}</p>
            <p className="text-xs text-gray-600 mt-0.5">{parsedOutline.synopsis}</p>
            <p className="text-xs text-gray-400 mt-1">
              置信度：{parsedOutline.confidence === 'high' ? '高' : parsedOutline.confidence === 'medium' ? '中' : '低'}
            </p>
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">配置项目参数</h1>
          <p className="text-sm text-gray-500 mt-1">这些参数将影响全集规划和每集剧本的生成</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ConfigForm initialValues={getInitialValues()} onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}

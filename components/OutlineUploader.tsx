'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { ParsedOutline } from '@/lib/types'

interface OutlineUploaderProps {
  onParsed: (outline: ParsedOutline) => void
}

export default function OutlineUploader({ onParsed }: OutlineUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)
    setIsLoading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/parse-outline', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || '解析失败，请重试')
        return
      }

      onParsed(data.outline)
    } catch {
      setError('网络错误，请检查连接后重试')
    } finally {
      setIsLoading(false)
    }
  }, [onParsed])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    },
    [processFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isLoading,
    onDropRejected: (files) => {
      const rejection = files[0]
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setError('文件太大，请上传 10MB 以内的文件')
      } else {
        setError('不支持的文件格式，请上传 .txt、.docx 或 .pdf 文件')
      }
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition
          ${isDragActive ? 'border-spark-400 bg-spark-50' : 'border-gray-200 bg-gray-50 hover:border-spark-300 hover:bg-spark-50'}
          ${isLoading ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <>
            <svg className="h-8 w-8 animate-spin text-spark-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm font-medium text-spark-600">正在解析大纲…</p>
            {fileName && (
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{fileName}</p>
            )}
          </>
        ) : isDragActive ? (
          <>
            <div className="text-3xl">📄</div>
            <p className="text-sm font-medium text-spark-600">松开以上传</p>
          </>
        ) : (
          <>
            <div className="text-3xl">📂</div>
            <p className="text-sm font-medium text-gray-600">
              拖拽大纲文件至此，或<span className="text-spark-500">点击上传</span>
            </p>
            <p className="text-xs text-gray-400">支持 .txt .docx .pdf，最大 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        上传后 AI 将自动提取剧名、角色、情节节点，帮你快速填充配置
      </p>
    </div>
  )
}

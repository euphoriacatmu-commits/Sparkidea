import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold text-gray-600">火花剧本</span>
          </div>
          <p className="text-xs text-gray-400">
            光环效应（杭州）人工智能应用有限公司 © 2026 · 由 Claude AI 驱动
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              隐私政策
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              服务条款
            </Link>
            <span className="text-gray-200">|</span>
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              浙ICP备2025170997号
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-sm text-gray-500">隐私政策</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">隐私政策</h1>
        <p className="text-sm text-gray-400 mb-8">最后更新日期：2026年1月1日</p>

        <div className="flex flex-col gap-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">一、信息收集</h2>
            <p>光环效应（杭州）人工智能应用有限公司（以下简称"我们"）在您使用火花剧本服务时，可能收集以下信息：</p>
            <ul className="mt-2 ml-4 flex flex-col gap-1.5 list-disc text-gray-600">
              <li>您主动输入的创作内容（剧本创意、大纲等），仅用于调用 AI 模型生成内容，不会用于其他目的</li>
              <li>模型配置偏好（API 密钥等），存储于您本地浏览器，我们服务器不保存</li>
              <li>基本访问日志（IP 地址、访问时间），用于安全防护和服务改善</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">二、信息使用</h2>
            <p>我们收集的信息将用于：</p>
            <ul className="mt-2 ml-4 flex flex-col gap-1.5 list-disc text-gray-600">
              <li>提供 AI 剧本生成服务</li>
              <li>保障服务安全稳定运行</li>
              <li>改善产品功能和用户体验</li>
            </ul>
            <p className="mt-3">我们不会将您的创作内容出售或提供给第三方商业机构。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">三、第三方服务</h2>
            <p>本产品使用以下第三方 AI 服务处理您的请求：</p>
            <ul className="mt-2 ml-4 flex flex-col gap-1.5 list-disc text-gray-600">
              <li>Anthropic Claude API（美国）</li>
              <li>OpenRouter（可选）</li>
              <li>火山引擎方舟（可选，中国大陆）</li>
            </ul>
            <p className="mt-3">您提交的内容将按照您选择的 AI 服务提供商的隐私政策处理。建议您在使用前阅读相关条款。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">四、数据安全</h2>
            <p>您的创作数据（剧本规划、分集内容）存储于您本地浏览器的 localStorage 中，不经过我们的服务器。您清除浏览器数据时，相关内容将同步删除。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">五、您的权利</h2>
            <p>您有权随时清除本地存储的所有数据（通过浏览器设置或应用内"重置项目"功能）。如有其他隐私相关问题，请联系我们。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">六、联系我们</h2>
            <p>光环效应（杭州）人工智能应用有限公司</p>
            <p className="mt-1 text-gray-500">浙江省杭州市</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-900">火花剧本</span>
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-sm text-gray-500">服务条款</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">服务条款</h1>
        <p className="text-sm text-gray-400 mb-8">最后更新日期：2026年1月1日</p>

        <div className="flex flex-col gap-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">一、服务说明</h2>
            <p>火花剧本是由光环效应（杭州）人工智能应用有限公司提供的 AI 辅助剧本创作工具。本服务利用人工智能技术帮助用户生成短剧/漫剧剧本内容，仅供创作参考使用。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">二、用户责任</h2>
            <ul className="ml-4 flex flex-col gap-2 list-disc text-gray-600">
              <li>您须确保输入内容合法合规，不得包含违法、色情、暴力、侮辱、诽谤等违禁内容</li>
              <li>AI 生成内容的最终使用责任由用户承担，请在使用前仔细审核</li>
              <li>您有责任确保生成内容不侵犯他人知识产权</li>
              <li>不得利用本服务从事任何违反中华人民共和国法律法规的活动</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">三、内容版权</h2>
            <p>您使用本服务生成的剧本内容，版权归属依据您所在地区的相关法律规定执行。我们建议您咨询专业法律顾问以确认 AI 生成内容的版权状态。</p>
            <p className="mt-2">我们不主张对您生成内容的版权，但保留将匿名化内容用于改善 AI 模型的权利（需明确同意）。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">四、服务限制</h2>
            <ul className="ml-4 flex flex-col gap-2 list-disc text-gray-600">
              <li>AI 生成内容可能存在不准确、不完整或不适宜的情况，请用户自行判断和修改</li>
              <li>我们不保证服务的持续可用性，可能因维护或不可抗力中断服务</li>
              <li>我们保留在不事先通知的情况下修改或终止服务的权利</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">五、免责声明</h2>
            <p>本服务按"现状"提供，不提供任何形式的明示或暗示保证。对于因使用本服务产生的任何直接或间接损失，我们不承担法律责任，法律另有规定除外。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">六、条款变更</h2>
            <p>我们可能不时更新本服务条款。重大变更将在本页面公告，继续使用本服务即视为接受修订后的条款。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">七、适用法律</h2>
            <p>本条款受中华人民共和国法律管辖。如发生争议，双方应友好协商解决；协商不成的，提交本公司所在地有管辖权的法院处理。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">八、联系我们</h2>
            <p>光环效应（杭州）人工智能应用有限公司</p>
            <p className="mt-1 text-gray-500">浙江省杭州市</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

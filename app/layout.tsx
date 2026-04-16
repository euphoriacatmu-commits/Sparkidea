import type { Metadata } from 'next'
import './globals.css'
import ToastContainer from '@/components/Toast'
import Footer from '@/components/Footer'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: '火花剧本 - AI短剧创作助手',
  description: '用 AI 生成爆款漫剧/短剧剧本，从想法到完整剧本全流程智能创作',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col">
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </AuthProvider>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  )
}

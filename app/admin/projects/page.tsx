'use client'

export default function AdminProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">项目总览</h1>
      <p className="text-sm text-gray-500 mb-8">查看所有用户创建的剧本项目</p>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">📁</div>
        <h2 className="text-base font-semibold text-gray-700 mb-2">项目数据说明</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          当前版本中，用户的剧本项目保存在各自浏览器的本地存储（localStorage）中。
          后续版本将开启云端同步功能，届时管理员可在此页面查看所有用户项目。
        </p>
        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 max-w-sm mx-auto">
          云端项目同步功能即将上线
        </div>
      </div>
    </div>
  )
}

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "仪表板 - eFront 私募基金管理系统";
  }, []);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          仪表板
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          欢迎使用 eFront 私募基金管理系统
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
        {/* Card 1 */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <span className="text-2xl">💼</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                0
              </h4>
              <span className="text-sm font-medium">管理基金数量</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <span className="text-2xl">📊</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                0
              </h4>
              <span className="text-sm font-medium">投资项目</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <span className="text-2xl">👥</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                0
              </h4>
              <span className="text-sm font-medium">投资者</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <span className="text-2xl">💰</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                $0
              </h4>
              <span className="text-sm font-medium">总资产规模</span>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
          欢迎使用 eFront 私募基金管理系统
        </h3>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            eFront 是一个专业的私募股权基金管理解决方案，帮助您高效管理基金、投资和投资者关系。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <h4 className="font-semibold text-black dark:text-white">基金管理</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  创建和管理基金，跟踪基金指标和绩效
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">💼</span>
              <div>
                <h4 className="font-semibold text-black dark:text-white">投资管理</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  管理投资组合，监控投资项目表现
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h4 className="font-semibold text-black dark:text-white">投资者关系</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  管理 LP 关系，处理资本催缴和分配
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h4 className="font-semibold text-black dark:text-white">绩效分析</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  实时跟踪 IRR、MOIC、DPI 等关键指标
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-meta-4 rounded-lg">
            <h4 className="font-semibold text-black dark:text-white mb-2">快速开始</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>点击左侧菜单中的 "基金管理" 创建您的第一个基金</li>
              <li>添加投资项目和投资者信息</li>
              <li>查看实时的绩效指标和报告</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

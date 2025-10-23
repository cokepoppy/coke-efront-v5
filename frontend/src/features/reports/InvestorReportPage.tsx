import { useEffect } from "react";

export default function InvestorReportPage() {
  useEffect(() => {
    document.title = "投资者报告 - eFront 私募基金管理系统";
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          投资者报告
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          生成和查看投资者季度/年度报告
        </p>
      </div>

      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📑</span>
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
            投资者报告
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            此功能正在开发中...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SidebarWidget() {
  return (
    <div
      className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-blue-50 px-4 py-5 text-center dark:bg-blue-900/20"
    >
      <div className="mb-3 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-xl">
          eF
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        eFront 私募基金系统
      </h3>
      <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
        专业的私募股权基金管理解决方案
      </p>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        版本 v1.0.0
      </div>
    </div>
  );
}

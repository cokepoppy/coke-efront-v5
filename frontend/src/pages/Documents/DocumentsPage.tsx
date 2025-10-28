import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
  fetchDocumentStats,
  clearError,
} from "../../features/documents/documentsSlice";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const { documents, loading, error, pagination, stats } = useAppSelector(
    (state) => state.documents
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    documentType: "",
    category: "",
    fileUrl: "",
    fileSize: 0,
    mimeType: "",
    isPublic: false,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = "文档管理 - eFront 私募基金管理系统";
    dispatch(fetchDocuments());
    dispatch(fetchDocumentStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = () => {
    dispatch(
      fetchDocuments({
        search: searchTerm,
        documentType: documentTypeFilter,
        category: categoryFilter,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchDocuments({
        page: newPage,
        search: searchTerm,
        documentType: documentTypeFilter,
        category: categoryFilter,
      })
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小（最大50MB）
    if (file.size > 50 * 1024 * 1024) {
      toast.error("文件大小不能超过50MB");
      return;
    }

    // 这里应该上传到服务器或云存储
    // 现在我们只是创建一个本地URL作为演示
    const fileUrl = URL.createObjectURL(file);

    setUploadData({
      ...uploadData,
      name: uploadData.name || file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
    });
  };

  const handleUpload = async () => {
    if (!uploadData.name || !uploadData.fileUrl) {
      toast.error("请填写文档名称并选择文件");
      return;
    }

    setUploading(true);
    try {
      await dispatch(createDocument(uploadData)).unwrap();
      toast.success("文档上传成功");
      setShowUploadModal(false);
      setUploadData({
        name: "",
        documentType: "",
        category: "",
        fileUrl: "",
        fileSize: 0,
        mimeType: "",
        isPublic: false,
      });
      dispatch(fetchDocuments());
      dispatch(fetchDocumentStats());
    } catch (error: any) {
      toast.error(error?.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除文档 "${name}" 吗？`)) return;

    try {
      await dispatch(deleteDocument(id)).unwrap();
      toast.success("文档已删除");
      dispatch(fetchDocuments());
      dispatch(fetchDocumentStats());
    } catch (error: any) {
      toast.error(error?.message || "删除失败");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getDocumentIcon = (mimeType?: string) => {
    if (!mimeType) return "📄";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📘";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📗";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎬";
    return "📄";
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black dark:text-white">
          文档管理
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理所有基金、投资和投资者相关文档
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.total}
                </h4>
                <span className="text-sm font-medium">总文档数</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.byType.length}
                </h4>
                <span className="text-sm font-medium">文档类型</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.byCategory.length}
                </h4>
                <span className="text-sm font-medium">分类数量</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <span className="text-2xl">🏷️</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.recentUploads.length}
                </h4>
                <span className="text-sm font-medium">最近上传</span>
              </div>
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />

            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="">所有类型</option>
              <option value="contract">合同</option>
              <option value="report">报告</option>
              <option value="statement">报表</option>
              <option value="certificate">证书</option>
              <option value="presentation">演示文稿</option>
              <option value="other">其他</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="">所有分类</option>
              <option value="fund">基金</option>
              <option value="investment">投资</option>
              <option value="investor">投资者</option>
              <option value="legal">法律</option>
              <option value="financial">财务</option>
              <option value="compliance">合规</option>
              <option value="other">其他</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded bg-meta-3 py-3 px-6 font-medium text-white hover:bg-opacity-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                上传
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  文档
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  类型
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  分类
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  大小
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  上传时间
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="text-6xl mb-4 block">📁</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      暂无文档数据
                    </p>
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={index % 2 === 0 ? "bg-gray-2 dark:bg-meta-4" : ""}
                  >
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDocumentIcon(doc.mimeType)}</span>
                        <div>
                          <h5 className="font-medium text-black dark:text-white">
                            {doc.name}
                          </h5>
                          {doc.version > 1 && (
                            <p className="text-sm text-meta-5">v{doc.version}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {doc.documentType || "-"}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {doc.category || "-"}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {formatFileSize(doc.fileSize ? Number(doc.fileSize) : undefined)}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {format(new Date(doc.uploadedAt), "yyyy-MM-dd HH:mm")}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center gap-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 text-sm"
                        >
                          下载
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="inline-flex items-center justify-center rounded-full bg-danger py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-stroke dark:border-strokedark">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              显示 {(pagination.page - 1) * pagination.pageSize + 1} 到{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
              共 {pagination.total} 条
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                  )
                  .map((p, i, arr) => (
                    <>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span key={`ellipsis-${p}`} className="px-2 py-2">
                          ...
                        </span>
                      )}
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`rounded py-2 px-4 font-medium ${
                          pagination.page === p
                            ? "bg-primary text-white"
                            : "bg-gray text-black hover:bg-primary hover:text-white dark:bg-meta-4 dark:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    </>
                  ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            style={{ zIndex: 100000 }}
            onClick={() => !uploading && setShowUploadModal(false)}
          />

          {/* Modal */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
            style={{ zIndex: 100001 }}
          >
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  上传文档
                </h3>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  disabled={uploading}
                  className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    文档名称 <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, name: e.target.value })
                    }
                    placeholder="请输入文档名称"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4.5">
                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                      文档类型
                    </label>
                    <select
                      value={uploadData.documentType}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, documentType: e.target.value })
                      }
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    >
                      <option value="">请选择</option>
                      <option value="contract">合同</option>
                      <option value="report">报告</option>
                      <option value="statement">报表</option>
                      <option value="certificate">证书</option>
                      <option value="presentation">演示文稿</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                      分类
                    </label>
                    <select
                      value={uploadData.category}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, category: e.target.value })
                      }
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    >
                      <option value="">请选择</option>
                      <option value="fund">基金</option>
                      <option value="investment">投资</option>
                      <option value="investor">投资者</option>
                      <option value="legal">法律</option>
                      <option value="financial">财务</option>
                      <option value="compliance">合规</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    选择文件 <span className="text-meta-1">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                  {uploadData.fileSize > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      文件大小: {formatFileSize(uploadData.fileSize)}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadData.isPublic}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, isPublic: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <div className="mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark">
                      {uploadData.isPublic && (
                        <span className="text-primary">
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-black dark:text-white">公开文档</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {uploading ? "上传中..." : "上传"}
                  </button>
                  <button
                    onClick={() => !uploading && setShowUploadModal(false)}
                    disabled={uploading}
                    className="flex-1 justify-center rounded border border-stroke p-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

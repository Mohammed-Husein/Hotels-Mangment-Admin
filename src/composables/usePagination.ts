import type { Pagination } from "@/types/app/Pagination";

export const usePagination = (limit = 8, currentPage = 1, totalCount = 1) => {
  const pagination = ref<Pagination>({
    totalCount,
    currentPage,
    limit,
    get totalPages() {
      return Math.ceil(this.totalCount / this.limit);
    },
  });

  const paginate = <T>(array: T[]): T[] => {
    pagination.value.totalCount = array.length;

    return array.slice(
      (pagination.value.currentPage - 1) * pagination.value.limit,
      pagination.value.currentPage * pagination.value.limit
    );
  };

  // ⚠️ هذه الدالة تعطيك المعاملات المناسبة لإرسالها إلى السيرفر
  const getServerQueryParams = () => {
    return {
      page: pagination.value.currentPage, // السيرفر يتوقع "page"
      limit: pagination.value.limit,
    };
  };

  return { pagination, paginate, getServerQueryParams };
};

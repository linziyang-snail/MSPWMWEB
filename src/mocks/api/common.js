export const mockNoResponse = async () => ({});

export const createPage = (items, page = 1, size = 20) => {
  const currentPage = Number(page) || 1;
  const pageSize = Number(size) || 20;
  const start = (currentPage - 1) * pageSize;

  return {
    content: items.slice(start, start + pageSize),
    totalElements: items.length,
    page: currentPage,
    size: pageSize,
  };
};

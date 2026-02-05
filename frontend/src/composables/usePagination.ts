import { ref, computed } from 'vue';

export function usePagination(defaultItemsPerPage = 8) {
  const page = ref(1);
  const itemsPerPage = ref(defaultItemsPerPage);
  const totalItems = ref(0);

  const pageCount = computed(() => {
    return Math.ceil(totalItems.value / itemsPerPage.value);
  });

  const offset = computed(() => {
    return (page.value - 1) * itemsPerPage.value;
  });

  return {
    page,
    itemsPerPage,
    totalItems,
    pageCount,
    offset
  };
}
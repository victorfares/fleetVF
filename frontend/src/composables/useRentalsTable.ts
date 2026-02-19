import { ref } from 'vue';

export function useRentalsTable() {
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const expanded = ref([]);
  const search = ref('');

  const headers = [
    { title: 'Cliente', key: 'user.name', sortable: false, minWidth: '220px' },
    { title: 'Veículo', key: 'car.model', sortable: false, minWidth: '160px' },
    { title: 'Retirada', key: 'startDate', sortable: true, minWidth: '140px' },
    { title: 'Ag. Retirada', key: 'pickupAgency.name', sortable: false, minWidth: '180px' },
    { title: 'Devolução', key: 'endDate', sortable: true, minWidth: '140px' },
    { title: 'Ag. Devolução', key: 'returnAgency.name', sortable: false, minWidth: '180px' },
    { title: 'Status', key: 'status', sortable: true, align: 'center' as const, minWidth: '120px' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'end' as const, minWidth: '130px', fixed: true },
  ];

  const statusOptions = [
    { title: 'Todos', value: null },
    { title: 'Confirmados', value: 'CONFIRMED' },
    { title: 'Ativos (Em Andamento)', value: 'ACTIVE' },
    { title: 'Finalizados', value: 'COMPLETED' },
    { title: 'Cancelados', value: 'CANCELLED' },
  ];

  return {
    itemsPerPage,
    currentPage,
    expanded,
    search,
    headers,
    statusOptions,
  };
}
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';
import type { Agency } from '@/types/Agency';

interface UseCarFormProps {
  carToEdit?: Car | null;
  onSaved: () => void; // Callback para quando salvar com sucesso
}

export function useCarForm(props: UseCarFormProps) {
  const formRef = ref<any>(null);
  const saving = ref(false);
  const loadingAgencies = ref(false);
  const agencies = ref<Agency[]>([]);
  
  const isEditing = computed(() => !!props.carToEdit);

  const formData = reactive({
    brand: '',
    model: '',
    licensePlate: '',
    dailyRate: 0,
    currentMileage: 0,
    agencyId: null as number | null,
    status: CarStatus.AVAILABLE,
    imageUrl: ''
  });

  const rules = {
    required: (v: any) => !!v || 'Obrigatório',
    positive: (v: number) => v > 0 || 'Deve ser positivo',
    minKm: (v: number) => v >= 0 || 'Inválido'
  };

  const statusOptions = [
    { label: 'Disponível', value: CarStatus.AVAILABLE },
    { label: 'Alugado', value: CarStatus.RENTED },
    { label: 'Em Manutenção', value: CarStatus.MAINTENANCE },
  ];

  const fetchAgencies = async () => {
    loadingAgencies.value = true;
    try {
      const response = await api.get('/agencies', { params: { limit: 100 } });
      agencies.value = response.data.data.data;
    } catch (error) {
      console.error('Erro ao buscar agências', error);
    } finally {
      loadingAgencies.value = false;
    }
  };

  const initForm = () => {
    if (props.carToEdit) {
      Object.assign(formData, {
        ...props.carToEdit,
        agencyId: props.carToEdit.agency?.id
      });
    }
  };

  const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    saving.value = true;
    try {
      const payload = { ...formData };
      
      if (isEditing.value && props.carToEdit) {
        await api.patch(`/cars/${props.carToEdit.id}`, payload);
      } else {
        await api.post('/cars', payload);
      }
      
      props.onSaved(); // Avisa quem chamou que deu certo
    } catch (error) {
      console.error(error);
    } finally {
      saving.value = false;
    }
  };

  onMounted(() => {
    fetchAgencies();
    initForm();
  });

  return {
    formRef,
    formData,
    rules,
    saving,
    isEditing,
    agencies,
    loadingAgencies,
    statusOptions,
    save
  };
}
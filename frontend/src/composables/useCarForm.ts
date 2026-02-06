import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';
import type { Agency } from '@/types/Agency';

interface UseCarFormProps {
  carToEdit?: Car | null;
  onSaved: () => void;
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

  // Regras de Validação
  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
    positive: (v: number) => v > 0 || 'Valor deve ser positivo',
    // Validação da KM anterior vs Nova KM
    minCurrentKm: (v: number) => {
      if (!isEditing.value || !props.carToEdit) return true;
      return v >= props.carToEdit.currentMileage || `A KM não pode ser menor que a atual (${props.carToEdit.currentMileage} km)`;
    }
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
      console.error('Falha ao carregar agências', error);
    } finally {
      loadingAgencies.value = false;
    }
  };

  const initForm = () => {
    if (props.carToEdit) {
      formData.brand = props.carToEdit.brand;
      formData.model = props.carToEdit.model;
      formData.licensePlate = props.carToEdit.licensePlate;
      formData.dailyRate = Number(props.carToEdit.dailyRate);
      formData.currentMileage = Number(props.carToEdit.currentMileage);
      formData.status = props.carToEdit.status;
      formData.imageUrl = props.carToEdit.imageUrl || '';
      formData.agencyId = props.carToEdit.agency?.id || null;
    }
  };

  const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    saving.value = true;
    try {
      if (isEditing.value && props.carToEdit) {
        const patchPayload = {
          dailyRate: Number(formData.dailyRate),
          currentMileage: Number(formData.currentMileage),
          imageUrl: formData.imageUrl,
          status: formData.status
        };

        await api.patch(`/cars/${props.carToEdit.id}`, patchPayload);
      
      } else {
        const postPayload = {
          ...formData,
          dailyRate: Number(formData.dailyRate),
          currentMileage: Number(formData.currentMileage)
        };
        
        await api.post('/cars', postPayload);
      }
      
      props.onSaved();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        alert(`Erro de Validação:\n- ${message.join('\n- ')}`);
      } else {
        alert(`Erro: ${message || 'Falha ao processar requisição.'}`);
      }
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
import { ref, reactive, computed, onMounted, unref, type Ref } from 'vue';
import api from '@/services/api';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';
import type { Agency } from '@/types/Agency';

interface UseCarFormOptions {
  carRef: Ref<Car | null | undefined>; 
  onSaved: () => void;
  onError?: (msg: string) => void;
}

export function useCarForm(options: UseCarFormOptions) {
  const formRef = ref<any>(null);
  const saving = ref(false);
  const loadingAgencies = ref(false);
  const agencies = ref<Agency[]>([]);
  
  const isEditing = computed(() => !!options.carRef.value?.id);

  const formData = reactive({
    brand: '',
    model: '',
    licensePlate: '',
    dailyRate: 0,
    currentMileage: 0,
    agencyId: null as string | null,
    status: CarStatus.AVAILABLE,
    imageUrl: ''
  });

  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
    positive: (v: number) => v > 0 || 'Valor deve ser positivo',
    minCurrentKm: (v: number) => {
      // Usa options.carRef.value para pegar o carro atual
      const currentCar = options.carRef.value;
      if (!isEditing.value || !currentCar) return true;
      return v >= currentCar.currentMileage || `A KM não pode ser menor que a atual (${currentCar.currentMileage} km)`;
    }
  };

  const statusOptions = [
    { title: 'Disponível', value: CarStatus.AVAILABLE },
    { title: 'Alugado', value: CarStatus.RENTED },
    { title: 'Em Manutenção', value: CarStatus.MAINTENANCE },
  ];

  const fetchAgencies = async () => {
    loadingAgencies.value = true;
    try {
      const response = await api.get('/agencies'); 
      const data = response.data.data ? response.data.data : response.data;
      agencies.value = Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Falha ao carregar agências', error);
    } finally {
      loadingAgencies.value = false;
    }
  };

  const initForm = () => {
    const car = options.carRef.value;

    if (car) {
      formData.brand = car.brand;
      formData.model = car.model;
      formData.licensePlate = car.licensePlate;
      formData.dailyRate = Number(car.dailyRate);
      formData.currentMileage = Number(car.currentMileage);
      formData.status = car.status;
      formData.imageUrl = car.imageUrl || '';
      formData.agencyId = car.agency?.id || car.agencyId || null;
    } else {
      // MODO CRIAÇÃO (Reset)
      formData.brand = '';
      formData.model = '';
      formData.licensePlate = '';
      formData.dailyRate = 0;
      formData.currentMileage = 0;
      formData.agencyId = null;
      formData.status = CarStatus.AVAILABLE;
      formData.imageUrl = '';
    }
  };

  const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    saving.value = true;
    try {
      const basePayload = {
        brand: formData.brand,
        model: formData.model,
        dailyRate: Number(formData.dailyRate),
        currentMileage: Number(formData.currentMileage),
        agencyId: formData.agencyId,
        status: formData.status,
        imageUrl: formData.imageUrl
      };

      const car = options.carRef.value;

      if (isEditing.value && car) {
        await api.patch(`/cars/${car.id}`, basePayload);
      } else {
        const postPayload = {
          ...basePayload,
          licensePlate: formData.licensePlate.toUpperCase()
        };
        await api.post('/cars', postPayload);
      }
      
      options.onSaved();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const msg = error.response?.data?.message || 'Erro ao salvar veículo.';
      if (options.onError) {
        options.onError(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    } finally {
      saving.value = false;
    }
  };

  onMounted(() => {
    fetchAgencies();
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
    initForm,
    save
  };
}
import { ref } from 'vue';
import api from '@/services/api';
import { useAlertStore } from '@/stores/alert';

export function useUserForm() {
  const formRef = ref<any>(null);
  const loading = ref(false);
  const showPassword = ref(false);
  
  const formData = ref({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });

  const roles = [
    { title: 'Cliente', value: 'CLIENT' },
    { title: 'Gerente (Manager)', value: 'MANAGER' },
    { title: 'Administrador', value: 'ADMIN' },
  ];

  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
    passwordCreation: (v: string) => v.length >= 6 || 'A senha deve ter no mínimo 6 caracteres',
  };

  const alertStore = useAlertStore();

  const submitForm = async (userId: string | null) => {
    loading.value = true;
    try {
      if (userId) {
        const updatePayload = {
          name: formData.value.name,
          role: formData.value.role,
        };
        await api.patch(`/users/${userId}`, updatePayload);
        alertStore.showSuccess('Usuário atualizado com sucesso!'); 
      } else {
        // MODO CRIAÇÃO
        await api.post('/users', formData.value);
        alertStore.showSuccess('Usuário criado com sucesso!');
      }
      return true;
    } catch (error: any) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    formRef,
    loading,
    showPassword,
    formData,
    roles,
    rules,
    submitForm,
  };
}
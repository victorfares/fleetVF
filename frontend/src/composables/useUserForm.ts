import { ref } from 'vue';
import api from '@/services/api';
import { useAppStore } from '@/stores/app';

export function useUserForm() {
  const appStore = useAppStore();
  
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
    { title: 'Administrador (Admin)', value: 'ADMIN' },
  ];

  const rules = {
    required: (v: string) => !!v || 'Campo obrigatório',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
    passwordCreation: (v: string) => !!v || 'A senha é obrigatória para novos usuários',
  };

  const submitForm = async (userId: string | null) => {
    loading.value = true;
    try {
      const payload = { ...formData.value };

      if (userId) {
        if (!payload.password) delete (payload as any).password;
        await api.patch(`/users/${userId}`, payload);
        if (appStore.notifySuccess) appStore.notifySuccess('Usuário atualizado com sucesso!');
      } else {
        await api.post('/users', payload);
        if (appStore.notifySuccess) appStore.notifySuccess('Usuário criado com sucesso!');
      }
      
      return true;

    } catch (error: any) {
      console.error(error);
      if (appStore.notifyError) {
        appStore.notifyError(error.response?.data?.message || 'Erro ao salvar o usuário.');
      }
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
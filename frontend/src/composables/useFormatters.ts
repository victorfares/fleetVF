export function useFormatters() {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCarStatus = (status: string) => {
    const map: Record<string, string> = {
      'AVAILABLE': 'Disponível',
      'RENTED': 'Alugado',
      'MAINTENANCE': 'Manutenção'
    };
    return map[status] || status;
  };

  const getCarStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'AVAILABLE': 'green-lighten-4 text-green-darken-4',
      'RENTED': 'grey-lighten-3 text-grey',
      'MAINTENANCE': 'amber-lighten-4 text-amber-darken-4'
    };
    return map[status] || 'grey';
  };

  const formatRentalStatus = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado', // Reserva feita
      'ACTIVE': 'Em Andamento',  // Check-in feito
      'COMPLETED': 'Finalizado', // Devolvido
      'CANCELLED': 'Cancelado',
    };
    return map[status] || status;
  };

  const getRentalStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'orange-lighten-4 text-orange-darken-4',
      'CONFIRMED': 'blue-lighten-4 text-blue-darken-4',
      'ACTIVE': 'green-lighten-4 text-green-darken-4',
      'COMPLETED': 'grey-lighten-3 text-grey-darken-2',
      'CANCELLED': 'red-lighten-4 text-red-darken-4',
    };
    return map[status] || 'grey';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    formatCurrency,
    formatDate,
    formatCarStatus,
    getCarStatusColor,
    formatRentalStatus,
    getRentalStatusColor,
  };
}
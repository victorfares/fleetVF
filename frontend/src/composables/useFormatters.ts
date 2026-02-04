export function useFormatters() {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      'AVAILABLE': 'Disponível',
      'RENTED': 'Alugado',
      'MAINTENANCE': 'Manutenção'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'AVAILABLE': 'green-lighten-4 text-green-darken-4',
      'RENTED': 'grey-lighten-3 text-grey',
      'MAINTENANCE': 'amber-lighten-4 text-amber-darken-4'
    };
    return map[status] || 'grey';
  };

  return {
    formatCurrency,
    formatStatus,
    getStatusColor
  };
}
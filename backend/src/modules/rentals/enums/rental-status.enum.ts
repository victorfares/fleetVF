export enum RentalStatus {
  PENDING = 'PENDING', // Reserva criada, pagamento pendente ou aguardando data
  CONFIRMED = 'CONFIRMED', // Pagamento ok, aguardando retirada
  ACTIVE = 'ACTIVE', // Carro retirado (Check-in realizado)
  COMPLETED = 'COMPLETED', // Carro devolvido (Check-out realizado)
  CANCELLED = 'CANCELLED', // Cancelado
}

interface FlexibleService {
  price: number
  duration: number
  isFlexible?: boolean
  minPrice?: number | null
  maxPrice?: number | null
  minDuration?: number | null
  maxDuration?: number | null
}

export function formatServicePrice(service: FlexibleService): string {
  if (service.isFlexible) {
    if (service.minPrice && service.maxPrice) return `${service.minPrice}€ – ${service.maxPrice}€`
    if (service.minPrice) return `A partir de ${service.minPrice}€`
    if (service.maxPrice) return `Até ${service.maxPrice}€`
    if (!service.price) return 'Preço variável'
  }
  return `${service.price}€`
}

export function formatServiceDuration(service: FlexibleService): string {
  if (service.isFlexible) {
    if (service.minDuration && service.maxDuration) return `${service.minDuration} – ${service.maxDuration} min`
    if (service.minDuration) return `A partir de ${service.minDuration} min`
    if (service.maxDuration) return `Até ${service.maxDuration} min`
  }
  return `${service.duration} min`
}

// src/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  // Assuming Kenyan phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `254${cleaned}`
  }
  return cleaned
}

// src/utils/validators.ts
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^254[17]\d{8}$/
  return phoneRegex.test(phone)
}

export const validateAmount = (amount: number): boolean => {
  return amount >= 1 && amount <= 150000
}
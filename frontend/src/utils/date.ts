//DAY MONTH YEAR
export function formatDateDMY(dateToFormat: string) {
  try {
    const date = new Date(dateToFormat)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Não foi possível formatar a data:', error)
    return dateToFormat
  }
}

//DAY MONTH YEAR HOUR MINUTE
export function formatDateDMYHM(dateToFormat: string) {
  try {
    const dmyDate = formatDateDMY(dateToFormat)
    const hmDate = formatDateHM(dateToFormat)
    return `${dmyDate} às ${hmDate}`
  } catch (error) {
    console.error('Não foi possível formatar a data:', error)
    return dateToFormat
  }
}

//HOUR MINUTE
export function formatDateHM(dateToFormat: string) {
  try {
    const date = new Date(dateToFormat)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (error) {
    console.error('Não foi possível formatar a data:', error)
    return dateToFormat
  }
}

//
export function formatDateLastActive(isoString: string | undefined | null) {
  if (!isoString) return 'nunca'

  const date = new Date(isoString)
  if (isNaN(date.getTime())) return 'nunca'

  const diffInDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (!isFinite(diffInDays)) return 'nunca'

  return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(diffInDays, 'day')
}

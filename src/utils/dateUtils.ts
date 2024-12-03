import { format, isValid, parseISO, parse } from "date-fns"

export const isValidDateString = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false
  try {
    const isoDate = parseISO(dateString)
    if (isValid(isoDate)) return true

    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MM-dd-yyyy',
      'dd-MM-yyyy'
    ]

    for (const formatStr of formats) {
      const parsedDate = parse(dateString, formatStr, new Date())
      if (isValid(parsedDate)) return true
    }

    return false
  } catch {
    return false
  }
}

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ""
  try {
    let date = parseISO(dateString)
    if (isValid(date)) {
      return format(date, "PPP")
    }

    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MM-dd-yyyy',
      'dd-MM-yyyy'
    ]

    for (const formatStr of formats) {
      date = parse(dateString, formatStr, new Date())
      if (isValid(date)) {
        return format(date, "PPP")
      }
    }

    return dateString
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

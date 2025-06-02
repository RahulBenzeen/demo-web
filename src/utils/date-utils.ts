import { format, parseISO, subDays, isAfter } from "date-fns"
import type { Timestamp } from "firebase/firestore"

export function formatDate(dateValue: any, formatString = "MMM dd, yyyy"): string {
  try {
    let date: Date

    if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === "string") {
      date = parseISO(dateValue)
    } else if (dateValue && typeof (dateValue as Timestamp)?.toDate === "function") {
      date = (dateValue as Timestamp).toDate()
    } else {
      return "Invalid date"
    }

    return format(date, formatString)
  } catch {
    return "Invalid date"
  }
}

export function isDateAfter(dateValue: any, compareDate: Date): boolean {
  try {
    let date: Date

    if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === "string") {
      date = parseISO(dateValue)
    } else if (dateValue && typeof (dateValue as Timestamp)?.toDate === "function") {
      date = (dateValue as Timestamp).toDate()
    } else {
      return false
    }

    return isAfter(date, compareDate)
  } catch {
    return false
  }
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

export function generateDateLabels(days: number): string[] {
  const today = new Date()
  return Array.from({ length: days }, (_, i) => format(subDays(today, days - i - 1), "MMM dd"))
}

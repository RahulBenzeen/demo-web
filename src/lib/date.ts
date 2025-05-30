import { format, parseISO } from "date-fns";

export const safeFormatDate = (date: Date | string | undefined, formatStr = "MMM dd, yyyy") => {
  try {
    if (!date) return "N/A";
    if (date instanceof Date) return format(date, formatStr);
    return format(parseISO(date), formatStr);
  } catch {
    return "Invalid Date";
  }
};

export const safeParseDate = (date: Date | string | undefined) => {
  try {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    return parseISO(date);
  } catch {
    return new Date();
  }
};
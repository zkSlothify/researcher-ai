import { DateConfig } from "../types";

export const parseDate = (dateStr: String): any => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export const formatDate = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const addOneDay = (dateObj: Date): Date => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    return next;
};

export const callbackDateRangeLogic = async (filter: DateConfig, callback: Function) => {
    if (filter.after && filter.before) {
      let current = parseDate(filter.after);
      const end = parseDate(filter.before);
      while (current <= end) {
        const dayStr = formatDate(current);
        await callback(dayStr);
        current = addOneDay(current);
      }
    } else if (filter.filterType === 'during' && filter.date) {
      await callback(filter.date);
    } else if (filter.filterType === 'before' && filter.date) {
      const earliest = new Date(2020, 0, 1);
      let current = earliest;
      const end = parseDate(filter.date);
      while (current <= end) {
        const dayStr = formatDate(current);
        await callback(dayStr);
        current = addOneDay(current);
      }
    } else if (filter.filterType === 'after' && filter.date) {
      let current = parseDate(filter.date);
      const today = new Date();
      while (current <= today) {
        const dayStr = formatDate(current);
        await callback(dayStr);
        current = addOneDay(current);
      }
    }
  }
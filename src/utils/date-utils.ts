import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const YYMM_FORMAT = 'YYMM';

export const YYYY_MM_FORMAT = 'YYYY-MM';

export const YYYY_MM_DD_FORMAT = 'YYYY-MM-DD';

export function parseDate(date: string, format = YYYY_MM_DD_FORMAT): Dayjs {
  return dayjs.tz(date, format, 'Asia/Tokyo');
}

export function parseUnixtime(unixtime: number): Dayjs {
  return dayjs.unix(unixtime).tz('Asia/Tokyo');
}

export function parseYYMM(date: string): Dayjs {
  return parseDate(date, YYMM_FORMAT);
}

export function formatDate(date: Dayjs, format: string): string {
  return date.format(format);
}

export function formatYYMM(date: Dayjs): string {
  return formatDate(date, YYMM_FORMAT);
}

export function startOfMonth(date: Dayjs): Dayjs {
  return date.tz('Asia/Tokyo').startOf('month');
}

export function endOfMonth(date: Dayjs): Dayjs {
  return date.tz('Asia/Tokyo').endOf('month');
}

export function addMonths(date: Dayjs, months: number): Dayjs {
  return date.add(months, 'month');
}

export function subtractMonths(date: Dayjs, months: number): Dayjs {
  return date.subtract(months, 'month');
}

export function diffInMonths(date1: Dayjs, date2: Dayjs): number {
  return date1.diff(date2, 'month');
}

export function toJSTString(date: Dayjs): string {
  return date.format('YYYY-MM-DDTHH:mm:ssZ');
}

export function compareDatesDesc(date1: string, date2: string, format: string): number {
  return dayjs.tz(date2, format, 'Asia/Tokyo').diff(dayjs.tz(date1, format, 'Asia/Tokyo'));
}

export function formatJPDateFromUnixtime(unixtime: number): string {
  return dayjs.unix(unixtime).tz('Asia/Tokyo').format('YYYY年MM月DD日');
}

export function formatJPDateTimeFromISO(isoString: string): string {
  return dayjs(isoString).tz('Asia/Tokyo').format('YYYY/M/D H:mm:ss');
}

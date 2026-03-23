import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateHonduras = (dateInput) => {
  return dayjs(dateInput)
    .tz("America/Tegucigalpa")
    .format("YYYY-MM-DD HH:mm:ss");
}
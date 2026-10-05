import { format } from 'date-fns';

export function formatTime(isoString) {
  try {
    return format(new Date(isoString), 'HH:mm:ss');
  } catch {
    return isoString;
  }
}

export function formatDate(isoString) {
  try {
    return format(new Date(isoString), 'MMM dd, yyyy HH:mm');
  } catch {
    return isoString;
  }
}

export default formatDate;

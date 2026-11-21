/**
 * Format a number as Indian Rupee with commas
 */
export function formatCurrency(value) {
  if (value == null) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date string relative to now
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  if (diffSec < 60) return isPast ? 'just now' : 'in a moment';
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return isPast ? `${m}m ago` : `in ${m}m`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return isPast ? `${h}h ago` : `in ${h}h`;
  }
  const d = Math.floor(diffSec / 86400);
  return isPast ? `${d}d ago` : `in ${d}d`;
}

/**
 * Format a date as a readable string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const formatDateTime = formatDate;

/**
 * Format just the date part
 */
export function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Return CSS class for auction status badge
 */
export function getStatusBadgeClass(status) {
  const map = {
    ACTIVE: 'badge-active',
    SCHEDULED: 'badge-scheduled',
    UPCOMING: 'badge-scheduled',
    ENDED: 'badge-ended',
    CANCELLED: 'badge-cancelled',
  };
  return map[status] || 'badge-ended';
}

/**
 * Format auction status for display
 */
export function formatStatus(status) {
  if (!status) return '';
  const map = {
    ACTIVE: 'Active',
    SCHEDULED: 'Scheduled',
    ENDED: 'Ended',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
}

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred';
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.fieldErrors) {
    const fieldErrors = error.response.data.fieldErrors;
    return Object.values(fieldErrors)[0] || 'Validation failed';
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format a number as a local datetime string suitable for datetime-local input
 */
export function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Generic formatters for VibeThink Orchestrator
 * Reusable across all apps in the monorepo
 */

export interface FormatOptions {
  locale?: string;
  currency?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

// Currency formatting
export function formatCurrency(amount: number, options: FormatOptions = {}): string {
  const { locale = "en-US", currency = "USD", decimals = 2, prefix = "", suffix = "" } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatter.format(amount)}${suffix}`;
}

// Number formatting
export function formatNumber(value: number, options: FormatOptions = {}): string {
  const { locale = "en-US", decimals = 0, prefix = "", suffix = "" } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatter.format(value)}${suffix}`;
}

// Percentage formatting
export function formatPercentage(value: number, options: FormatOptions = {}): string {
  const { decimals = 1, prefix = "", suffix = "%" } = options;

  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

// Date formatting
export function formatDate(
  date: Date | string,
  options: { locale?: string; format?: "short" | "long" | "relative" } = {}
): string {
  const { locale = "en-US", format = "short" } = options;
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    return formatRelativeDate(dateObj);
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: format === "long" ? "long" : "short",
    day: "numeric",
  });

  return formatter.format(dateObj);
}

// Relative date formatting
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays === -1) return "Tomorrow";
  if (diffInDays > 0 && diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 0 && diffInDays > -7) return `In ${Math.abs(diffInDays)} days`;

  return formatDate(date, { format: "short" });
}

// Text formatting
export function formatText(
  text: string,
  options: {
    case?: "lower" | "upper" | "title" | "camel" | "kebab";
    maxLength?: number;
    ellipsis?: boolean;
  } = {}
): string {
  const { case: textCase, maxLength, ellipsis = true } = options;
  let formatted = text;

  // Case formatting
  switch (textCase) {
    case "lower":
      formatted = formatted.toLowerCase();
      break;
    case "upper":
      formatted = formatted.toUpperCase();
      break;
    case "title":
      formatted = formatted.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      break;
    case "camel":
      formatted = formatted.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      break;
    case "kebab":
      formatted = formatted.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      break;
  }

  // Length formatting
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength);
    if (ellipsis) {
      formatted += "...";
    }
  }

  return formatted;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }

  return phone;
}

// Email masking
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return email;

  const maskedLocal =
    localPart.charAt(0) + "*".repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

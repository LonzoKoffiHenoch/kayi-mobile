import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { CI_CONSTANTS } from '../../config/constants';
import { Commune } from '../types/common.types';
import { formatCIPhone } from './validators';

// Locale mapping
const LOCALES = {
  fr: fr,
  en: enUS,
};

/**
 * Formate un prix en FCFA avec séparateurs français
 */
export const formatCurrency = (
  amount: number, 
  options: {
    showSymbol?: boolean;
    compact?: boolean;
    language?: 'fr' | 'en';
  } = {}
): string => {
  const { showSymbol = true, compact = false, language = 'fr' } = options;
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '0 FCFA' : '0';
  }

  if (compact) {
    return formatCurrencyShort(amount, { showSymbol, language });
  }

  // Formatage avec séparateurs d'espace (style français)
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return showSymbol ? `${formatted} FCFA` : formatted;
};

/**
 * Formate un prix en version compacte (150k FCFA)
 */
export const formatCurrencyShort = (
  amount: number,
  options: {
    showSymbol?: boolean;
    language?: 'fr' | 'en';
  } = {}
): string => {
  const { showSymbol = true, language = 'fr' } = options;
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '0 FCFA' : '0';
  }

  const absAmount = Math.abs(amount);
  let formatted: string;
  
  if (absAmount >= 1_000_000_000) {
    // Milliards
    const value = absAmount / 1_000_000_000;
    formatted = `${value.toFixed(value < 10 ? 1 : 0)}${language === 'fr' ? 'Md' : 'B'}`;
  } else if (absAmount >= 1_000_000) {
    // Millions
    const value = absAmount / 1_000_000;
    formatted = `${value.toFixed(value < 10 ? 1 : 0)}M`;
  } else if (absAmount >= 1_000) {
    // Milliers
    const value = absAmount / 1_000;
    formatted = `${value.toFixed(value < 10 ? 1 : 0)}k`;
  } else {
    formatted = Math.round(absAmount).toString();
  }

  // Ajouter le signe si négatif
  if (amount < 0) {
    formatted = `-${formatted}`;
  }

  return showSymbol ? `${formatted} FCFA` : formatted;
};

/**
 * Formate un numéro de téléphone ivoirien pour l'affichage
 */
export const formatPhoneDisplay = (
  phone: string,
  options: {
    international?: boolean;
    masked?: boolean;
  } = {}
): string => {
  const { international = false, masked = false } = options;
  
  if (!phone) return '';
  
  const formatted = formatCIPhone(phone, international);
  
  if (masked && formatted) {
    // Masquer les 6 chiffres du milieu: +225 01 XX XX XX 89
    const parts = formatted.split(' ');
    if (parts.length >= 5) {
      parts[2] = 'XX';
      parts[3] = 'XX';
      parts[4] = 'XX';
      return parts.join(' ');
    }
  }
  
  return formatted || phone;
};

/**
 * Formate une adresse complète
 */
export const formatAddress = (address: {
  details?: string;
  neighborhood?: string;
  commune?: Commune | string;
  city?: string;
}): string => {
  const parts: string[] = [];
  
  if (address.details?.trim()) {
    parts.push(address.details.trim());
  }
  
  if (address.neighborhood?.trim()) {
    parts.push(address.neighborhood.trim());
  }
  
  if (address.commune?.trim()) {
    const communeFormatted = address.commune.charAt(0).toUpperCase() + 
                           address.commune.slice(1).toLowerCase();
    parts.push(communeFormatted);
  }
  
  if (address.city?.trim()) {
    parts.push(address.city.trim());
  } else if (address.commune) {
    // Par défaut, ajouter Abidjan pour les communes connues
    if (CI_CONSTANTS.POPULAR_COMMUNES.includes(address.commune.toUpperCase() as any)) {
      parts.push('Abidjan');
    }
  }

  return parts.join(', ');
};

/**
 * Formate un temps relatif (il y a X temps)
 */
export const formatRelativeTime = (
  date: string | Date,
  options: {
    language?: 'fr' | 'en';
    addSuffix?: boolean;
  } = {}
): string => {
  const { language = 'fr', addSuffix = true } = options;
  
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(targetDate)) {
      return language === 'fr' ? 'Date invalide' : 'Invalid date';
    }

    return formatDistanceToNow(targetDate, {
      addSuffix,
      locale: LOCALES[language],
    });
  } catch (error) {
    return language === 'fr' ? 'Date invalide' : 'Invalid date';
  }
};

/**
 * Formate une date absolue
 */
export const formatAbsoluteDate = (
  date: string | Date,
  options: {
    language?: 'fr' | 'en';
    includeTime?: boolean;
    format?: string;
  } = {}
): string => {
  const { language = 'fr', includeTime = false } = options;
  
  try {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(targetDate)) {
      return language === 'fr' ? 'Date invalide' : 'Invalid date';
    }

    let formatString = options.format;
    if (!formatString) {
      if (language === 'fr') {
        formatString = includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
      } else {
        formatString = includeTime ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy';
      }
    }

    return format(targetDate, formatString, {
      locale: LOCALES[language],
    });
  } catch (error) {
    return language === 'fr' ? 'Date invalide' : 'Invalid date';
  }
};

/**
 * Formate une distance en mètres/kilomètres
 */
export const formatDistance = (
  distanceInMeters: number,
  options: {
    language?: 'fr' | 'en';
    precision?: number;
  } = {}
): string => {
  const { language = 'fr', precision = 1 } = options;
  
  if (typeof distanceInMeters !== 'number' || isNaN(distanceInMeters)) {
    return language === 'fr' ? 'Distance inconnue' : 'Unknown distance';
  }

  const absDistance = Math.abs(distanceInMeters);
  
  if (absDistance >= 1000) {
    // Kilomètres
    const km = absDistance / 1000;
    return `${km.toFixed(precision)} km`;
  } else {
    // Mètres
    return `${Math.round(absDistance)} m`;
  }
};

/**
 * Formate une taille de fichier
 */
export const formatFileSize = (
  bytes: number,
  options: {
    language?: 'fr' | 'en';
    precision?: number;
  } = {}
): string => {
  const { language = 'fr', precision = 1 } = options;
  
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  
  return `${value.toFixed(precision)} ${units[i]}`;
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (
  value: number,
  options: {
    precision?: number;
    showSign?: boolean;
  } = {}
): string => {
  const { precision = 1, showSign = false } = options;
  
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  const formatted = value.toFixed(precision);
  const sign = showSign && value > 0 ? '+' : '';
  
  return `${sign}${formatted}%`;
};

/**
 * Masque des données sensibles
 */
export const maskSensitiveData = (
  data: string,
  options: {
    visibleStart?: number;
    visibleEnd?: number;
    maskChar?: string;
  } = {}
): string => {
  const { visibleStart = 2, visibleEnd = 2, maskChar = '*' } = options;
  
  if (!data || data.length <= visibleStart + visibleEnd) {
    return data;
  }

  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const middle = maskChar.repeat(data.length - visibleStart - visibleEnd);
  
  return `${start}${middle}${end}`;
};

/**
 * Formate un numéro avec zéros devant
 */
export const formatWithLeadingZeros = (num: number, length: number): string => {
  return num.toString().padStart(length, '0');
};

/**
 * Formate un texte en capitalize (première lettre majuscule)
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formate un texte en title case (première lettre de chaque mot majuscule)
 */
export const titleCase = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Tronque un texte avec ellipse
 */
export const truncateText = (
  text: string,
  options: {
    maxLength: number;
    suffix?: string;
    wordBoundary?: boolean;
  }
): string => {
  const { maxLength, suffix = '...', wordBoundary = true } = options;
  
  if (!text || text.length <= maxLength) {
    return text;
  }

  let truncated = text.substring(0, maxLength - suffix.length);
  
  if (wordBoundary) {
    // Tronquer au dernier espace pour éviter de couper un mot
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substring(0, lastSpace);
    }
  }
  
  return `${truncated}${suffix}`;
};

/**
 * Formate un nombre ordinal (1er, 2ème, etc.)
 */
export const formatOrdinal = (
  num: number,
  options: {
    language?: 'fr' | 'en';
  } = {}
): string => {
  const { language = 'fr' } = options;
  
  if (language === 'fr') {
    if (num === 1) return '1er';
    return `${num}ème`;
  } else {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = num % 100;
    const suffix = suffixes[(remainder - 20) % 10] || 
                   suffixes[remainder] || 
                   suffixes[0];
    return `${num}${suffix}`;
  }
};

/**
 * Formate une surface avec unité
 */
export const formatSurface = (
  surface: number,
  options: {
    unit?: 'm²' | 'ha';
    precision?: number;
  } = {}
): string => {
  const { unit = 'm²', precision = 0 } = options;
  
  if (typeof surface !== 'number' || isNaN(surface)) {
    return `0 ${unit}`;
  }

  let value = surface;
  let displayUnit = unit;
  
  // Conversion automatique pour grandes surfaces
  if (unit === 'm²' && surface >= 10000) {
    value = surface / 10000; // Conversion en hectares
    displayUnit = 'ha';
  }
  
  return `${value.toFixed(precision)} ${displayUnit}`;
};

/**
 * Formate un rang/position
 */
export const formatRank = (
  rank: number,
  options: {
    total?: number;
    language?: 'fr' | 'en';
  } = {}
): string => {
  const { total, language = 'fr' } = options;
  
  const ordinal = formatOrdinal(rank, { language });
  
  if (total) {
    return language === 'fr' ? 
      `${ordinal} sur ${total}` : 
      `${ordinal} of ${total}`;
  }
  
  return ordinal;
};

/**
 * Formate une durée en minutes/heures
 */
export const formatDuration = (
  minutes: number,
  options: {
    language?: 'fr' | 'en';
    short?: boolean;
  } = {}
): string => {
  const { language = 'fr', short = false } = options;
  
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return language === 'fr' ? '0 min' : '0 min';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (short) {
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? remainingMinutes : ''}`;
    }
    return `${remainingMinutes}min`;
  }
  
  if (language === 'fr') {
    if (hours > 0) {
      const hourText = hours === 1 ? 'heure' : 'heures';
      if (remainingMinutes > 0) {
        const minText = remainingMinutes === 1 ? 'minute' : 'minutes';
        return `${hours} ${hourText} ${remainingMinutes} ${minText}`;
      }
      return `${hours} ${hourText}`;
    }
    const minText = remainingMinutes === 1 ? 'minute' : 'minutes';
    return `${remainingMinutes} ${minText}`;
  } else {
    if (hours > 0) {
      const hourText = hours === 1 ? 'hour' : 'hours';
      if (remainingMinutes > 0) {
        const minText = remainingMinutes === 1 ? 'minute' : 'minutes';
        return `${hours} ${hourText} ${remainingMinutes} ${minText}`;
      }
      return `${hours} ${hourText}`;
    }
    const minText = remainingMinutes === 1 ? 'minute' : 'minutes';
    return `${remainingMinutes} ${minText}`;
  }
};

// Exports des formatters memoizés pour performance
const memoize = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return => {
  const cache = new Map<string, Return>();
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const memoizedFormatCurrency = memoize(formatCurrency);
export const memoizedFormatDistance = memoize(formatDistance);
export const memoizedFormatFileSize = memoize(formatFileSize);
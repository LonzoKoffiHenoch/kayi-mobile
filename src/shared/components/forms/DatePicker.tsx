/**
 * KAYI House DatePicker Component
 * Mobile-optimized date selection with French locale support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Modal from '../base/Modal';
import { theme } from '../../theme/theme';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  format?: string;
  locale?: Locale;
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  displayFormat?: string;
}

const DatePicker: React.FC<DatePickerProps> = React.memo(({
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder,
  label,
  error,
  disabled = false,
  format: dateFormat,
  locale = fr,
  style,
  buttonStyle,
  buttonTextStyle,
  displayFormat,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      if (typeof value === 'string') {
        const parsed = parseISO(value);
        return isValid(parsed) ? parsed : new Date();
      }
      return isValid(value) ? value : new Date();
    }
    return new Date();
  });

  // Get display format based on mode
  const getDisplayFormat = (): string => {
    if (displayFormat) return displayFormat;
    
    const formats = {
      date: 'dd/MM/yyyy',
      time: 'HH:mm',
      datetime: 'dd/MM/yyyy HH:mm',
    };
    
    return formats[mode];
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    if (!isValid(date)) return '';
    
    try {
      return format(date, getDisplayFormat(), { locale });
    } catch {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Get placeholder text
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    const placeholders = {
      date: 'Sélectionner une date',
      time: 'Sélectionner une heure',
      datetime: 'Sélectionner date et heure',
    };
    
    return placeholders[mode];
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
    }
    
    if (date && isValid(date)) {
      setSelectedDate(date);
      onChange(date);
    }
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    setIsVisible(false);
  };

  const currentValue = value ? (typeof value === 'string' ? parseISO(value) : value) : null;
  const displayText = currentValue && isValid(currentValue) 
    ? formatDisplayDate(currentValue) 
    : getPlaceholder();
  const isPlaceholder = !currentValue || !isValid(currentValue);

  const buttonStyles: ViewStyle[] = [
    styles.button,
    disabled && styles.buttonDisabled,
    error && styles.buttonError,
    buttonStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.buttonText,
    isPlaceholder && styles.placeholderText,
    disabled && styles.disabledText,
    buttonTextStyle,
  ];

  const iconColor = disabled
    ? theme.colors.gray[400]
    : error
    ? theme.colors.error[500]
    : theme.colors.text.secondary;

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      {/* Date Button */}
      <TouchableOpacity
        style={buttonStyles}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Ionicons
          name={mode === 'time' ? 'time' : 'calendar'}
          size={20}
          color={iconColor}
          style={styles.icon}
        />
        
        <Text style={textStyles} numberOfLines={1}>
          {displayText}
        </Text>
        
        <Ionicons
          name="chevron-down"
          size={20}
          color={iconColor}
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Date Picker */}
      {Platform.OS === 'ios' ? (
        // iOS Modal Picker
        <Modal
          visible={isVisible}
          onClose={handleClose}
          title={label || getPlaceholder()}
          size="medium"
        >
          <View style={styles.modalContent}>
            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale="fr-FR"
              style={styles.picker}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        // Android Native Picker
        isVisible && (
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
});

// Utility functions
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  try {
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return dateObj.toLocaleDateString('fr-FR');
  }
};

export const isDateInRange = (date: Date, min?: Date, max?: Date): boolean => {
  if (!isValid(date)) return false;
  
  if (min && date < min) return false;
  if (max && date > max) return false;
  
  return true;
};

export const getDateRangeError = (
  date: Date,
  min?: Date,
  max?: Date
): string | undefined => {
  if (!isValid(date)) return 'Date invalide';
  
  if (min && date < min) {
    return `La date doit être après le ${formatDate(min)}`;
  }
  
  if (max && date > max) {
    return `La date doit être avant le ${formatDate(max)}`;
  }
  
  return undefined;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.textStyles.inputLabel,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.primary,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.gray[50],
    borderColor: theme.colors.gray[200],
    opacity: 0.6,
  },
  buttonError: {
    borderColor: theme.colors.error[500],
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.text.tertiary,
  },
  disabledText: {
    color: theme.colors.gray[400],
  },
  errorText: {
    ...theme.typography.textStyles.inputError,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  modalContent: {
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  confirmButton: {
    backgroundColor: theme.colors.primary[500],
  },
  cancelButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.secondary,
  },
  confirmButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.inverse,
  },
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
/**
 * KAYI House Select Component
 * Native-style modal picker with search functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from '../base/Modal';
import Input from '../base/Input';
import { theme } from '../../theme/theme';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onSelect: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  maxHeight?: number;
  showSearch?: boolean;
}

const Select: React.FC<SelectProps> = React.memo(({
  options,
  value,
  onSelect,
  placeholder = 'Sélectionner une option',
  label,
  error,
  disabled = false,
  multiple = false,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  emptyText = 'Aucune option disponible',
  style,
  buttonStyle,
  buttonTextStyle,
  maxHeight = 400,
  showSearch,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-enable search if more than 10 options
  const shouldShowSearch = showSearch ?? (searchable && options.length > 10);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Get selected option(s) for display
  const getSelectedText = (): string => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return placeholder;
    }

    if (multiple && Array.isArray(value)) {
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} options sélectionnées`;
    }

    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption?.label || placeholder;
  };

  // Check if option is selected
  const isSelected = (optionValue: string | number): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      
      if (currentValues.includes(optionValue)) {
        // Remove if already selected
        const newValues = currentValues.filter(v => v !== optionValue);
        onSelect(newValues);
      } else {
        // Add to selection
        onSelect([...currentValues, optionValue]);
      }
    } else {
      // Single selection
      onSelect(optionValue);
      setIsVisible(false);
      setSearchQuery('');
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchQuery('');
  };

  const selectedText = getSelectedText();
  const isPlaceholder = selectedText === placeholder;

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

  const renderOption = ({ item }: { item: SelectOption }) => {
    const selected = isSelected(item.value);
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          selected && styles.selectedOption,
          item.disabled && styles.disabledOption,
        ]}
        onPress={() => !item.disabled && handleOptionSelect(item.value)}
        disabled={item.disabled}
      >
        <View style={styles.optionContent}>
          {item.icon && (
            <Ionicons
              name={item.icon}
              size={20}
              color={
                item.disabled
                  ? theme.colors.gray[400]
                  : selected
                  ? theme.colors.primary[500]
                  : theme.colors.text.secondary
              }
              style={styles.optionIcon}
            />
          )}
          
          <View style={styles.optionTextContainer}>
            <Text
              style={[
                styles.optionText,
                selected && styles.selectedOptionText,
                item.disabled && styles.disabledOptionText,
              ]}
            >
              {item.label}
            </Text>
            
            {item.description && (
              <Text
                style={[
                  styles.optionDescription,
                  item.disabled && styles.disabledOptionText,
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        {multiple && selected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={theme.colors.primary[500]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      {/* Select Button */}
      <TouchableOpacity
        style={buttonStyles}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text style={textStyles} numberOfLines={1}>
          {selectedText}
        </Text>
        
        <Ionicons
          name={isVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={
            disabled
              ? theme.colors.gray[400]
              : error
              ? theme.colors.error[500]
              : theme.colors.text.secondary
          }
        />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Options Modal */}
      <Modal
        visible={isVisible}
        onClose={handleClose}
        title={label || 'Sélectionner une option'}
        size="large"
      >
        <View style={styles.modalContent}>
          {/* Search Input */}
          {shouldShowSearch && (
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              leftIcon="search"
              style={styles.searchInput}
            />
          )}

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            renderItem={renderOption}
            keyExtractor={(item) => String(item.value)}
            style={[styles.optionsList, { maxHeight }]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyText}</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />

          {/* Multiple selection actions */}
          {multiple && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClose}
              >
                <Text style={styles.actionButtonText}>Terminé</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
});

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
    justifyContent: 'space-between',
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
    flex: 1,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary[50],
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: theme.spacing.sm,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
  disabledOptionText: {
    color: theme.colors.gray[400],
  },
  optionDescription: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.inverse,
  },
});

Select.displayName = 'Select';

export default Select;
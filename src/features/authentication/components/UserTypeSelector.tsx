/**
 * KAYI House UserTypeSelector Component
 * Sélecteur de type d'utilisateur avec cartes interactives
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../../shared/theme/theme';
import { UserRole } from '../../../core/types/common.types';
import { USER_TYPE_OPTIONS } from '../types/auth.types';

// ===== TYPES =====
export interface UserTypeSelectorProps {
  selectedType: UserRole | null;
  onSelect: (type: UserRole) => void;
  error?: string;
  disabled?: boolean;
  style?: any;
}

// ===== COMPONENT =====
export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onSelect,
  error,
  disabled = false,
  style,
}) => {
  
  const handleSelect = (type: UserRole) => {
    if (disabled) return;
    
    onSelect(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderOption = (option: typeof USER_TYPE_OPTIONS[0]) => {
    const isSelected = selectedType === option.value;
    
    return (
      <Pressable
        key={option.value}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
          disabled && styles.optionCardDisabled,
        ]}
        onPress={() => handleSelect(option.value)}
        disabled={disabled}
        android_ripple={{
          color: theme.colors.primary[100],
          borderless: false,
        }}
      >
        {({ pressed }) => (
          <>
            {/* Selection Indicator */}
            <View style={styles.selectionContainer}>
              <View
                style={[
                  styles.selectionCircle,
                  isSelected && styles.selectionCircleSelected,
                ]}
              >
                {isSelected && (
                  <View style={styles.selectionDot} />
                )}
              </View>
            </View>

            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${option.color}20` },
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={32}
                color={isSelected ? option.color : theme.colors.gray[600]}
              />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text
                style={[
                  styles.title,
                  isSelected && styles.titleSelected,
                  disabled && styles.textDisabled,
                ]}
              >
                {option.title}
              </Text>
              <Text
                style={[
                  styles.description,
                  isSelected && styles.descriptionSelected,
                  disabled && styles.textDisabled,
                ]}
              >
                {option.description}
              </Text>
            </View>

            {/* Checkmark */}
            {isSelected && (
              <View style={styles.checkmarkContainer}>
                <View
                  style={[
                    styles.checkmark,
                    { backgroundColor: option.color },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.white}
                  />
                </View>
              </View>
            )}

            {/* Pressed State Overlay */}
            {pressed && !disabled && (
              <View style={styles.pressedOverlay} />
            )}
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.optionsContainer}>
        {USER_TYPE_OPTIONS.map(renderOption)}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={theme.colors.error[500]}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  optionsContainer: {
    gap: theme.spacing.md,
  },
  
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  
  optionCardSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  optionCardDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.gray[100],
  },
  
  selectionContainer: {
    marginRight: theme.spacing.md,
  },
  
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectionCircleSelected: {
    borderColor: theme.colors.primary[500],
  },
  
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
  },
  
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  title: {
    ...theme.typography.textStyles.subtitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  titleSelected: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  
  description: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  
  descriptionSelected: {
    color: theme.colors.primary[600],
  },
  
  textDisabled: {
    color: theme.colors.gray[400],
  },
  
  checkmarkContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  pressedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black,
    opacity: 0.05,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  
  errorText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error[500],
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
});

export default UserTypeSelector;
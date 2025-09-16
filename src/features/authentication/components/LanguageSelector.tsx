/**
 * KAYI House LanguageSelector Component
 * Sélecteur de langue avec support multi-langues de Côte d'Ivoire
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
import { SupportedLanguage } from '../../../core/types/common.types';
import { SUPPORTED_LANGUAGES } from '../types/auth.types';

// ===== TYPES =====
export interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelect: (language: SupportedLanguage) => void;
  error?: string;
  disabled?: boolean;
  style?: any;
  variant?: 'grid' | 'list';
}

// ===== COMPONENT =====
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  error,
  disabled = false,
  style,
  variant = 'grid',
}) => {
  
  const handleSelect = (language: SupportedLanguage) => {
    if (disabled) return;
    
    onSelect(language);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderLanguageOption = (option: typeof SUPPORTED_LANGUAGES[0]) => {
    const isSelected = selectedLanguage === option.code;
    
    if (variant === 'list') {
      return (
        <Pressable
          key={option.code}
          style={[
            styles.listOption,
            isSelected && styles.listOptionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={() => handleSelect(option.code)}
          disabled={disabled}
          android_ripple={{
            color: theme.colors.primary[100],
            borderless: false,
          }}
        >
          {({ pressed }) => (
            <>
              {/* Flag */}
              <View style={styles.flagContainer}>
                <Text style={styles.flagText}>{option.flag}</Text>
              </View>

              {/* Language Info */}
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageName,
                    isSelected && styles.languageNameSelected,
                    disabled && styles.textDisabled,
                  ]}
                >
                  {option.name}
                </Text>
                <Text
                  style={[
                    styles.nativeName,
                    isSelected && styles.nativeNameSelected,
                    disabled && styles.textDisabled,
                  ]}
                >
                  {option.nativeName}
                </Text>
              </View>

              {/* Selection Indicator */}
              <View
                style={[
                  styles.selectionIndicator,
                  isSelected && styles.selectionIndicatorSelected,
                ]}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.white}
                  />
                )}
              </View>

              {/* Pressed State Overlay */}
              {pressed && !disabled && (
                <View style={styles.pressedOverlay} />
              )}
            </>
          )}
        </Pressable>
      );
    }

    // Grid variant
    return (
      <Pressable
        key={option.code}
        style={[
          styles.gridOption,
          isSelected && styles.gridOptionSelected,
          disabled && styles.optionDisabled,
        ]}
        onPress={() => handleSelect(option.code)}
        disabled={disabled}
        android_ripple={{
          color: theme.colors.primary[100],
          borderless: false,
        }}
      >
        {({ pressed }) => (
          <>
            {/* Flag */}
            <View style={styles.gridFlagContainer}>
              <Text style={styles.gridFlagText}>{option.flag}</Text>
            </View>

            {/* Language Name */}
            <Text
              style={[
                styles.gridLanguageName,
                isSelected && styles.gridLanguageNameSelected,
                disabled && styles.textDisabled,
              ]}
            >
              {option.name}
            </Text>

            {/* Native Name */}
            <Text
              style={[
                styles.gridNativeName,
                isSelected && styles.gridNativeNameSelected,
                disabled && styles.textDisabled,
              ]}
            >
              {option.nativeName}
            </Text>

            {/* Selection Badge */}
            {isSelected && (
              <View style={styles.selectionBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary[500]}
                />
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
      <View
        style={[
          variant === 'grid' ? styles.gridContainer : styles.listContainer,
        ]}
      >
        {SUPPORTED_LANGUAGES.map(renderLanguageOption)}
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
  
  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  
  gridOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  
  gridOptionSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  gridFlagContainer: {
    marginBottom: theme.spacing.md,
  },
  
  gridFlagText: {
    fontSize: 32,
    lineHeight: 40,
  },
  
  gridLanguageName: {
    ...theme.typography.textStyles.subtitle,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  gridLanguageNameSelected: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  
  gridNativeName: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  gridNativeNameSelected: {
    color: theme.colors.primary[600],
  },
  
  selectionBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  
  // List Layout
  listContainer: {
    gap: theme.spacing.sm,
  },
  
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: 72,
    position: 'relative',
    overflow: 'hidden',
  },
  
  listOptionSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  flagContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  
  flagText: {
    fontSize: 24,
    lineHeight: 30,
  },
  
  languageInfo: {
    flex: 1,
  },
  
  languageName: {
    ...theme.typography.textStyles.subtitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  languageNameSelected: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  
  nativeName: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  
  nativeNameSelected: {
    color: theme.colors.primary[600],
  },
  
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectionIndicatorSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[500],
  },
  
  // Common Styles
  optionDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.gray[100],
  },
  
  textDisabled: {
    color: theme.colors.gray[400],
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

export default LanguageSelector;
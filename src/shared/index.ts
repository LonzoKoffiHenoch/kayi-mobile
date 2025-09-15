/**
 * KAYI House Shared Components - Main Export File
 * Central export point for all shared components, hooks, and utilities
 */

// Theme System
export { default as theme, getColor, getSpacing, getTextStyle } from './theme/theme';
export { colors, semanticColors, withOpacity } from './theme/colors';
export { textStyles, fontFamily, fontSize, getTextStyle as getTypographyStyle } from './theme/typography';
export { spacing, borderRadius, elevation, componentSpacing } from './theme/spacing';

// Base Components
export { default as Button } from './components/base/Button';
export { default as Input } from './components/base/Input';
export { default as Card } from './components/base/Card';
export { default as Modal } from './components/base/Modal';
export { default as LoadingSpinner } from './components/base/LoadingSpinner';

// Form Components
export { default as PhoneInput, validateCIPhoneNumber, formatCIPhoneNumber } from './components/forms/PhoneInput';
export { default as PriceInput, formatFCFA, parseFCFA } from './components/forms/PriceInput';
export { default as Select } from './components/forms/Select';
export { default as DatePicker, formatDate, isDateInRange } from './components/forms/DatePicker';

// Feedback Components
export { 
  default as Toast, 
  ToastProvider, 
  useToast, 
  useToastQueue 
} from './components/feedback/Toast';
export { 
  default as EmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
  NoConnectionEmptyState,
  ErrorEmptyState,
  NoPropertiesEmptyState,
  NoFavoritesEmptyState,
  NoMessagesEmptyState,
  NoNotificationsEmptyState,
  OfflineEmptyState
} from './components/feedback/EmptyState';
export { 
  default as ErrorState,
  NetworkErrorState,
  ServerErrorState,
  ValidationErrorState,
  PermissionErrorState,
  TimeoutErrorState,
  ErrorBoundary
} from './components/feedback/ErrorState';
export { 
  default as OfflineState,
  OfflineBanner,
  OfflineScreen,
  OfflineIndicator,
  useNetworkStatus as useOfflineNetworkStatus
} from './components/feedback/OfflineState';

// Layout Components
export { 
  default as SafeContainer,
  SafeAreaContainer,
  ScreenContainer,
  ModalContainer,
  HeaderContainer,
  KayiSafeAreaProvider,
  useSafeArea,
  useSafeAreaDimensions
} from './components/layout/SafeContainer';
export { 
  default as KeyboardView,
  FormKeyboardView,
  ModalKeyboardView,
  ChatKeyboardView,
  useKeyboardView,
  KeyboardViewProvider,
  useKeyboardViewContext
} from './components/layout/KeyboardView';
export { 
  default as RefreshControl,
  RefreshableScrollView,
  RefreshableFlatList,
  RefreshableSectionList,
  useRefresh,
  CustomRefreshIndicator
} from './components/layout/RefreshControl';

// Custom Hooks
export { 
  default as useKeyboard,
  useKeyboardSpacing,
  useKeyboardAnimation,
  useFormKeyboard
} from './hooks/useKeyboard';
export { 
  default as useNetworkStatus,
  useOfflineFirst,
  useConnectionQuality
} from './hooks/useNetworkStatus';
export { 
  default as usePermissions,
  useCameraPermission,
  useLocationPermission,
  useMediaLibraryPermission,
  usePropertyListingPermissions
} from './hooks/usePermissions';

// Type Exports
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/base/Button';
export type { InputProps } from './components/base/Input';
export type { CardProps, CardVariant } from './components/base/Card';
export type { ModalProps } from './components/base/Modal';
export type { LoadingSpinnerProps, SpinnerSize, SpinnerVariant } from './components/base/LoadingSpinner';

export type { PhoneInputProps } from './components/forms/PhoneInput';
export type { PriceInputProps } from './components/forms/PriceInput';
export type { SelectProps, SelectOption } from './components/forms/Select';
export type { DatePickerProps } from './components/forms/DatePicker';

export type { ToastProps, ToastType, ToastPosition } from './components/feedback/Toast';
export type { EmptyStateProps, EmptyStateVariant } from './components/feedback/EmptyState';
export type { ErrorStateProps, ErrorType } from './components/feedback/ErrorState';
export type { OfflineStateProps } from './components/feedback/OfflineState';

export type { SafeContainerProps } from './components/layout/SafeContainer';
export type { KeyboardViewProps } from './components/layout/KeyboardView';
export type { RefreshControlProps } from './components/layout/RefreshControl';

export type { 
  KeyboardState, 
  UseKeyboardOptions, 
  UseKeyboardReturn 
} from './hooks/useKeyboard';
export type { 
  NetworkState, 
  UseNetworkStatusOptions, 
  UseNetworkStatusReturn 
} from './hooks/useNetworkStatus';
export type { 
  PermissionType, 
  PermissionState, 
  UsePermissionsOptions, 
  UsePermissionsReturn 
} from './hooks/usePermissions';

export type {
  Theme,
  ColorKey,
  SpacingKey,
  BorderRadiusKey,
  ElevationKey,
  TextStyleKey,
  ColorValue
} from './theme/theme';
export type { TextStyleVariant, FontFamily, FontSize } from './theme/typography';
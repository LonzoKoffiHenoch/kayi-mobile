/**
 * KAYI House usePermissions Hook
 * Camera, location, storage permission handling with user-friendly messages
 */

import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { PermissionStatus } from 'expo-modules-core';

export type PermissionType = 'camera' | 'location' | 'mediaLibrary' | 'microphone';

export interface PermissionState {
  status: PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
  expires: string;
}

export interface UsePermissionsOptions {
  onGranted?: (permission: PermissionType) => void;
  onDenied?: (permission: PermissionType) => void;
  autoRequest?: boolean;
  showSettingsAlert?: boolean;
}

export interface UsePermissionsReturn {
  permissions: Record<PermissionType, PermissionState>;
  requestPermission: (type: PermissionType) => Promise<boolean>;
  requestMultiplePermissions: (types: PermissionType[]) => Promise<Record<PermissionType, boolean>>;
  openSettings: () => void;
  hasPermission: (type: PermissionType) => boolean;
  hasAllPermissions: (types: PermissionType[]) => boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const PERMISSION_MESSAGES = {
  camera: {
    title: 'Autorisation Caméra',
    message: 'KAYI House a besoin d\'accéder à votre caméra pour prendre des photos de vos propriétés.',
    settingsMessage: 'Pour utiliser la caméra, veuillez activer les permissions dans les réglages de votre appareil.',
    rationaleTitle: 'Pourquoi cette autorisation ?',
    rationaleMessage: 'La caméra permet de prendre des photos de vos biens immobiliers pour créer des annonces attractives.',
  },
  location: {
    title: 'Autorisation Localisation',
    message: 'KAYI House a besoin d\'accéder à votre localisation pour vous proposer des biens immobiliers à proximité.',
    settingsMessage: 'Pour localiser les propriétés près de vous, veuillez activer la géolocalisation dans les réglages.',
    rationaleTitle: 'Pourquoi cette autorisation ?',
    rationaleMessage: 'La localisation nous aide à vous montrer les propriétés disponibles dans votre zone géographique.',
  },
  mediaLibrary: {
    title: 'Autorisation Galerie Photo',
    message: 'KAYI House a besoin d\'accéder à vos photos pour sélectionner des images de vos propriétés.',
    settingsMessage: 'Pour sélectionner des photos depuis votre galerie, activez l\'autorisation dans les réglages.',
    rationaleTitle: 'Pourquoi cette autorisation ?',
    rationaleMessage: 'L\'accès à la galerie vous permet d\'ajouter des photos existantes à vos annonces immobilières.',
  },
  microphone: {
    title: 'Autorisation Microphone',
    message: 'KAYI House a besoin d\'accéder au microphone pour enregistrer des messages vocaux.',
    settingsMessage: 'Pour enregistrer des messages vocaux, activez le microphone dans les réglages.',
    rationaleTitle: 'Pourquoi cette autorisation ?',
    rationaleMessage: 'Le microphone permet d\'enregistrer des descriptions audio de vos propriétés.',
  },
};

const usePermissions = (options: UsePermissionsOptions = {}): UsePermissionsReturn => {
  const {
    onGranted,
    onDenied,
    autoRequest = false,
    showSettingsAlert = true,
  } = options;

  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionState>>({
    camera: {
      status: PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    },
    location: {
      status: PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    },
    mediaLibrary: {
      status: PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    },
    microphone: {
      status: PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // Transform expo permission response to our format
  const transformPermissionResponse = useCallback((response: any): PermissionState => {
    return {
      status: response.status,
      granted: response.granted,
      canAskAgain: response.canAskAgain,
      expires: response.expires,
    };
  }, []);

  // Get current permission status
  const getPermissionStatus = useCallback(async (type: PermissionType): Promise<PermissionState> => {
    try {
      let response;
      
      switch (type) {
        case 'camera':
          response = await Camera.getCameraPermissionsAsync();
          break;
        case 'location':
          response = await Location.getForegroundPermissionsAsync();
          break;
        case 'mediaLibrary':
          response = await MediaLibrary.getPermissionsAsync();
          break;
        case 'microphone':
          response = await Camera.getMicrophonePermissionsAsync();
          break;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }

      return transformPermissionResponse(response);
    } catch (error) {
      console.error(`Failed to get ${type} permission status:`, error);
      return {
        status: PermissionStatus.UNDETERMINED,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      };
    }
  }, [transformPermissionResponse]);

  // Request permission with user-friendly messaging
  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get current status first
      const currentStatus = await getPermissionStatus(type);
      
      // If already granted, return true
      if (currentStatus.granted) {
        return true;
      }

      // If can't ask again, show settings alert
      if (!currentStatus.canAskAgain && showSettingsAlert) {
        const messages = PERMISSION_MESSAGES[type];
        Alert.alert(
          messages.title,
          messages.settingsMessage,
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir Réglages', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      // Show rationale on Android if needed
      if (Platform.OS === 'android' && !currentStatus.canAskAgain) {
        const messages = PERMISSION_MESSAGES[type];
        return new Promise((resolve) => {
          Alert.alert(
            messages.rationaleTitle,
            messages.rationaleMessage,
            [
              { text: 'Annuler', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Continuer', onPress: () => resolve(true) },
            ]
          );
        }).then(async (shouldContinue) => {
          if (!shouldContinue) return false;
          return await requestPermissionNative(type);
        });
      }

      return await requestPermissionNative(type);
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getPermissionStatus, showSettingsAlert]);

  // Native permission request
  const requestPermissionNative = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      let response;
      
      switch (type) {
        case 'camera':
          response = await Camera.requestCameraPermissionsAsync();
          break;
        case 'location':
          response = await Location.requestForegroundPermissionsAsync();
          break;
        case 'mediaLibrary':
          response = await MediaLibrary.requestPermissionsAsync();
          break;
        case 'microphone':
          response = await Camera.requestMicrophonePermissionsAsync();
          break;
        default:
          throw new Error(`Unknown permission type: ${type}`);
      }

      const permissionState = transformPermissionResponse(response);
      
      // Update state
      setPermissions(prev => ({
        ...prev,
        [type]: permissionState,
      }));

      // Trigger callbacks
      if (permissionState.granted) {
        onGranted?.(type);
      } else {
        onDenied?.(type);
      }

      return permissionState.granted;
    } catch (error) {
      console.error(`Failed to request ${type} permission natively:`, error);
      return false;
    }
  }, [transformPermissionResponse, onGranted, onDenied]);

  // Request multiple permissions
  const requestMultiplePermissions = useCallback(async (
    types: PermissionType[]
  ): Promise<Record<PermissionType, boolean>> => {
    const results: Record<PermissionType, boolean> = {} as any;
    
    for (const type of types) {
      results[type] = await requestPermission(type);
    }
    
    return results;
  }, [requestPermission]);

  // Open device settings
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Check if has permission
  const hasPermission = useCallback((type: PermissionType): boolean => {
    return permissions[type]?.granted || false;
  }, [permissions]);

  // Check if has all permissions
  const hasAllPermissions = useCallback((types: PermissionType[]): boolean => {
    return types.every(type => hasPermission(type));
  }, [hasPermission]);

  // Refresh all permission statuses
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedPermissions: Record<PermissionType, PermissionState> = {} as any;
      
      for (const type of Object.keys(permissions) as PermissionType[]) {
        updatedPermissions[type] = await getPermissionStatus(type);
      }
      
      setPermissions(updatedPermissions);
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [permissions, getPermissionStatus]);

  // Initialize permissions on mount
  useEffect(() => {
    refresh();
  }, []);

  // Auto-request permissions if enabled
  useEffect(() => {
    if (autoRequest) {
      const types: PermissionType[] = ['camera', 'location', 'mediaLibrary'];
      types.forEach(type => {
        if (!permissions[type].granted && permissions[type].canAskAgain) {
          requestPermission(type);
        }
      });
    }
  }, [autoRequest, permissions, requestPermission]);

  return {
    permissions,
    requestPermission,
    requestMultiplePermissions,
    openSettings,
    hasPermission,
    hasAllPermissions,
    isLoading,
    refresh,
  };
};

// Specific permission hooks for common use cases
export const useCameraPermission = (options?: UsePermissionsOptions) => {
  const { requestPermission, hasPermission, permissions } = usePermissions(options);
  
  return {
    hasPermission: hasPermission('camera'),
    requestPermission: () => requestPermission('camera'),
    status: permissions.camera,
  };
};

export const useLocationPermission = (options?: UsePermissionsOptions) => {
  const { requestPermission, hasPermission, permissions } = usePermissions(options);
  
  return {
    hasPermission: hasPermission('location'),
    requestPermission: () => requestPermission('location'),
    status: permissions.location,
  };
};

export const useMediaLibraryPermission = (options?: UsePermissionsOptions) => {
  const { requestPermission, hasPermission, permissions } = usePermissions(options);
  
  return {
    hasPermission: hasPermission('mediaLibrary'),
    requestPermission: () => requestPermission('mediaLibrary'),
    status: permissions.mediaLibrary,
  };
};

// Hook for property listing specific permissions (common KAYI House use case)
export const usePropertyListingPermissions = () => {
  const requiredPermissions: PermissionType[] = ['camera', 'location', 'mediaLibrary'];
  const permissionHook = usePermissions();

  const requestAllRequired = useCallback(async () => {
    return await permissionHook.requestMultiplePermissions(requiredPermissions);
  }, [permissionHook]);

  const hasAllRequired = permissionHook.hasAllPermissions(requiredPermissions);

  const getMissingPermissions = useCallback((): PermissionType[] => {
    return requiredPermissions.filter(type => !permissionHook.hasPermission(type));
  }, [permissionHook]);

  return {
    ...permissionHook,
    requestAllRequired,
    hasAllRequired,
    getMissingPermissions,
    requiredPermissions,
  };
};

export default usePermissions;
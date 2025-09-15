/**
 * KAYI House useNetworkStatus Hook
 * Network connectivity monitoring with cache strategies and offline support
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { 
  NetInfoState, 
  NetInfoStateType, 
  NetInfoSubscription 
} from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  connectionType: NetInfoStateType;
  isInternetReachable: boolean | null;
  details: any;
  timestamp: number;
}

export interface UseNetworkStatusOptions {
  onConnected?: (state: NetworkState) => void;
  onDisconnected?: (state: NetworkState) => void;
  onConnectionChange?: (state: NetworkState) => void;
  checkInterval?: number;
  enableReachabilityTest?: boolean;
  retryOnReconnect?: boolean;
}

export interface UseNetworkStatusReturn extends NetworkState {
  refresh: () => Promise<void>;
  isLoading: boolean;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
  connectionHistory: NetworkState[];
  isOnline: boolean;
  isOffline: boolean;
  canMakeRequests: boolean;
}

const useNetworkStatus = (options: UseNetworkStatusOptions = {}): UseNetworkStatusReturn => {
  const {
    onConnected,
    onDisconnected,
    onConnectionChange,
    checkInterval,
    enableReachabilityTest = true,
    retryOnReconnect = true,
  } = options;

  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    connectionType: NetInfoStateType.unknown,
    isInternetReachable: null,
    details: null,
    timestamp: Date.now(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastConnectedAt, setLastConnectedAt] = useState<number | null>(null);
  const [lastDisconnectedAt, setLastDisconnectedAt] = useState<number | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<NetworkState[]>([]);

  const unsubscribeRef = useRef<NetInfoSubscription>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const previousStateRef = useRef<NetworkState | null>(null);

  // Convert NetInfo state to our NetworkState
  const transformNetInfoState = useCallback((state: NetInfoState): NetworkState => {
    return {
      isConnected: state.isConnected ?? false,
      connectionType: state.type,
      isInternetReachable: state.isInternetReachable,
      details: state.details,
      timestamp: Date.now(),
    };
  }, []);

  // Update network state and trigger callbacks
  const updateNetworkState = useCallback((newState: NetworkState) => {
    const previousState = previousStateRef.current;
    
    setNetworkState(newState);
    previousStateRef.current = newState;

    // Update connection history (keep last 10 states)
    setConnectionHistory(prev => [newState, ...prev.slice(0, 9)]);

    // Update last connected/disconnected timestamps
    if (newState.isConnected && (!previousState || !previousState.isConnected)) {
      setLastConnectedAt(newState.timestamp);
      onConnected?.(newState);
      
      // Retry logic on reconnect
      if (retryOnReconnect && previousState && !previousState.isConnected) {
        // Could trigger app-wide retry logic here
      }
    } else if (!newState.isConnected && (!previousState || previousState.isConnected)) {
      setLastDisconnectedAt(newState.timestamp);
      onDisconnected?.(newState);
    }

    // Always call onChange if state changed
    if (!previousState || 
        previousState.isConnected !== newState.isConnected ||
        previousState.connectionType !== newState.connectionType ||
        previousState.isInternetReachable !== newState.isInternetReachable) {
      onConnectionChange?.(newState);
    }

    setIsLoading(false);
  }, [onConnected, onDisconnected, onConnectionChange, retryOnReconnect]);

  // Fetch current network state
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await NetInfo.fetch();
      const networkState = transformNetInfoState(state);
      updateNetworkState(networkState);
    } catch (error) {
      console.error('Failed to fetch network state:', error);
      setIsLoading(false);
    }
  }, [transformNetInfoState, updateNetworkState]);

  // Set up network monitoring
  useEffect(() => {
    // Configure NetInfo
    NetInfo.configure({
      reachabilityUrl: 'https://clients3.google.com/generate_204',
      reachabilityTest: enableReachabilityTest ? async (response) => {
        return response.status === 204;
      } : undefined,
      reachabilityLongTimeout: 60 * 1000, // 60s
      reachabilityShortTimeout: 5 * 1000,  // 5s
      reachabilityRequestTimeout: 15 * 1000, // 15s
    });

    // Subscribe to network state changes
    unsubscribeRef.current = NetInfo.addEventListener(state => {
      const networkState = transformNetInfoState(state);
      updateNetworkState(networkState);
    });

    // Get initial state
    refresh();

    // Set up periodic checks if requested
    if (checkInterval && checkInterval > 0) {
      intervalRef.current = setInterval(refresh, checkInterval);
    }

    return () => {
      unsubscribeRef.current?.();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [transformNetInfoState, updateNetworkState, refresh, checkInterval, enableReachabilityTest]);

  // Derived state
  const isOnline = networkState.isConnected && networkState.isInternetReachable !== false;
  const isOffline = !isOnline;
  const canMakeRequests = isOnline;

  return {
    ...networkState,
    refresh,
    isLoading,
    lastConnectedAt,
    lastDisconnectedAt,
    connectionHistory,
    isOnline,
    isOffline,
    canMakeRequests,
  };
};

// Hook for offline-first data management
export const useOfflineFirst = <T>(
  fetchData: () => Promise<T>,
  cacheKey: string,
  options: {
    retryOnReconnect?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) => {
  const { retryOnReconnect = true, staleTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const { isOnline, isConnected } = useNetworkStatus();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetchWithFallback = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isOnline) {
        // Online: fetch fresh data
        const freshData = await fetchData();
        setData(freshData);
        setLastFetch(Date.now());
        setIsStale(false);
        
        // Cache the data (could implement AsyncStorage here)
        // await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: freshData, timestamp: Date.now() }));
      } else {
        // Offline: try to load from cache
        // const cached = await AsyncStorage.getItem(cacheKey);
        // if (cached) {
        //   const { data: cachedData, timestamp } = JSON.parse(cached);
        //   setData(cachedData);
        //   setLastFetch(timestamp);
        //   setIsStale(Date.now() - timestamp > staleTime);
        // } else {
        //   throw new Error('No cached data available');
        // }
        throw new Error('Offline and no cache implementation');
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, isLoading, fetchData, cacheKey, staleTime]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (retryOnReconnect && isConnected && error) {
      fetchWithFallback();
    }
  }, [isConnected, retryOnReconnect, error, fetchWithFallback]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    isStale,
    refetch: fetchWithFallback,
    isOnline,
    isOffline: !isOnline,
  };
};

// Hook for connection quality estimation
export const useConnectionQuality = () => {
  const { connectionType, details, isConnected } = useNetworkStatus();
  
  const getQualityScore = useCallback((): number => {
    if (!isConnected) return 0;
    
    switch (connectionType) {
      case NetInfoStateType.wifi:
        return 4; // Excellent
      case NetInfoStateType.cellular:
        if (details?.cellularGeneration === '4g' || details?.cellularGeneration === '5g') {
          return 3; // Good
        } else if (details?.cellularGeneration === '3g') {
          return 2; // Fair
        } else {
          return 1; // Poor
        }
      case NetInfoStateType.ethernet:
        return 4; // Excellent
      default:
        return 1; // Unknown/Poor
    }
  }, [connectionType, details, isConnected]);

  const qualityScore = getQualityScore();
  
  const getQualityLabel = useCallback((): string => {
    switch (qualityScore) {
      case 4: return 'Excellente';
      case 3: return 'Bonne';
      case 2: return 'Correcte';
      case 1: return 'Faible';
      case 0: return 'Hors ligne';
      default: return 'Inconnue';
    }
  }, [qualityScore]);

  return {
    qualityScore,
    qualityLabel: getQualityLabel(),
    isHighQuality: qualityScore >= 3,
    isLowQuality: qualityScore <= 1,
    connectionType,
    details,
  };
};

export default useNetworkStatus;
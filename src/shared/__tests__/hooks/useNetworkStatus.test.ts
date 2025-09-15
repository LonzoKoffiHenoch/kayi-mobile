/**
 * useNetworkStatus Hook Tests
 * Tests for network connectivity monitoring hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import NetInfo from '@react-native-community/netinfo';
import useNetworkStatus, { useConnectionQuality } from '../../hooks/useNetworkStatus';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  configure: jest.fn(),
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useNetworkStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockNetInfo.addEventListener.mockReturnValue(() => {});
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);
  });

  describe('Initial State', () => {
    test('starts with default state', () => {
      const { result } = renderHook(() => useNetworkStatus());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.connectionHistory).toEqual([]);
      expect(result.current.lastConnectedAt).toBe(null);
      expect(result.current.lastDisconnectedAt).toBe(null);
    });

    test('configures NetInfo correctly', () => {
      renderHook(() => useNetworkStatus({ enableReachabilityTest: true }));
      
      expect(mockNetInfo.configure).toHaveBeenCalledWith({
        reachabilityUrl: 'https://clients3.google.com/generate_204',
        reachabilityTest: expect.any(Function),
        reachabilityLongTimeout: 60000,
        reachabilityShortTimeout: 5000,
        reachabilityRequestTimeout: 15000,
      });
    });
  });

  describe('Network State Updates', () => {
    test('updates state when network changes', async () => {
      let listener: Function;
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
      
      // Simulate network state change
      act(() => {
        listener!({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
          details: null,
        });
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isOffline).toBe(true);
      expect(result.current.connectionType).toBe('none');
    });

    test('maintains connection history', () => {
      let listener: Function;
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      const { result } = renderHook(() => useNetworkStatus());
      
      // Simulate multiple network changes
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {},
        });
      });

      act(() => {
        listener!({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
          details: null,
        });
      });

      expect(result.current.connectionHistory).toHaveLength(2);
      expect(result.current.connectionHistory[0].isConnected).toBe(false);
      expect(result.current.connectionHistory[1].isConnected).toBe(true);
    });
  });

  describe('Callbacks', () => {
    test('calls onConnected when connection is established', () => {
      const onConnected = jest.fn();
      let listener: Function;
      
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      renderHook(() => useNetworkStatus({ onConnected }));
      
      // Start disconnected
      act(() => {
        listener!({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
          details: null,
        });
      });

      // Connect
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {},
        });
      });

      expect(onConnected).toHaveBeenCalledTimes(1);
    });

    test('calls onDisconnected when connection is lost', () => {
      const onDisconnected = jest.fn();
      let listener: Function;
      
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      renderHook(() => useNetworkStatus({ onDisconnected }));
      
      // Start connected
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {},
        });
      });

      // Disconnect
      act(() => {
        listener!({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
          details: null,
        });
      });

      expect(onDisconnected).toHaveBeenCalledTimes(1);
    });

    test('calls onConnectionChange on any state change', () => {
      const onConnectionChange = jest.fn();
      let listener: Function;
      
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      renderHook(() => useNetworkStatus({ onConnectionChange }));
      
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {},
        });
      });

      expect(onConnectionChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh Functionality', () => {
    test('refresh method fetches current state', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: { cellularGeneration: '4g' },
      } as any);

      const { result } = renderHook(() => useNetworkStatus());
      
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockNetInfo.fetch).toHaveBeenCalled();
      expect(result.current.connectionType).toBe('cellular');
    });

    test('handles refresh errors gracefully', async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useNetworkStatus());
      
      await act(async () => {
        await result.current.refresh();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch network state:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Derived State', () => {
    test('calculates isOnline correctly', () => {
      let listener: Function;
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      const { result } = renderHook(() => useNetworkStatus());
      
      // Connected with internet reachable
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
          details: {},
        });
      });
      expect(result.current.isOnline).toBe(true);
      expect(result.current.canMakeRequests).toBe(true);

      // Connected but internet not reachable
      act(() => {
        listener!({
          isConnected: true,
          isInternetReachable: false,
          type: 'wifi',
          details: {},
        });
      });
      expect(result.current.isOnline).toBe(false);
      expect(result.current.canMakeRequests).toBe(false);
    });

    test('calculates isOffline correctly', () => {
      let listener: Function;
      mockNetInfo.addEventListener.mockImplementation((callback) => {
        listener = callback;
        return () => {};
      });

      const { result } = renderHook(() => useNetworkStatus());
      
      act(() => {
        listener!({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
          details: null,
        });
      });

      expect(result.current.isOffline).toBe(true);
      expect(result.current.isOnline).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('unsubscribes on unmount', () => {
      const unsubscribe = jest.fn();
      mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useNetworkStatus());
      
      unmount();
      
      expect(unsubscribe).toHaveBeenCalled();
    });

    test('clears intervals on unmount', () => {
      jest.useFakeTimers();
      const { unmount } = renderHook(() => 
        useNetworkStatus({ checkInterval: 5000 })
      );
      
      unmount();
      
      // Should not throw when clearing intervals
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });
});

describe('useConnectionQuality Hook', () => {
  beforeEach(() => {
    mockNetInfo.addEventListener.mockReturnValue(() => {});
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    } as any);
  });

  test('rates WiFi connection as excellent', () => {
    let listener: Function;
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useConnectionQuality());
    
    act(() => {
      listener!({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      });
    });

    expect(result.current.qualityScore).toBe(4);
    expect(result.current.qualityLabel).toBe('Excellente');
    expect(result.current.isHighQuality).toBe(true);
  });

  test('rates 4G cellular as good', () => {
    let listener: Function;
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useConnectionQuality());
    
    act(() => {
      listener!({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: { cellularGeneration: '4g' },
      });
    });

    expect(result.current.qualityScore).toBe(3);
    expect(result.current.qualityLabel).toBe('Bonne');
    expect(result.current.isHighQuality).toBe(true);
  });

  test('rates 3G cellular as fair', () => {
    let listener: Function;
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useConnectionQuality());
    
    act(() => {
      listener!({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: { cellularGeneration: '3g' },
      });
    });

    expect(result.current.qualityScore).toBe(2);
    expect(result.current.qualityLabel).toBe('Correcte');
    expect(result.current.isHighQuality).toBe(false);
  });

  test('rates offline as poor', () => {
    let listener: Function;
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useConnectionQuality());
    
    act(() => {
      listener!({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      });
    });

    expect(result.current.qualityScore).toBe(0);
    expect(result.current.qualityLabel).toBe('Hors ligne');
    expect(result.current.isLowQuality).toBe(true);
  });
});
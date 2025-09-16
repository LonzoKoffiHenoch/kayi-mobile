/**
 * KAYI House RefreshControl Component
 * Enhanced pull-to-refresh with custom styling and feedback
 */

import React, { useState, useCallback } from 'react';
import {
  RefreshControl as RNRefreshControl,
  ScrollView,
  FlatList,
  SectionList,
  StyleSheet,
  View,
  Text,
  Animated,
  RefreshControlProps as RNRefreshControlProps,
  ScrollViewProps,
  FlatListProps,
  SectionListProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface RefreshControlProps extends Omit<RNRefreshControlProps, 'refreshing' | 'onRefresh' | 'size'> {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  title?: string;
  subtitle?: string;
  showLastUpdate?: boolean;
  lastUpdateKey?: string;
  customColors?: string[];
  size?: 'default' | 'large';
}

const RefreshControl: React.FC<RefreshControlProps> = React.memo(({
  refreshing,
  onRefresh,
  title = 'Actualiser',
  subtitle,
  showLastUpdate = true,
  lastUpdateKey = 'default',
  customColors,
  size = 'default',
  ...props
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
      if (showLastUpdate) {
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [onRefresh, showLastUpdate]);

  const getLastUpdateText = (): string => {
    if (!lastUpdate) return '';
    
    try {
      return `Dernière mise à jour: ${format(lastUpdate, 'HH:mm', { locale: fr })}`;
    } catch {
      return `Dernière mise à jour: ${lastUpdate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  };

  const colors = customColors || [
    theme.colors.primary[500],
    theme.colors.secondary[500],
    theme.colors.info[500],
  ];

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={colors} // Android
      tintColor={colors[0]} // iOS
      title={title} // iOS
      titleColor={theme.colors.text.secondary} // iOS
      progressBackgroundColor={theme.colors.surface.primary} // Android
      {...props}
    />
  );
});

// Enhanced ScrollView with custom refresh control
export interface RefreshableScrollViewProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  refreshTitle?: string;
  refreshSubtitle?: string;
  showLastUpdate?: boolean;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = React.memo(({
  children,
  refreshing,
  onRefresh,
  refreshTitle,
  refreshSubtitle,
  showLastUpdate = true,
  emptyComponent,
  loadingComponent,
  ...scrollViewProps
}) => {
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      title={refreshTitle}
      subtitle={refreshSubtitle}
      showLastUpdate={showLastUpdate}
    />
  );

  return (
    <ScrollView
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {refreshing && loadingComponent ? loadingComponent : children}
      {!refreshing && !children && emptyComponent}
    </ScrollView>
  );
});

// Enhanced FlatList with custom refresh control
export interface RefreshableFlatListProps<T> extends FlatListProps<T> {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  refreshTitle?: string;
  refreshSubtitle?: string;
  showLastUpdate?: boolean;
  emptyText?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  loadingComponent?: React.ReactNode;
}

export const RefreshableFlatList = <T extends any>({
  data,
  refreshing,
  onRefresh,
  refreshTitle,
  refreshSubtitle,
  showLastUpdate = true,
  emptyText = 'Aucun élément disponible',
  emptyIcon = 'list-outline',
  loadingComponent,
  ListEmptyComponent,
  ...flatListProps
}: RefreshableFlatListProps<T>) => {
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      title={refreshTitle}
      subtitle={refreshSubtitle}
      showLastUpdate={showLastUpdate}
    />
  );

  const defaultEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={emptyIcon}
        size={64}
        color={theme.colors.gray[400]}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      refreshControl={refreshControl}
      ListEmptyComponent={refreshing && loadingComponent ? () => <>{loadingComponent}</> : (ListEmptyComponent || (() => defaultEmptyComponent))}
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
};

// Enhanced SectionList with custom refresh control
export interface RefreshableSectionListProps<T, S> extends SectionListProps<T, S> {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  refreshTitle?: string;
  refreshSubtitle?: string;
  showLastUpdate?: boolean;
  emptyText?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  loadingComponent?: React.ReactNode;
}

export const RefreshableSectionList = <T extends any, S extends any>({
  sections,
  refreshing,
  onRefresh,
  refreshTitle,
  refreshSubtitle,
  showLastUpdate = true,
  emptyText = 'Aucune section disponible',
  emptyIcon = 'list-outline',
  loadingComponent,
  ListEmptyComponent,
  ...sectionListProps
}: RefreshableSectionListProps<T, S>) => {
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      title={refreshTitle}
      subtitle={refreshSubtitle}
      showLastUpdate={showLastUpdate}
    />
  );

  const defaultEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={emptyIcon}
        size={64}
        color={theme.colors.gray[400]}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      refreshControl={refreshControl}
      ListEmptyComponent={refreshing && loadingComponent ? () => <>{loadingComponent}</> : (ListEmptyComponent || (() => defaultEmptyComponent))}
      showsVerticalScrollIndicator={false}
      {...sectionListProps}
    />
  );
};

// Hook for refresh state management
export const useRefresh = (refreshFn?: () => Promise<void> | void) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (refreshing || !refreshFn) return;

    setRefreshing(true);
    try {
      await refreshFn();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFn, refreshing]);

  const canRefresh = !refreshing && Boolean(refreshFn);

  return {
    refreshing,
    refresh,
    lastRefresh,
    canRefresh,
  };
};

// Custom pull-to-refresh indicator for specific use cases
export const CustomRefreshIndicator: React.FC<{
  refreshing: boolean;
  progress?: number;
  size?: number;
  color?: string;
}> = ({
  refreshing,
  progress = 0,
  size = 40,
  color = theme.colors.primary[500],
}) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (refreshing) {
      const animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing && progress === 0) return null;

  return (
    <View style={styles.customIndicator}>
      <Animated.View
        style={[
          styles.indicatorIcon,
          {
            width: size,
            height: size,
            transform: [{ rotate: refreshing ? spin : '0deg' }],
          },
        ]}
      >
        <Ionicons
          name="refresh"
          size={size * 0.6}
          color={color}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  customIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  indicatorIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.primary,
    ...theme.elevation.sm,
  },
});

RefreshControl.displayName = 'RefreshControl';
RefreshableScrollView.displayName = 'RefreshableScrollView';

export default RefreshControl;
/**
 * Error state component for commuter-friendly error messages.
 * Provides contextual guidance for common scenarios:
 * - MBTA Server Offline
 * - No Active Vehicles Found
 * - Network connectivity issues
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const message = error?.message ?? 'Something went wrong.';
  const isServerError = message.toLowerCase().includes('server') || message.toLowerCase().includes('offline');
  const isNetworkError = message.toLowerCase().includes('network') || message.toLowerCase().includes('connection');

  const emoji = isServerError ? '🔧' : isNetworkError ? '📡' : '⚠️';
  const title = isServerError
    ? 'MBTA Server Offline'
    : isNetworkError
      ? 'No Connection'
      : 'Something Went Wrong';
  const subtitle = isServerError
    ? 'The MBTA service is temporarily unavailable. This usually resolves within a few minutes.'
    : isNetworkError
      ? 'Please check your internet connection and try again.'
      : message;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.errorBackground }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      {onRetry && (
        <Pressable
          style={[styles.retryButton, { backgroundColor: Brand.primary }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

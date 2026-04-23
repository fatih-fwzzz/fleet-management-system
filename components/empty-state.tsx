/**
 * Empty state component for when filters return no results.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: Brand.primaryAlpha10 }]}>
        <Text style={styles.emoji}>🚌</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>No Active Vehicles Found</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {hasActiveFilters
          ? 'No vehicles match your current filters. Try adjusting your selections.'
          : 'There are no active vehicles at this time.'}
      </Text>
      {hasActiveFilters && onClearFilters && (
        <Pressable style={[styles.clearButton, { borderColor: Brand.primary }]} onPress={onClearFilters}>
          <Text style={[styles.clearText, { color: Brand.primary }]}>Clear All Filters</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.xxxl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  emoji: { fontSize: 36 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  clearButton: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 2 },
  clearText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});

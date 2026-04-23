import { Pressable, StyleSheet, Text } from 'react-native';

import { BRAND_COLOR } from '@/constants/brand';

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export const FilterChip = ({ label, active, onPress }: FilterChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.activeChip : null]}>
      <Text style={[styles.text, active ? styles.activeText : null]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BRAND_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeChip: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  activeText: {
    color: 'white',
  },
});

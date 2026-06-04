import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { getStyles } from './styles';

export default function RecipesScreen() {
    const { colors } = useTheme();
    
     const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Екран рецептів</Text>
    </View>
  );
}

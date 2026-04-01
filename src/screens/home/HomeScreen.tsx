import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Home } from 'lucide-react-native';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Home size={40} color={colors.brand.primary} />
        </View>
        <Text style={styles.title}>Welcome Home!</Text>
        <Text style={styles.subtitle}>
          Glad to have you back in the ISoP community.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;

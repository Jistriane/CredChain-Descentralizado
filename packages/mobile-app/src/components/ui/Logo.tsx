import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'default' | 'compact' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({
  width = 200,
  height = 100,
  showText = true,
  variant = 'default'
}) => {
  const getLogoSize = () => {
    switch (variant) {
      case 'compact':
        return { width: 120, height: 60 };
      case 'icon':
        return { width: 40, height: 40 };
      default:
        return { width, height };
    }
  };

  const logoSize = getLogoSize();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={[styles.logo, logoSize]}
        resizeMode="contain"
      />
      {showText && variant !== 'icon' && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Cred<Text style={styles.chainText}>Chain</Text>
          </Text>
          <Text style={styles.subtitle}>Secure. Connected. Trusted.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    // Logo styles handled by size props
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  chainText: {
    color: '#d97706',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default Logo;

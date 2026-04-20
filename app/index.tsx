import { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ExpoImage
          source={require('../assets/onibuslonding.gif')}
          style={styles.splashGif}
          contentFit="contain"
        />
        <Text style={styles.splashText}>EduTransporter</Text>
      </View>
    );
  }

  return <Redirect href="/(auth)" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1A253A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashGif: {
    width: 200,
    height: 200,
  },
  splashText: {
    color: '#F5A623',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
});
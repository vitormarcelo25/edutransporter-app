import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, StatusBar, Text } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2436" />
      <Text style={styles.text}>EduTransporter</Text>
      <Text style={styles.subtext}>Carregando app...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2436',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F5A623',
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
});
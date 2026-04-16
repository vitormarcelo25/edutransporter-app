import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';

interface CustomInputProps extends TextInputProps {
  iconName: React.ComponentProps<typeof Feather>['name'];
  isPassword?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function CustomInput({ iconName, isPassword = false, value, onChangeText, ...rest }: CustomInputProps) {
  const { theme } = useApp();
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
      <Feather name={iconName} size={20} color={theme.textLight} style={styles.inputIcon} />
      
      <TextInput 
        style={[styles.inputWithIcon, { color: theme.textMain }]} 
        placeholderTextColor={theme.textLight}
        secureTextEntry={isPassword && !showPassword}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      
      {isPassword && (
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={theme.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 16,
    borderWidth: 1,
    height: 50,
  },
  inputIcon: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
  },
});

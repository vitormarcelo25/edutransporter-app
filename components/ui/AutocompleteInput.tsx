import React, { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
}

export function AutocompleteInput({ 
  value, 
  onChangeText, 
  onSelect, 
  suggestions, 
  placeholder,
  disabled = false
}: AutocompleteInputProps) {
  const { theme } = useApp();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return suggestions;
    const lowerValue = value.toLowerCase();
    return suggestions.filter(s => s.toLowerCase().includes(lowerValue));
  }, [value, suggestions]);

  const handleSelect = (item: string) => {
    onChangeText(item);
    onSelect(item);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChangeText('');
    onSelect('');
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[styles.suggestionItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleSelect(item)}
    >
      <Feather name="map-pin" size={16} color={theme.gold} />
      <Text style={[styles.suggestionText, { color: theme.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Feather name="map" size={18} color={theme.textLight} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: disabled ? theme.subtext : theme.text }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (text.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.textLight}
          onFocus={() => setShowSuggestions(true)}
          editable={!disabled}
        />
        {value.length > 0 && !disabled && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Feather name="x" size={18} color={theme.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    padding: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
  },
});
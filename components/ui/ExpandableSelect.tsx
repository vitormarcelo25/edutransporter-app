import React, { useState } from 'react';
import { 
  View, TouchableOpacity, Text, StyleSheet, 
  FlatList, Modal, Pressable 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';

interface ExpandableSelectProps {
  value: string;
  onSelect: (item: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

export function ExpandableSelect({ 
  value, 
  onSelect, 
  options, 
  placeholder,
  disabled = false
}: ExpandableSelectProps) {
  const { theme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[styles.optionItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleSelect(item)}
    >
      <Feather name="map-pin" size={16} color={theme.gold} />
      <Text style={[styles.optionText, { color: theme.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.selectButton, 
          { backgroundColor: theme.inputBg, borderColor: theme.border }
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <View style={styles.selectContent}>
          <Feather name="map" size={18} color={theme.textLight} style={styles.icon} />
          <Text 
            style={[
              styles.selectText, 
              { color: value ? theme.text : theme.textLight }
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
        <Feather 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme.textLight} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View 
            style={[
              styles.modalContent, 
              { backgroundColor: theme.bg, borderColor: theme.border }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {placeholder}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Feather name="x" size={24} color={theme.textLight} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderOption}
              showsVerticalScrollIndicator={true}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selectButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  selectText: {
    fontSize: 15,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionsContent: {
    padding: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Language, getSupportedLanguages, getLanguageName, getTranslations } from '../../lib/i18n';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const supportedLanguages = getSupportedLanguages();
  const t = getTranslations(currentLanguage);

  const getFlagEmoji = (lang: Language): string => {
    const flags = {
      'pt-BR': '🇧🇷',
      'en': '🇺🇸',
      'es': '🇪🇸',
    };
    return flags[lang];
  };

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        currentLanguage === item && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item)}
    >
      <Text style={styles.flagEmoji}>{getFlagEmoji(item)}</Text>
      <Text
        style={[
          styles.languageName,
          currentLanguage === item && styles.selectedLanguageName,
        ]}
      >
        {getLanguageName(item)}
      </Text>
      {currentLanguage === item && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.switcherButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.flagEmoji}>{getFlagEmoji(currentLanguage)}</Text>
        <Text style={styles.currentLanguage}>
          {getLanguageName(currentLanguage)}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.language.selectLanguage}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={supportedLanguages}
              keyExtractor={(item) => item}
              renderItem={renderLanguageItem}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  currentLanguage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  languageList: {
    maxHeight: 200,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedLanguageItem: {
    backgroundColor: '#f0f9ff',
  },
  languageName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  selectedLanguageName: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher;

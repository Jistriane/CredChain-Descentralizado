/**
 * KYC Screen - Tela de Verificação de Identidade do Mobile App
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function KYCScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados pessoais
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    
    // Endereço
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Renda
    income: '',
    incomeSource: 'salary',
    employer: '',
    occupation: '',
    
    // Documentos
    documentType: 'rg',
    documentNumber: '',
    documentIssuer: '',
    documentIssueDate: '',
    
    // Arquivos
    documentFront: null as string | null,
    documentBack: null as string | null,
    selfie: null as string | null,
    proofOfIncome: null as string | null,
    
    // Consentimentos
    acceptDataProcessing: false,
    acceptMarketing: false,
  });

  const navigation = useNavigation();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simular envio dos dados de KYC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Sucesso!',
        'Sua verificação foi enviada e será analisada em até 24 horas.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard' as never)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao enviar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange(field, result.assets[0].uri);
    }
  };

  const takePhoto = async (field: string) => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange(field, result.assets[0].uri);
    }
  };

  const showImageOptions = (field: string) => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => takePhoto(field) },
        { text: 'Galeria', onPress: () => pickImage(field) },
      ]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>
      <Text style={styles.stepSubtitle}>Preencha suas informações básicas</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            placeholderTextColor="#9CA3AF"
            value={formData.fullName}
            onChangeText={(value) => handleChange('fullName', value)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#9CA3AF"
            value={formData.cpf}
            onChangeText={(value) => handleChange('cpf', formatCPF(value))}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#9CA3AF"
            value={formData.birthDate}
            onChangeText={(value) => handleChange('birthDate', value)}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', formatPhone(value))}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Endereço</Text>
      <Text style={styles.stepSubtitle}>Informe seu endereço residencial</Text>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Rua/Avenida</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da rua"
              placeholderTextColor="#9CA3AF"
              value={formData.street}
              onChangeText={(value) => handleChange('street', value)}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Número</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#9CA3AF"
              value={formData.number}
              onChangeText={(value) => handleChange('number', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Complemento</Text>
          <TextInput
            style={styles.input}
            placeholder="Apartamento, bloco, etc."
            placeholderTextColor="#9CA3AF"
            value={formData.complement}
            onChangeText={(value) => handleChange('complement', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Bairro</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu bairro"
              placeholderTextColor="#9CA3AF"
              value={formData.neighborhood}
              onChangeText={(value) => handleChange('neighborhood', value)}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CEP</Text>
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor="#9CA3AF"
              value={formData.zipCode}
              onChangeText={(value) => handleChange('zipCode', formatZipCode(value))}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua cidade"
              placeholderTextColor="#9CA3AF"
              value={formData.city}
              onChangeText={(value) => handleChange('city', value)}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Estado</Text>
            <TextInput
              style={styles.input}
              placeholder="SP"
              placeholderTextColor="#9CA3AF"
              value={formData.state}
              onChangeText={(value) => handleChange('state', value.toUpperCase())}
              maxLength={2}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informações Financeiras</Text>
      <Text style={styles.stepSubtitle}>Dados sobre sua renda e ocupação</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Renda Mensal</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#9CA3AF"
            value={formData.income}
            onChangeText={(value) => handleChange('income', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Fonte da Renda</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerText}>
              {formData.incomeSource === 'salary' ? 'Salário' :
               formData.incomeSource === 'freelance' ? 'Freelancer' :
               formData.incomeSource === 'business' ? 'Empresário' :
               formData.incomeSource === 'investments' ? 'Investimentos' :
               formData.incomeSource === 'pension' ? 'Aposentadoria' : 'Outros'}
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Empresa/Empregador</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da empresa"
            placeholderTextColor="#9CA3AF"
            value={formData.employer}
            onChangeText={(value) => handleChange('employer', value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Ocupação/Profissão</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua profissão"
            placeholderTextColor="#9CA3AF"
            value={formData.occupation}
            onChangeText={(value) => handleChange('occupation', value)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documentos</Text>
      <Text style={styles.stepSubtitle}>Envie os documentos necessários</Text>

      <View style={styles.form}>
        {/* Document Front */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frente do Documento</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => showImageOptions('documentFront')}
          >
            {formData.documentFront ? (
              <Image source={{ uri: formData.documentFront }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderLabel}>Tirar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Document Back */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Verso do Documento</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => showImageOptions('documentBack')}
          >
            {formData.documentBack ? (
              <Image source={{ uri: formData.documentBack }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderLabel}>Tirar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Selfie */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Selfie com Documento</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => showImageOptions('selfie')}
          >
            {formData.selfie ? (
              <Image source={{ uri: formData.selfie }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>🤳</Text>
                <Text style={styles.imagePlaceholderLabel}>Tirar Selfie</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Proof of Income */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Comprovante de Renda (Opcional)</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => showImageOptions('proofOfIncome')}
          >
            {formData.proofOfIncome ? (
              <Image source={{ uri: formData.proofOfIncome }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📄</Text>
                <Text style={styles.imagePlaceholderLabel}>Adicionar Documento</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Consentimentos */}
        <View style={styles.consentContainer}>
          <View style={styles.consentItem}>
            <Switch
              value={formData.acceptDataProcessing}
              onValueChange={(value) => handleChange('acceptDataProcessing', value)}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor={formData.acceptDataProcessing ? '#FFFFFF' : '#FFFFFF'}
            />
            <Text style={styles.consentText}>
              Autorizo o processamento dos meus dados pessoais conforme a LGPD
            </Text>
          </View>

          <View style={styles.consentItem}>
            <Switch
              value={formData.acceptMarketing}
              onValueChange={(value) => handleChange('acceptMarketing', value)}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor={formData.acceptMarketing ? '#FFFFFF' : '#FFFFFF'}
            />
            <Text style={styles.consentText}>
              Aceito receber comunicações de marketing (opcional)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verificação de Identidade</Text>
          <Text style={styles.subtitle}>
            Complete sua verificação para acessar todas as funcionalidades
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Passo {step} de 4</Text>
        </View>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={prevStep}
            disabled={step === 1}
          >
            <Text style={[styles.navButtonText, styles.prevButtonText]}>
              Anterior
            </Text>
          </TouchableOpacity>

          {step < 4 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={nextStep}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                Próximo
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.navButtonText, styles.submitButtonText]}>
                  Finalizar
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  imageButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  consentContainer: {
    marginTop: 24,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  prevButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  prevButtonText: {
    color: '#374151',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});

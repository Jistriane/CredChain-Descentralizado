import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface KYCStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export const KYCScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'cpf',
    documentNumber: '',
    fullName: '',
    birthDate: '',
    motherName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });
  const [documents, setDocuments] = useState({
    frontDocument: null as string | null,
    backDocument: null as string | null,
    selfie: null as string | null
  });

  const navigation = useNavigation();

  const steps: KYCStep[] = [
    {
      id: 'personal',
      title: 'Dados Pessoais',
      description: 'Informe seus dados pessoais básicos',
      completed: false,
      required: true
    },
    {
      id: 'address',
      title: 'Endereço',
      description: 'Confirme seu endereço residencial',
      completed: false,
      required: true
    },
    {
      id: 'documents',
      title: 'Documentos',
      description: 'Envie fotos dos seus documentos',
      completed: false,
      required: true
    },
    {
      id: 'selfie',
      title: 'Selfie',
      description: 'Tire uma selfie para verificação',
      completed: false,
      required: true
    },
    {
      id: 'review',
      title: 'Revisão',
      description: 'Revise todas as informações',
      completed: false,
      required: true
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simular envio dos dados
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Sucesso!',
        'Seus dados foram enviados para verificação. Você receberá uma notificação quando a análise for concluída.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard' as never)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>
      <Text style={styles.stepDescription}>
        Preencha seus dados pessoais para verificação de identidade
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Documento</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioOption, formData.documentType === 'cpf' && styles.radioSelected]}
            onPress={() => handleInputChange('documentType', 'cpf')}
          >
            <Text style={[styles.radioText, formData.documentType === 'cpf' && styles.radioTextSelected]}>
              CPF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioOption, formData.documentType === 'cnpj' && styles.radioSelected]}
            onPress={() => handleInputChange('documentType', 'cnpj')}
          >
            <Text style={[styles.radioText, formData.documentType === 'cnpj' && styles.radioTextSelected]}>
              CNPJ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Número do Documento</Text>
        <TextInput
          style={styles.input}
          value={formData.documentNumber}
          onChangeText={(value) => handleInputChange('documentNumber', value)}
          placeholder="000.000.000-00"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
          placeholder="Seu nome completo"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput
          style={styles.input}
          value={formData.birthDate}
          onChangeText={(value) => handleInputChange('birthDate', value)}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome da Mãe</Text>
        <TextInput
          style={styles.input}
          value={formData.motherName}
          onChangeText={(value) => handleInputChange('motherName', value)}
          placeholder="Nome completo da sua mãe"
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Endereço</Text>
      <Text style={styles.stepDescription}>
        Confirme seu endereço residencial atual
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          placeholder="Rua, número, complemento"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholder="Sua cidade"
            autoCapitalize="words"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(value) => handleInputChange('state', value)}
            placeholder="UF"
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={styles.input}
          value={formData.zipCode}
          onChangeText={(value) => handleInputChange('zipCode', value)}
          placeholder="00000-000"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documentos</Text>
      <Text style={styles.stepDescription}>
        Envie fotos claras dos seus documentos
      </Text>

      <View style={styles.documentContainer}>
        <Text style={styles.documentTitle}>Frente do Documento</Text>
        <TouchableOpacity style={styles.documentButton}>
          {documents.frontDocument ? (
            <Image source={{ uri: documents.frontDocument }} style={styles.documentImage} />
          ) : (
            <View style={styles.documentPlaceholder}>
              <Text style={styles.documentPlaceholderText}>📷</Text>
              <Text style={styles.documentPlaceholderLabel}>Tirar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.documentContainer}>
        <Text style={styles.documentTitle}>Verso do Documento</Text>
        <TouchableOpacity style={styles.documentButton}>
          {documents.backDocument ? (
            <Image source={{ uri: documents.backDocument }} style={styles.documentImage} />
          ) : (
            <View style={styles.documentPlaceholder}>
              <Text style={styles.documentPlaceholderText}>📷</Text>
              <Text style={styles.documentPlaceholderLabel}>Tirar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSelfieStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Selfie</Text>
      <Text style={styles.stepDescription}>
        Tire uma selfie para verificação facial
      </Text>

      <View style={styles.selfieContainer}>
        <TouchableOpacity style={styles.selfieButton}>
          {documents.selfie ? (
            <Image source={{ uri: documents.selfie }} style={styles.selfieImage} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Text style={styles.selfiePlaceholderText}>📸</Text>
              <Text style={styles.selfiePlaceholderLabel}>Tirar Selfie</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.selfieInstructions}>
        <Text style={styles.instructionsTitle}>Instruções:</Text>
        <Text style={styles.instructionsText}>
          • Mantenha o rosto centralizado{'\n'}
          • Certifique-se de que há boa iluminação{'\n'}
          • Remova óculos e chapéus{'\n'}
          • Olhe diretamente para a câmera
        </Text>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Revisão</Text>
      <Text style={styles.stepDescription}>
        Revise todas as informações antes de enviar
      </Text>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Dados Pessoais</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Nome:</Text>
          <Text style={styles.reviewValue}>{formData.fullName}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Documento:</Text>
          <Text style={styles.reviewValue}>{formData.documentNumber}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Data de Nascimento:</Text>
          <Text style={styles.reviewValue}>{formData.birthDate}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Endereço</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Endereço:</Text>
          <Text style={styles.reviewValue}>{formData.address}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Cidade/Estado:</Text>
          <Text style={styles.reviewValue}>{formData.city}, {formData.state}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>CEP:</Text>
          <Text style={styles.reviewValue}>{formData.zipCode}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Documentos</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Frente do documento:</Text>
          <Text style={styles.reviewValue}>{documents.frontDocument ? 'Enviado' : 'Pendente'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Verso do documento:</Text>
          <Text style={styles.reviewValue}>{documents.backDocument ? 'Enviado' : 'Pendente'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Selfie:</Text>
          <Text style={styles.reviewValue}>{documents.selfie ? 'Enviada' : 'Pendente'}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderPersonalStep();
      case 1: return renderAddressStep();
      case 2: return renderDocumentsStep();
      case 3: return renderSelfieStep();
      case 4: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificação de Identidade</Text>
        <Text style={styles.subtitle}>Passo {currentStep + 1} de {steps.length}</Text>
      </View>

      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]}>
              {index < currentStep && <Text style={styles.progressCheck}>✓</Text>}
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentStep && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            onPress={currentStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Enviar' : 'Próximo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#3b82f6',
  },
  progressCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  row: {
    flexDirection: 'row',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  radioTextSelected: {
    color: '#fff',
  },
  documentContainer: {
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  documentButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  documentPlaceholder: {
    alignItems: 'center',
  },
  documentPlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  documentPlaceholderLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  selfieContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selfieButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieImage: {
    width: 196,
    height: 196,
    borderRadius: 98,
  },
  selfiePlaceholder: {
    alignItems: 'center',
  },
  selfiePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  selfiePlaceholderLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  selfieInstructions: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

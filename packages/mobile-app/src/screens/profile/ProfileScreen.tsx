import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Settings,
  Edit,
  Save,
  X,
  Camera,
  Bell,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react-native';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  walletAddress: string;
  creditScore: number;
  lastUpdated: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
  };
}

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userProfile: UserProfile = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+55 11 99999-9999',
        address: 'São Paulo, SP, Brasil',
        dateOfBirth: '1990-01-01',
        kycStatus: 'approved',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        creditScore: 750,
        lastUpdated: new Date().toISOString(),
        preferences: {
          notifications: true,
          emailUpdates: true,
          smsAlerts: false,
        },
      };

      setProfile(userProfile);
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        preferences: userProfile.preferences,
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth || '',
        preferences: profile.preferences,
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Simular atualização do perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...formData,
          lastUpdated: new Date().toISOString(),
        };
        
        setProfile(updatedProfile);
        setIsEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Perfil não encontrado</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProfile}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color="#FFFFFF" />
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.cameraButton}>
                  <Camera size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Nome"
                  />
                ) : (
                  profile.name
                )}
              </Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getKycStatusColor(profile.kycStatus) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getKycStatusColor(profile.kycStatus) },
                    ]}
                  >
                    {getKycStatusText(profile.kycStatus)}
                  </Text>
                </View>
                <Text style={styles.scoreText}>Score: {profile.creditScore}</Text>
              </View>
            </View>
          </View>
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Save size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="Email"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Phone size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Telefone"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.phone || 'Não informado'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <MapPin size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Endereço</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                  placeholder="Endereço"
                  multiline
                />
              ) : (
                <Text style={styles.infoValue}>{profile.address || 'Não informado'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Calendar size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.dateOfBirth || 'Não informado'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Wallet e Blockchain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Blockchain</Text>
          
          <TouchableOpacity
            style={styles.walletItem}
            onPress={() => setShowWalletModal(true)}
          >
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Endereço da Carteira</Text>
              <Text style={styles.walletAddress}>
                {formatWalletAddress(profile.walletAddress)}
              </Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Score de Crédito</Text>
            <Text style={styles.scoreValue}>{profile.creditScore}/1000</Text>
          </View>
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.preferenceLabel}>Notificações</Text>
            </View>
            {isEditing ? (
              <Switch
                value={formData.preferences.notifications}
                onValueChange={(value) => handleInputChange('preferences.notifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={formData.preferences.notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            ) : (
              <View
                style={[
                  styles.preferenceIndicator,
                  {
                    backgroundColor: profile.preferences.notifications ? '#10B981' : '#E5E7EB',
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Mail size={20} color="#6B7280" />
              <Text style={styles.preferenceLabel}>Email Updates</Text>
            </View>
            {isEditing ? (
              <Switch
                value={formData.preferences.emailUpdates}
                onValueChange={(value) => handleInputChange('preferences.emailUpdates', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={formData.preferences.emailUpdates ? '#FFFFFF' : '#FFFFFF'}
              />
            ) : (
              <View
                style={[
                  styles.preferenceIndicator,
                  {
                    backgroundColor: profile.preferences.emailUpdates ? '#10B981' : '#E5E7EB',
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Phone size={20} color="#6B7280" />
              <Text style={styles.preferenceLabel}>SMS Alerts</Text>
            </View>
            {isEditing ? (
              <Switch
                value={formData.preferences.smsAlerts}
                onValueChange={(value) => handleInputChange('preferences.smsAlerts', value)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={formData.preferences.smsAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            ) : (
              <View
                style={[
                  styles.preferenceIndicator,
                  {
                    backgroundColor: profile.preferences.smsAlerts ? '#10B981' : '#E5E7EB',
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <Shield size={20} color="#3B82F6" />
            <Text style={styles.actionText}>Verificar KYC</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <CreditCard size={20} color="#10B981" />
            <Text style={styles.actionText}>Gerenciar Pagamentos</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionText}>Configurações</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Lock size={20} color="#EF4444" />
            <Text style={styles.actionText}>Alterar Senha</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal do Wallet */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Endereço da Carteira</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.walletModalContent}>
              <Text style={styles.walletFullAddress}>{profile.walletAddress}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
  },
  editInput: {
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'monospace',
  },
  scoreItem: {
    paddingVertical: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  preferenceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  walletModalContent: {
    alignItems: 'center',
  },
  walletFullAddress: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  copyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
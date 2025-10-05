'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  EyeOff
} from 'lucide-react';

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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false
    }
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Simular carregamento de perfil
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Simular dados do usuário
        const userProfile: UserProfile = {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email,
          phone: '+55 11 99999-9999',
          address: 'São Paulo, SP, Brasil',
          dateOfBirth: '1990-01-01',
          kycStatus: 'approved',
          walletAddress: '0x...',
          creditScore: 750,
          lastUpdated: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailUpdates: true,
            smsAlerts: false
          }
        };

        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          preferences: userProfile.preferences
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

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
        preferences: profile.preferences
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
          lastUpdated: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
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
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil não encontrado</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1"
                    />
                  ) : (
                    profile.name
                  )}
                </h1>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getKycStatusColor(profile.kycStatus)}`}>
                    {getKycStatusText(profile.kycStatus)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Score: {profile.creditScore}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.dateOfBirth || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet e Blockchain */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Blockchain</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço da Carteira</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 font-mono text-sm">{profile.walletAddress}</p>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score de Crédito</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">{profile.creditScore}</span>
                    <span className="text-sm text-gray-500">/ 1000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preferências */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Notificações</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications}
                      onChange={(e) => handleInputChange('preferences.notifications', e.target.checked)}
                      className="rounded"
                    />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${profile.preferences.notifications ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Email Updates</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.preferences.emailUpdates}
                      onChange={(e) => handleInputChange('preferences.emailUpdates', e.target.checked)}
                      className="rounded"
                    />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${profile.preferences.emailUpdates ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">SMS Alerts</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.preferences.smsAlerts}
                      onChange={(e) => handleInputChange('preferences.smsAlerts', e.target.checked)}
                      className="rounded"
                    />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${profile.preferences.smsAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-2 text-left p-3 rounded-lg hover:bg-gray-50">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Verificar KYC</span>
                </button>
                <button className="w-full flex items-center space-x-2 text-left p-3 rounded-lg hover:bg-gray-50">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Gerenciar Pagamentos</span>
                </button>
                <button className="w-full flex items-center space-x-2 text-left p-3 rounded-lg hover:bg-gray-50">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Configurações</span>
                </button>
                <button className="w-full flex items-center space-x-2 text-left p-3 rounded-lg hover:bg-gray-50">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Alterar Senha</span>
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Membro desde</span>
                  <span className="text-sm font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última atualização</span>
                  <span className="text-sm font-medium">
                    {new Date(profile.lastUpdated).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status KYC</span>
                  <span className={`text-sm font-medium ${getKycStatusColor(profile.kycStatus)}`}>
                    {getKycStatusText(profile.kycStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic"

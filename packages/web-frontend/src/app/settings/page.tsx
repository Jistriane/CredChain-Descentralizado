'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  })

  const [profile, setProfile] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: true,
    sessionTimeout: 30
  })

  const handleSaveProfile = () => {
    // Simular salvamento
    console.log('Perfil salvo:', profile)
  }

  const handleSaveSecurity = () => {
    // Simular salvamento
    console.log('Configurações de segurança salvas:', security)
  }

  const handleSaveNotifications = () => {
    // Simular salvamento
    console.log('Notificações salvas:', notifications)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">Gerencie suas preferências e configurações da conta</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BellIcon className="w-4 h-4 mr-2" />
              Notificações
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Segurança
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GlobeAltIcon className="w-4 h-4 mr-2" />
              Preferências
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveProfile}>
                  Salvar Alterações
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferências de Notificação</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notificações por E-mail</p>
                      <p className="text-sm text-gray-500">Receber atualizações importantes por e-mail</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notificações por SMS</p>
                      <p className="text-sm text-gray-500">Receber alertas importantes por SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notificações Push</p>
                      <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">E-mail Marketing</p>
                      <p className="text-sm text-gray-500">Receber ofertas e novidades por e-mail</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  Salvar Preferências
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Segurança</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {security.twoFactor ? (
                      <Badge variant="success">Ativado</Badge>
                    ) : (
                      <Badge variant="secondary">Desativado</Badge>
                    )}
                    <Button size="sm" variant="secondary">
                      {security.twoFactor ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <KeyIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Biometria</p>
                      <p className="text-sm text-gray-500">Use impressão digital ou reconhecimento facial</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {security.biometric ? (
                      <Badge variant="success">Ativado</Badge>
                    ) : (
                      <Badge variant="secondary">Desativado</Badge>
                    )}
                    <Button size="sm" variant="secondary">
                      {security.biometric ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de Sessão (minutos)
                  </label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveSecurity}>
                  Salvar Configurações
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferências Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveProfile}>
                  Salvar Preferências
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
export const dynamic = "force-dynamic"
export const dynamic = "force-dynamic"

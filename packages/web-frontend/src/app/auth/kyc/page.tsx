'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function KYCPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    
    // Documentos
    documentType: 'rg',
    documentNumber: '',
    documentIssuer: '',
    documentIssueDate: '',
    
    // Renda
    income: '',
    incomeSource: 'salary',
    employer: '',
    occupation: '',
    
    // Arquivos
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
    proofOfIncome: null as File | null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular envio dos dados de KYC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar documentos');
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
        <p className="text-sm text-gray-600">Preencha suas informações básicas</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              required
              maxLength={14}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => {
                e.target.value = formatCPF(e.target.value);
                handleChange(e);
              }}
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              Data de Nascimento
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => {
              e.target.value = formatPhone(e.target.value);
              handleChange(e);
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
        <p className="text-sm text-gray-600">Informe seu endereço residencial</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
              Rua/Avenida
            </label>
            <input
              id="address.street"
              name="address.street"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address.number" className="block text-sm font-medium text-gray-700">
              Número
            </label>
            <input
              id="address.number"
              name="address.number"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address.number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address.complement" className="block text-sm font-medium text-gray-700">
            Complemento
          </label>
          <input
            id="address.complement"
            name="address.complement"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Apartamento, bloco, etc."
            value={formData.address.complement}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="address.neighborhood" className="block text-sm font-medium text-gray-700">
              Bairro
            </label>
            <input
              id="address.neighborhood"
              name="address.neighborhood"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address.neighborhood}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
              CEP
            </label>
            <input
              id="address.zipCode"
              name="address.zipCode"
              type="text"
              required
              maxLength={9}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="00000-000"
              value={formData.address.zipCode}
              onChange={(e) => {
                e.target.value = formatZipCode(e.target.value);
                handleChange(e);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              id="address.city"
              name="address.city"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address.city}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="address.state"
              name="address.state"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.address.state}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Informações Financeiras</h3>
        <p className="text-sm text-gray-600">Dados sobre sua renda e ocupação</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-700">
            Renda Mensal
          </label>
          <input
            id="income"
            name="income"
            type="number"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="0,00"
            value={formData.income}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="incomeSource" className="block text-sm font-medium text-gray-700">
            Fonte da Renda
          </label>
          <select
            id="incomeSource"
            name="incomeSource"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.incomeSource}
            onChange={handleChange}
          >
            <option value="salary">Salário</option>
            <option value="freelance">Freelancer</option>
            <option value="business">Empresário</option>
            <option value="investments">Investimentos</option>
            <option value="pension">Aposentadoria</option>
            <option value="other">Outros</option>
          </select>
        </div>

        <div>
          <label htmlFor="employer" className="block text-sm font-medium text-gray-700">
            Empresa/Empregador
          </label>
          <input
            id="employer"
            name="employer"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.employer}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
            Ocupação/Profissão
          </label>
          <input
            id="occupation"
            name="occupation"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.occupation}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
        <p className="text-sm text-gray-600">Envie os documentos necessários para verificação</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            id="documentType"
            name="documentType"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.documentType}
            onChange={handleChange}
          >
            <option value="rg">RG</option>
            <option value="cnh">CNH</option>
            <option value="passport">Passaporte</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">
              Número do Documento
            </label>
            <input
              id="documentNumber"
              name="documentNumber"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.documentNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="documentIssuer" className="block text-sm font-medium text-gray-700">
              Órgão Emissor
            </label>
            <input
              id="documentIssuer"
              name="documentIssuer"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="SSP/SP"
              value={formData.documentIssuer}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="documentIssueDate" className="block text-sm font-medium text-gray-700">
            Data de Emissão
          </label>
          <input
            id="documentIssueDate"
            name="documentIssueDate"
            type="date"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.documentIssueDate}
            onChange={handleChange}
          />
        </div>

        {/* Upload de arquivos */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frente do Documento
            </label>
            <input
              type="file"
              name="documentFront"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verso do Documento
            </label>
            <input
              type="file"
              name="documentBack"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Selfie com Documento
            </label>
            <input
              type="file"
              name="selfie"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprovante de Renda (Opcional)
            </label>
            <input
              type="file"
              name="proofOfIncome"
              accept="image/*,.pdf"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verificação de Identidade (KYC)</h1>
          <p className="mt-2 text-gray-600">
            Complete sua verificação para acessar todas as funcionalidades
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Dados Pessoais</span>
            <span>Endereço</span>
            <span>Renda</span>
            <span>Documentos</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro na verificação
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Finalizar Verificação'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

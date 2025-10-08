# 🔌 CredChain - Documentação da API

<div align="center">
  <img src="logo.png" alt="CredChain Logo" width="200" height="100">
  <br>
  <strong>API Documentation & Integration Guide</strong>
</div>

## 🌍 Idiomas / Languages / Idiomas

- [🇧🇷 Português](#-português)
- [🇺🇸 English](#-english)
- [🇪🇸 Español](#-español)

---

## 🇧🇷 Português

### 🚀 URLs de Produção

#### **Frontend:**
- **Principal**: https://credchain-mainnet.vercel.app
- **Alternativa**: https://credchain-mainnet-jistrianedroid-3423s-projects.vercel.app

#### **Backend APIs:**
- **API Gateway**: https://credchain-api-gateway-4a6iin50q-jistrianedroid-3423s-projects.vercel.app
- **Mobile Backend**: https://credchain-mobile-backend-7anprjcnr.vercel.app

#### **Microserviços:**
- **Auth Service**: https://credchain-auth-service-30qmeddx8-jistrianedroid-3423s-projects.vercel.app
- **Score Service**: https://score-service-4fiv422va-jistrianedroid-3423s-projects.vercel.app
- **Payment Service**: https://payment-service-dhqiibp66-jistrianedroid-3423s-projects.vercel.app
- **Oracle Service**: https://oracle-service-kxo3tnmkh-jistrianedroid-3423s-projects.vercel.app
- **Notification Service**: https://notification-service-o7zi1pmzu-jistrianedroid-3423s-projects.vercel.app
- **Compliance Service**: https://compliance-service-aac4hsovl-jistrianedroid-3423s-projects.vercel.app
- **User Service**: https://user-service-f1sznt2gy-jistrianedroid-3423s-projects.vercel.app

### 📡 Endpoints da API

#### **1. Autenticação**

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "João Silva",
  "cpf": "12345678901"
}
```

**POST** `/api/auth/verify`
```json
{
  "token": "jwt_token_here"
}
```

#### **2. Credit Score**

**GET** `/api/score/{userId}`
```json
{
  "userId": "user123",
  "score": 750,
  "factors": {
    "payment_history": 0.3,
    "credit_utilization": 0.25,
    "credit_length": 0.2,
    "new_credit": 0.15,
    "credit_mix": 0.1
  },
  "recommendations": [
    "Mantenha pagamentos em dia",
    "Reduza utilização de crédito"
  ]
}
```

**POST** `/api/score/calculate`
```json
{
  "userId": "user123",
  "data": {
    "payment_history": "excellent",
    "credit_utilization": 0.3,
    "credit_length": 5,
    "new_credit": 1,
    "credit_mix": "diversified"
  }
}
```

#### **3. Chat com IA**

**POST** `/api/chat`
```json
{
  "message": "Como posso melhorar meu score?",
  "userId": "user123",
  "context": "credit_advice"
}
```

**Response:**
```json
{
  "response": "Para melhorar seu score, recomendo...",
  "agent": "Financial Advisor",
  "confidence": 0.95,
  "suggestions": [
    "Pague contas em dia",
    "Mantenha baixa utilização de crédito"
  ]
}
```

#### **4. Pagamentos**

**GET** `/api/payments/{userId}`
```json
{
  "payments": [
    {
      "id": "pay123",
      "amount": 1000.00,
      "date": "2024-01-15",
      "status": "completed",
      "description": "Empréstimo pessoal"
    }
  ]
}
```

**POST** `/api/payments/process`
```json
{
  "userId": "user123",
  "amount": 1000.00,
  "description": "Empréstimo pessoal",
  "method": "pix"
}
```

### 🔧 Configuração de Integração

#### **Headers Obrigatórios:**
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-API-Key: {api_key}
X-Client-Version: 1.0.0
```

#### **Rate Limiting:**
- **Auth**: 5 tentativas/15min
- **API**: 100 requests/15min
- **Chat**: 20 mensagens/minuto

#### **Códigos de Status:**
- **200**: Sucesso
- **201**: Criado
- **400**: Bad Request
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **429**: Rate limit excedido
- **500**: Erro interno

---

## 🇺🇸 English

### 🚀 Production URLs

#### **Frontend:**
- **Main**: https://credchain-mainnet.vercel.app
- **Alternative**: https://credchain-mainnet-jistrianedroid-3423s-projects.vercel.app

#### **Backend APIs:**
- **API Gateway**: https://credchain-api-gateway-4a6iin50q-jistrianedroid-3423s-projects.vercel.app
- **Mobile Backend**: https://credchain-mobile-backend-7anprjcnr.vercel.app

#### **Microservices:**
- **Auth Service**: https://credchain-auth-service-30qmeddx8-jistrianedroid-3423s-projects.vercel.app
- **Score Service**: https://score-service-4fiv422va-jistrianedroid-3423s-projects.vercel.app
- **Payment Service**: https://payment-service-dhqiibp66-jistrianedroid-3423s-projects.vercel.app
- **Oracle Service**: https://oracle-service-kxo3tnmkh-jistrianedroid-3423s-projects.vercel.app
- **Notification Service**: https://notification-service-o7zi1pmzu-jistrianedroid-3423s-projects.vercel.app
- **Compliance Service**: https://compliance-service-aac4hsovl-jistrianedroid-3423s-projects.vercel.app
- **User Service**: https://user-service-f1sznt2gy-jistrianedroid-3423s-projects.vercel.app

### 📡 API Endpoints

#### **1. Authentication**

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "cpf": "12345678901"
}
```

**POST** `/api/auth/verify`
```json
{
  "token": "jwt_token_here"
}
```

#### **2. Credit Score**

**GET** `/api/score/{userId}`
```json
{
  "userId": "user123",
  "score": 750,
  "factors": {
    "payment_history": 0.3,
    "credit_utilization": 0.25,
    "credit_length": 0.2,
    "new_credit": 0.15,
    "credit_mix": 0.1
  },
  "recommendations": [
    "Keep payments on time",
    "Reduce credit utilization"
  ]
}
```

**POST** `/api/score/calculate`
```json
{
  "userId": "user123",
  "data": {
    "payment_history": "excellent",
    "credit_utilization": 0.3,
    "credit_length": 5,
    "new_credit": 1,
    "credit_mix": "diversified"
  }
}
```

#### **3. AI Chat**

**POST** `/api/chat`
```json
{
  "message": "How can I improve my score?",
  "userId": "user123",
  "context": "credit_advice"
}
```

**Response:**
```json
{
  "response": "To improve your score, I recommend...",
  "agent": "Financial Advisor",
  "confidence": 0.95,
  "suggestions": [
    "Pay bills on time",
    "Keep low credit utilization"
  ]
}
```

#### **4. Payments**

**GET** `/api/payments/{userId}`
```json
{
  "payments": [
    {
      "id": "pay123",
      "amount": 1000.00,
      "date": "2024-01-15",
      "status": "completed",
      "description": "Personal loan"
    }
  ]
}
```

**POST** `/api/payments/process`
```json
{
  "userId": "user123",
  "amount": 1000.00,
  "description": "Personal loan",
  "method": "pix"
}
```

### 🔧 Integration Configuration

#### **Required Headers:**
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-API-Key: {api_key}
X-Client-Version: 1.0.0
```

#### **Rate Limiting:**
- **Auth**: 5 attempts/15min
- **API**: 100 requests/15min
- **Chat**: 20 messages/minute

#### **Status Codes:**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Rate limit exceeded
- **500**: Internal error

---

## 🇪🇸 Español

### 🚀 URLs de Producción

#### **Frontend:**
- **Principal**: https://credchain-mainnet.vercel.app
- **Alternativa**: https://credchain-mainnet-jistrianedroid-3423s-projects.vercel.app

#### **Backend APIs:**
- **API Gateway**: https://credchain-api-gateway-4a6iin50q-jistrianedroid-3423s-projects.vercel.app
- **Mobile Backend**: https://credchain-mobile-backend-7anprjcnr.vercel.app

#### **Microservicios:**
- **Auth Service**: https://credchain-auth-service-30qmeddx8-jistrianedroid-3423s-projects.vercel.app
- **Score Service**: https://score-service-4fiv422va-jistrianedroid-3423s-projects.vercel.app
- **Payment Service**: https://payment-service-dhqiibp66-jistrianedroid-3423s-projects.vercel.app
- **Oracle Service**: https://oracle-service-kxo3tnmkh-jistrianedroid-3423s-projects.vercel.app
- **Notification Service**: https://notification-service-o7zi1pmzu-jistrianedroid-3423s-projects.vercel.app
- **Compliance Service**: https://compliance-service-aac4hsovl-jistrianedroid-3423s-projects.vercel.app
- **User Service**: https://user-service-f1sznt2gy-jistrianedroid-3423s-projects.vercel.app

### 📡 Endpoints de la API

#### **1. Autenticación**

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "cpf": "12345678901"
}
```

**POST** `/api/auth/verify`
```json
{
  "token": "jwt_token_here"
}
```

#### **2. Credit Score**

**GET** `/api/score/{userId}`
```json
{
  "userId": "user123",
  "score": 750,
  "factors": {
    "payment_history": 0.3,
    "credit_utilization": 0.25,
    "credit_length": 0.2,
    "new_credit": 0.15,
    "credit_mix": 0.1
  },
  "recommendations": [
    "Mantén pagos al día",
    "Reduce utilización de crédito"
  ]
}
```

**POST** `/api/score/calculate`
```json
{
  "userId": "user123",
  "data": {
    "payment_history": "excellent",
    "credit_utilization": 0.3,
    "credit_length": 5,
    "new_credit": 1,
    "credit_mix": "diversified"
  }
}
```

#### **3. Chat con IA**

**POST** `/api/chat`
```json
{
  "message": "¿Cómo puedo mejorar mi score?",
  "userId": "user123",
  "context": "credit_advice"
}
```

**Response:**
```json
{
  "response": "Para mejorar tu score, recomiendo...",
  "agent": "Financial Advisor",
  "confidence": 0.95,
  "suggestions": [
    "Paga facturas a tiempo",
    "Mantén baja utilización de crédito"
  ]
}
```

#### **4. Pagos**

**GET** `/api/payments/{userId}`
```json
{
  "payments": [
    {
      "id": "pay123",
      "amount": 1000.00,
      "date": "2024-01-15",
      "status": "completed",
      "description": "Préstamo personal"
    }
  ]
}
```

**POST** `/api/payments/process`
```json
{
  "userId": "user123",
  "amount": 1000.00,
  "description": "Préstamo personal",
  "method": "pix"
}
```

### 🔧 Configuración de Integración

#### **Headers Requeridos:**
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-API-Key: {api_key}
X-Client-Version: 1.0.0
```

#### **Rate Limiting:**
- **Auth**: 5 intentos/15min
- **API**: 100 requests/15min
- **Chat**: 20 mensajes/minuto

#### **Códigos de Estado:**
- **200**: Éxito
- **201**: Creado
- **400**: Bad Request
- **401**: No autorizado
- **403**: Prohibido
- **404**: No encontrado
- **429**: Rate limit excedido
- **500**: Error interno

---

## 📞 Contato / Contact / Contacto

- **Website**: https://credchain-mainnet.vercel.app
- **Email**: support@credchain.io
- **GitHub**: https://github.com/credchain/credchain
- **Documentation**: [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)

---

**🎉 CredChain está pronto para democratizar o acesso ao crédito na América Latina!** 🚀🇧🇷

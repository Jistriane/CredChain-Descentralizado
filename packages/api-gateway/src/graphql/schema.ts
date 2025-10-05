import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    name: String!
    email: String!
    walletAddress: String
    kycStatus: KYCStatus!
    createdAt: Date!
    updatedAt: Date!
  }

  type CreditScore {
    id: ID!
    userId: ID!
    score: Int!
    factors: [ScoreFactor!]!
    calculatedAt: Date!
    verified: Boolean!
    blockchainHash: String
  }

  type ScoreFactor {
    name: String!
    value: Int!
    weight: Int!
    description: String!
  }

  type Payment {
    id: ID!
    userId: ID!
    amount: Float!
    currency: String!
    description: String
    status: PaymentStatus!
    dueDate: Date
    paidDate: Date
    createdAt: Date!
    blockchainTx: String
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    title: String!
    message: String!
    read: Boolean!
    createdAt: Date!
    metadata: JSON
  }

  type ChatMessage {
    id: ID!
    userId: ID!
    agent: String!
    content: String!
    timestamp: Date!
    metadata: JSON
  }

  type Analytics {
    totalUsers: Int!
    totalScores: Int!
    averageScore: Float!
    totalPayments: Int!
    totalVolume: Float!
    fraudAlerts: Int!
    complianceChecks: Int!
  }

  enum KYCStatus {
    PENDING
    VERIFIED
    REJECTED
    EXPIRED
  }

  enum PaymentStatus {
    PENDING
    PAID
    LATE
    DEFAULTED
  }

  enum NotificationType {
    SCORE_UPDATE
    PAYMENT_REMINDER
    FRAUD_ALERT
    COMPLIANCE_UPDATE
    SYSTEM_UPDATE
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    
    # Credit score queries
    myCreditScore: CreditScore
    creditScore(userId: ID!): CreditScore
    creditScoreHistory(userId: ID!, limit: Int): [CreditScore!]!
    
    # Payment queries
    myPayments(limit: Int, offset: Int): [Payment!]!
    payment(id: ID!): Payment
    paymentsByUser(userId: ID!, limit: Int, offset: Int): [Payment!]!
    
    # Notification queries
    myNotifications(limit: Int, offset: Int): [Notification!]!
    unreadNotifications: [Notification!]!
    
    # Chat queries
    chatHistory(limit: Int, offset: Int): [ChatMessage!]!
    
    # Analytics queries
    analytics: Analytics
    userAnalytics(userId: ID!): JSON
    systemMetrics: JSON
  }

  type Mutation {
    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    updateKYCStatus(input: UpdateKYCInput!): User!
    
    # Credit score mutations
    calculateCreditScore: CreditScore!
    updateCreditScore(input: UpdateScoreInput!): CreditScore!
    
    # Payment mutations
    createPayment(input: CreatePaymentInput!): Payment!
    updatePaymentStatus(input: UpdatePaymentInput!): Payment!
    markPaymentPaid(id: ID!, proof: String!): Payment!
    
    # Notification mutations
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
    
    # Chat mutations
    sendMessage(content: String!, agent: String): ChatMessage!
    
    # System mutations
    triggerComplianceCheck(userId: ID!): Boolean!
    triggerFraudAnalysis(userId: ID!): Boolean!
  }

  type Subscription {
    # Real-time subscriptions
    scoreUpdated(userId: ID!): CreditScore!
    paymentUpdated(userId: ID!): Payment!
    notificationReceived(userId: ID!): Notification!
    chatMessageReceived(userId: ID!): ChatMessage!
    systemMetricsUpdated: JSON!
  }

  # Input types
  input UpdateProfileInput {
    name: String
    email: String
    walletAddress: String
  }

  input UpdateKYCInput {
    status: KYCStatus!
    documents: [String!]!
  }

  input UpdateScoreInput {
    score: Int!
    factors: [ScoreFactorInput!]!
    verified: Boolean!
  }

  input ScoreFactorInput {
    name: String!
    value: Int!
    weight: Int!
    description: String!
  }

  input CreatePaymentInput {
    amount: Float!
    currency: String!
    description: String
    dueDate: Date
  }

  input UpdatePaymentInput {
    id: ID!
    status: PaymentStatus!
    paidDate: Date
  }
`;

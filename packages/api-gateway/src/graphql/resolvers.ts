import { IResolvers } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import { UserService } from '../services/UserService';
import { CreditScoreService } from '../services/CreditScoreService';
import { PaymentService } from '../services/PaymentService';
import { NotificationService } from '../services/NotificationService';
import { ChatService } from '../services/ChatService';
import { AnalyticsService } from '../services/AnalyticsService';

const pubsub = new PubSub();

export const resolvers: IResolvers = {
  Query: {
    // User queries
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await UserService.getUserById(user.id);
    },

    user: async (_, { id }) => {
      return await UserService.getUserById(id);
    },

    users: async (_, { limit = 10, offset = 0 }) => {
      return await UserService.getUsers(limit, offset);
    },

    // Credit score queries
    myCreditScore: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await CreditScoreService.getUserCreditScore(user.id);
    },

    creditScore: async (_, { userId }) => {
      return await CreditScoreService.getUserCreditScore(userId);
    },

    creditScoreHistory: async (_, { userId, limit = 10 }) => {
      return await CreditScoreService.getCreditScoreHistory(userId, limit);
    },

    // Payment queries
    myPayments: async (_, { limit = 10, offset = 0 }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await PaymentService.getUserPayments(user.id, limit, offset);
    },

    payment: async (_, { id }) => {
      return await PaymentService.getPaymentById(id);
    },

    paymentsByUser: async (_, { userId, limit = 10, offset = 0 }) => {
      return await PaymentService.getUserPayments(userId, limit, offset);
    },

    // Notification queries
    myNotifications: async (_, { limit = 10, offset = 0 }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await NotificationService.getUserNotifications(user.id, limit, offset);
    },

    unreadNotifications: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await NotificationService.getUnreadNotifications(user.id);
    },

    // Chat queries
    chatHistory: async (_, { limit = 50, offset = 0 }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await ChatService.getChatHistory(user.id, limit, offset);
    },

    // Analytics queries
    analytics: async () => {
      return await AnalyticsService.getSystemAnalytics();
    },

    userAnalytics: async (_, { userId }) => {
      return await AnalyticsService.getUserAnalytics(userId);
    },

    systemMetrics: async () => {
      return await AnalyticsService.getSystemMetrics();
    },
  },

  Mutation: {
    // User mutations
    updateProfile: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await UserService.updateProfile(user.id, input);
    },

    updateKYCStatus: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const updatedUser = await UserService.updateKYCStatus(user.id, input);
      
      // Publish notification
      pubsub.publish('NOTIFICATION_RECEIVED', {
        notificationReceived: {
          id: `kyc-${Date.now()}`,
          userId: user.id,
          type: 'COMPLIANCE_UPDATE',
          title: 'KYC Status Updated',
          message: `Your KYC status has been updated to ${input.status}`,
          read: false,
          createdAt: new Date(),
          metadata: { status: input.status }
        }
      });

      return updatedUser;
    },

    // Credit score mutations
    calculateCreditScore: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      const score = await CreditScoreService.calculateScore(user.id);
      
      // Publish score update
      pubsub.publish('SCORE_UPDATED', {
        scoreUpdated: score
      });

      return score;
    },

    updateCreditScore: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const score = await CreditScoreService.updateScore(user.id, input);
      
      // Publish score update
      pubsub.publish('SCORE_UPDATED', {
        scoreUpdated: score
      });

      return score;
    },

    // Payment mutations
    createPayment: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const payment = await PaymentService.createPayment(user.id, input);
      
      // Publish payment update
      pubsub.publish('PAYMENT_UPDATED', {
        paymentUpdated: payment
      });

      return payment;
    },

    updatePaymentStatus: async (_, { input }) => {
      const payment = await PaymentService.updatePaymentStatus(input.id, input);
      
      // Publish payment update
      pubsub.publish('PAYMENT_UPDATED', {
        paymentUpdated: payment
      });

      return payment;
    },

    markPaymentPaid: async (_, { id, proof }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const payment = await PaymentService.markPaymentPaid(id, proof, user.id);
      
      // Publish payment update
      pubsub.publish('PAYMENT_UPDATED', {
        paymentUpdated: payment
      });

      return payment;
    },

    // Notification mutations
    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await NotificationService.markAsRead(id, user.id);
    },

    markAllNotificationsRead: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await NotificationService.markAllAsRead(user.id);
    },

    // Chat mutations
    sendMessage: async (_, { content, agent = 'orchestrator' }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const message = await ChatService.sendMessage(user.id, content, agent);
      
      // Publish chat message
      pubsub.publish('CHAT_MESSAGE_RECEIVED', {
        chatMessageReceived: message
      });

      return message;
    },

    // System mutations
    triggerComplianceCheck: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await AnalyticsService.triggerComplianceCheck(userId);
    },

    triggerFraudAnalysis: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await AnalyticsService.triggerFraudAnalysis(userId);
    },
  },

  Subscription: {
    scoreUpdated: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([`SCORE_UPDATED_${userId}`]);
      }
    },

    paymentUpdated: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([`PAYMENT_UPDATED_${userId}`]);
      }
    },

    notificationReceived: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([`NOTIFICATION_RECEIVED_${userId}`]);
      }
    },

    chatMessageReceived: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([`CHAT_MESSAGE_RECEIVED_${userId}`]);
      }
    },

    systemMetricsUpdated: {
      subscribe: () => {
        return pubsub.asyncIterator(['SYSTEM_METRICS_UPDATED']);
      }
    },
  },
};

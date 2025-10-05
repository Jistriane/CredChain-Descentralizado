import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { logger } from '../utils/logger';
import { config } from '../config/config';

// Import service implementations
import { AuthService } from './services/AuthService';
import { ScoreService } from './services/ScoreService';
import { PaymentService } from './services/PaymentService';
import { UserService } from './services/UserService';
import { AnalyticsService } from './services/AnalyticsService';
import { ComplianceService } from './services/ComplianceService';
import { NotificationService } from './services/NotificationService';
import { OracleService } from './services/OracleService';

export class GrpcServer {
  private server: grpc.Server;
  private port: number;

  constructor(port: number = 50051) {
    this.port = port;
    this.server = new grpc.Server();
    this.setupServices();
  }

  private setupServices(): void {
    // Load proto files
    const authProto = protoLoader.loadSync('proto/auth.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const scoreProto = protoLoader.loadSync('proto/score.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const paymentProto = protoLoader.loadSync('proto/payment.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const userProto = protoLoader.loadSync('proto/user.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const analyticsProto = protoLoader.loadSync('proto/analytics.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const complianceProto = protoLoader.loadSync('proto/compliance.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const notificationProto = protoLoader.loadSync('proto/notification.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const oracleProto = protoLoader.loadSync('proto/oracle.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    // Create package definitions
    const authPackage = grpc.loadPackageDefinition(authProto) as any;
    const scorePackage = grpc.loadPackageDefinition(scoreProto) as any;
    const paymentPackage = grpc.loadPackageDefinition(paymentProto) as any;
    const userPackage = grpc.loadPackageDefinition(userProto) as any;
    const analyticsPackage = grpc.loadPackageDefinition(analyticsProto) as any;
    const compliancePackage = grpc.loadPackageDefinition(complianceProto) as any;
    const notificationPackage = grpc.loadPackageDefinition(notificationProto) as any;
    const oraclePackage = grpc.loadPackageDefinition(oracleProto) as any;

    // Add services to server
    this.server.addService(authPackage.credchain.AuthService.service, {
      authenticate: this.handleAuthenticate.bind(this),
      refreshToken: this.handleRefreshToken.bind(this),
      logout: this.handleLogout.bind(this),
      validateToken: this.handleValidateToken.bind(this),
    });

    this.server.addService(scorePackage.credchain.ScoreService.service, {
      calculateScore: this.handleCalculateScore.bind(this),
      getScore: this.handleGetScore.bind(this),
      updateScore: this.handleUpdateScore.bind(this),
      getScoreHistory: this.handleGetScoreHistory.bind(this),
    });

    this.server.addService(paymentPackage.credchain.PaymentService.service, {
      processPayment: this.handleProcessPayment.bind(this),
      getPayment: this.handleGetPayment.bind(this),
      getPaymentHistory: this.handleGetPaymentHistory.bind(this),
      cancelPayment: this.handleCancelPayment.bind(this),
    });

    this.server.addService(userPackage.credchain.UserService.service, {
      createUser: this.handleCreateUser.bind(this),
      getUser: this.handleGetUser.bind(this),
      updateUser: this.handleUpdateUser.bind(this),
      deleteUser: this.handleDeleteUser.bind(this),
    });

    this.server.addService(analyticsPackage.credchain.AnalyticsService.service, {
      getAnalytics: this.handleGetAnalytics.bind(this),
      getMetrics: this.handleGetMetrics.bind(this),
      getReports: this.handleGetReports.bind(this),
      generateReport: this.handleGenerateReport.bind(this),
    });

    this.server.addService(compliancePackage.credchain.ComplianceService.service, {
      checkCompliance: this.handleCheckCompliance.bind(this),
      getComplianceStatus: this.handleGetComplianceStatus.bind(this),
      updateCompliance: this.handleUpdateCompliance.bind(this),
      getComplianceHistory: this.handleGetComplianceHistory.bind(this),
    });

    this.server.addService(notificationPackage.credchain.NotificationService.service, {
      sendNotification: this.handleSendNotification.bind(this),
      getNotifications: this.handleGetNotifications.bind(this),
      markAsRead: this.handleMarkAsRead.bind(this),
      deleteNotification: this.handleDeleteNotification.bind(this),
    });

    this.server.addService(oraclePackage.credchain.OracleService.service, {
      getOracleData: this.handleGetOracleData.bind(this),
      updateOracleData: this.handleUpdateOracleData.bind(this),
      validateOracleData: this.handleValidateOracleData.bind(this),
      getOracleStatus: this.handleGetOracleStatus.bind(this),
    });

    logger.info('gRPC services configured successfully');
  }

  // Auth Service handlers
  private async handleAuthenticate(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { username, password } = call.request;
      const authService = new AuthService();
      const result = await authService.authenticate(username, password);
      callback(null, result);
    } catch (error) {
      logger.error('Authentication error:', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: 'Authentication failed',
      });
    }
  }

  private async handleRefreshToken(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { refreshToken } = call.request;
      const authService = new AuthService();
      const result = await authService.refreshToken(refreshToken);
      callback(null, result);
    } catch (error) {
      logger.error('Token refresh error:', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: 'Token refresh failed',
      });
    }
  }

  private async handleLogout(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { token } = call.request;
      const authService = new AuthService();
      await authService.logout(token);
      callback(null, { success: true });
    } catch (error) {
      logger.error('Logout error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Logout failed',
      });
    }
  }

  private async handleValidateToken(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { token } = call.request;
      const authService = new AuthService();
      const result = await authService.validateToken(token);
      callback(null, result);
    } catch (error) {
      logger.error('Token validation error:', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: 'Token validation failed',
      });
    }
  }

  // Score Service handlers
  private async handleCalculateScore(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, data } = call.request;
      const scoreService = new ScoreService();
      const result = await scoreService.calculateScore(userId, data);
      callback(null, result);
    } catch (error) {
      logger.error('Score calculation error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Score calculation failed',
      });
    }
  }

  private async handleGetScore(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;
      const scoreService = new ScoreService();
      const result = await scoreService.getScore(userId);
      callback(null, result);
    } catch (error) {
      logger.error('Get score error:', error);
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Score not found',
      });
    }
  }

  private async handleUpdateScore(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, score, factors } = call.request;
      const scoreService = new ScoreService();
      const result = await scoreService.updateScore(userId, score, factors);
      callback(null, result);
    } catch (error) {
      logger.error('Score update error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Score update failed',
      });
    }
  }

  private async handleGetScoreHistory(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, limit, offset } = call.request;
      const scoreService = new ScoreService();
      const result = await scoreService.getScoreHistory(userId, limit, offset);
      callback(null, result);
    } catch (error) {
      logger.error('Get score history error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get score history',
      });
    }
  }

  // Payment Service handlers
  private async handleProcessPayment(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, amount, method, metadata } = call.request;
      const paymentService = new PaymentService();
      const result = await paymentService.processPayment(userId, amount, method, metadata);
      callback(null, result);
    } catch (error) {
      logger.error('Payment processing error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Payment processing failed',
      });
    }
  }

  private async handleGetPayment(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { paymentId } = call.request;
      const paymentService = new PaymentService();
      const result = await paymentService.getPayment(paymentId);
      callback(null, result);
    } catch (error) {
      logger.error('Get payment error:', error);
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Payment not found',
      });
    }
  }

  private async handleGetPaymentHistory(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, limit, offset } = call.request;
      const paymentService = new PaymentService();
      const result = await paymentService.getPaymentHistory(userId, limit, offset);
      callback(null, result);
    } catch (error) {
      logger.error('Get payment history error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get payment history',
      });
    }
  }

  private async handleCancelPayment(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { paymentId, reason } = call.request;
      const paymentService = new PaymentService();
      const result = await paymentService.cancelPayment(paymentId, reason);
      callback(null, result);
    } catch (error) {
      logger.error('Cancel payment error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Payment cancellation failed',
      });
    }
  }

  // User Service handlers
  private async handleCreateUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userData } = call.request;
      const userService = new UserService();
      const result = await userService.createUser(userData);
      callback(null, result);
    } catch (error) {
      logger.error('Create user error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'User creation failed',
      });
    }
  }

  private async handleGetUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;
      const userService = new UserService();
      const result = await userService.getUser(userId);
      callback(null, result);
    } catch (error) {
      logger.error('Get user error:', error);
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'User not found',
      });
    }
  }

  private async handleUpdateUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, userData } = call.request;
      const userService = new UserService();
      const result = await userService.updateUser(userId, userData);
      callback(null, result);
    } catch (error) {
      logger.error('Update user error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'User update failed',
      });
    }
  }

  private async handleDeleteUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;
      const userService = new UserService();
      const result = await userService.deleteUser(userId);
      callback(null, result);
    } catch (error) {
      logger.error('Delete user error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'User deletion failed',
      });
    }
  }

  // Analytics Service handlers
  private async handleGetAnalytics(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, period } = call.request;
      const analyticsService = new AnalyticsService();
      const result = await analyticsService.getAnalytics(userId, period);
      callback(null, result);
    } catch (error) {
      logger.error('Get analytics error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get analytics',
      });
    }
  }

  private async handleGetMetrics(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, metricType } = call.request;
      const analyticsService = new AnalyticsService();
      const result = await analyticsService.getMetrics(userId, metricType);
      callback(null, result);
    } catch (error) {
      logger.error('Get metrics error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get metrics',
      });
    }
  }

  private async handleGetReports(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, reportType } = call.request;
      const analyticsService = new AnalyticsService();
      const result = await analyticsService.getReports(userId, reportType);
      callback(null, result);
    } catch (error) {
      logger.error('Get reports error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get reports',
      });
    }
  }

  private async handleGenerateReport(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, reportType, parameters } = call.request;
      const analyticsService = new AnalyticsService();
      const result = await analyticsService.generateReport(userId, reportType, parameters);
      callback(null, result);
    } catch (error) {
      logger.error('Generate report error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Report generation failed',
      });
    }
  }

  // Compliance Service handlers
  private async handleCheckCompliance(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, operation } = call.request;
      const complianceService = new ComplianceService();
      const result = await complianceService.checkCompliance(userId, operation);
      callback(null, result);
    } catch (error) {
      logger.error('Compliance check error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Compliance check failed',
      });
    }
  }

  private async handleGetComplianceStatus(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;
      const complianceService = new ComplianceService();
      const result = await complianceService.getComplianceStatus(userId);
      callback(null, result);
    } catch (error) {
      logger.error('Get compliance status error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get compliance status',
      });
    }
  }

  private async handleUpdateCompliance(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, complianceData } = call.request;
      const complianceService = new ComplianceService();
      const result = await complianceService.updateCompliance(userId, complianceData);
      callback(null, result);
    } catch (error) {
      logger.error('Update compliance error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Compliance update failed',
      });
    }
  }

  private async handleGetComplianceHistory(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, limit, offset } = call.request;
      const complianceService = new ComplianceService();
      const result = await complianceService.getComplianceHistory(userId, limit, offset);
      callback(null, result);
    } catch (error) {
      logger.error('Get compliance history error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get compliance history',
      });
    }
  }

  // Notification Service handlers
  private async handleSendNotification(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, type, message, metadata } = call.request;
      const notificationService = new NotificationService();
      const result = await notificationService.sendNotification(userId, type, message, metadata);
      callback(null, result);
    } catch (error) {
      logger.error('Send notification error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Notification sending failed',
      });
    }
  }

  private async handleGetNotifications(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, limit, offset } = call.request;
      const notificationService = new NotificationService();
      const result = await notificationService.getNotifications(userId, limit, offset);
      callback(null, result);
    } catch (error) {
      logger.error('Get notifications error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get notifications',
      });
    }
  }

  private async handleMarkAsRead(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { notificationId } = call.request;
      const notificationService = new NotificationService();
      const result = await notificationService.markAsRead(notificationId);
      callback(null, result);
    } catch (error) {
      logger.error('Mark as read error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to mark notification as read',
      });
    }
  }

  private async handleDeleteNotification(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { notificationId } = call.request;
      const notificationService = new NotificationService();
      const result = await notificationService.deleteNotification(notificationId);
      callback(null, result);
    } catch (error) {
      logger.error('Delete notification error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete notification',
      });
    }
  }

  // Oracle Service handlers
  private async handleGetOracleData(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { dataType, userId } = call.request;
      const oracleService = new OracleService();
      const result = await oracleService.getOracleData(dataType, userId);
      callback(null, result);
    } catch (error) {
      logger.error('Get oracle data error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get oracle data',
      });
    }
  }

  private async handleUpdateOracleData(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { dataType, data, userId } = call.request;
      const oracleService = new OracleService();
      const result = await oracleService.updateOracleData(dataType, data, userId);
      callback(null, result);
    } catch (error) {
      logger.error('Update oracle data error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update oracle data',
      });
    }
  }

  private async handleValidateOracleData(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { dataType, data } = call.request;
      const oracleService = new OracleService();
      const result = await oracleService.validateOracleData(dataType, data);
      callback(null, result);
    } catch (error) {
      logger.error('Validate oracle data error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Oracle data validation failed',
      });
    }
  }

  private async handleGetOracleStatus(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { oracleId } = call.request;
      const oracleService = new OracleService();
      const result = await oracleService.getOracleStatus(oracleId);
      callback(null, result);
    } catch (error) {
      logger.error('Get oracle status error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to get oracle status',
      });
    }
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            logger.error('Failed to start gRPC server:', error);
            reject(error);
            return;
          }

          this.server.start();
          logger.info(`🚀 gRPC server running on port ${port}`);
          resolve();
        }
      );
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.forceShutdown();
      logger.info('gRPC server stopped');
      resolve();
    });
  }
}

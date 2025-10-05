export { DatabaseAdapter } from './database';
export { BlockchainAdapter } from './blockchain';
export { NotificationAdapter } from './notification';
export { AnalyticsAdapter } from './analytics';
export { VoiceAdapter } from './voice';
export { ChatAdapter } from './chat';

export type { DatabaseConfig, QueryResult } from './database';
export type { BlockchainConfig, TransactionResult, CreditScoreData, PaymentData } from './blockchain';
export type { NotificationData, NotificationTemplate } from './notification';
export type { AnalyticsEvent, UserBehavior, AnalyticsQuery } from './analytics';
export type { VoiceConfig, SpeechResult, TranscriptionResult } from './voice';
export type { ChatMessage, ChatSession, ChatConfig } from './chat';

import mongoose, { Schema, Document } from 'mongoose';

export interface IAIConversation extends Document {
  userId: string;
  agentName: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  sentimentAnalysis?: {
    overall: string;
    confidence: number;
    emotions: string[];
  };
  topics: string[];
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

const SentimentAnalysisSchema = new Schema({
  overall: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  emotions: [{
    type: String,
  }],
});

const AIConversationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  agentName: {
    type: String,
    required: true,
    index: true,
  },
  messages: [MessageSchema],
  sentimentAnalysis: SentimentAnalysisSchema,
  topics: [{
    type: String,
  }],
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
AIConversationSchema.index({ userId: 1, createdAt: -1 });
AIConversationSchema.index({ agentName: 1, createdAt: -1 });
AIConversationSchema.index({ sessionId: 1 });
AIConversationSchema.index({ 'sentimentAnalysis.overall': 1 });
AIConversationSchema.index({ topics: 1 });

// TTL index to automatically delete old conversations after 1 year
AIConversationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
export default AIConversation;

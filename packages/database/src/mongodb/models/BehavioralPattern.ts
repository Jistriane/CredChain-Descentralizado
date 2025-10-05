import mongoose, { Schema, Document } from 'mongoose';

export interface IBehavioralPattern extends Document {
  userId: string;
  paymentPatterns: {
    avgDaysBeforeDue: number;
    consistencyScore: number;
    seasonalTrends: {
      month: number;
      avgAmount: number;
      frequency: number;
    }[];
    preferredPaymentMethods: string[];
    paymentTimeDistribution: {
      hour: number;
      frequency: number;
    }[];
  };
  riskIndicators: string[];
  mlPredictions: {
    defaultProbability: number;
    creditUtilizationTrend: string;
    paymentBehaviorScore: number;
    nextPaymentPrediction: Date;
  };
  behavioralScore: number;
  lastUpdated: Date;
  createdAt: Date;
}

const SeasonalTrendSchema = new Schema({
  month: {
    type: Number,
    min: 1,
    max: 12,
    required: true,
  },
  avgAmount: {
    type: Number,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
  },
});

const PaymentTimeDistributionSchema = new Schema({
  hour: {
    type: Number,
    min: 0,
    max: 23,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
  },
});

const PaymentPatternsSchema = new Schema({
  avgDaysBeforeDue: {
    type: Number,
    required: true,
  },
  consistencyScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  seasonalTrends: [SeasonalTrendSchema],
  preferredPaymentMethods: [{
    type: String,
  }],
  paymentTimeDistribution: [PaymentTimeDistributionSchema],
});

const MLPredictionsSchema = new Schema({
  defaultProbability: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  creditUtilizationTrend: {
    type: String,
    enum: ['increasing', 'decreasing', 'stable'],
    required: true,
  },
  paymentBehaviorScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  nextPaymentPrediction: {
    type: Date,
    required: true,
  },
});

const BehavioralPatternSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  paymentPatterns: PaymentPatternsSchema,
  riskIndicators: [{
    type: String,
  }],
  mlPredictions: MLPredictionsSchema,
  behavioralScore: {
    type: Number,
    min: 0,
    max: 1000,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
BehavioralPatternSchema.index({ userId: 1 });
BehavioralPatternSchema.index({ behavioralScore: -1 });
BehavioralPatternSchema.index({ 'mlPredictions.defaultProbability': 1 });
BehavioralPatternSchema.index({ lastUpdated: -1 });

// TTL index to automatically delete old patterns after 2 years
BehavioralPatternSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export const BehavioralPattern = mongoose.model<IBehavioralPattern>('BehavioralPattern', BehavioralPatternSchema);
export default BehavioralPattern;

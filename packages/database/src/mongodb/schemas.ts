import { Schema, model, Document } from 'mongoose';

export interface IDiagnosticRequest extends Document {
  userId: string;
  farmId?: string;
  type: 'crop' | 'livestock' | 'soil';
  images: string[];
  description?: string;
  symptoms?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface IDiagnosticResult extends Document {
  requestId: string;
  confidence: number;
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatmentOptions?: {
    name: string;
    description: string;
    products?: string[];
    cost?: number;
    duration?: string;
    effectiveness: number;
  }[];
  followUpRequired: boolean;
  processedAt: Date;
  modelVersion: string;
}

const DiagnosticRequestSchema = new Schema<IDiagnosticRequest>({
  userId: { type: String, required: true },
  farmId: { type: String },
  type: { type: String, enum: ['crop', 'livestock', 'soil'], required: true },
  images: [{ type: String }],
  description: { type: String },
  symptoms: [{ type: String }],
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

const DiagnosticResultSchema = new Schema<IDiagnosticResult>({
  requestId: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  diagnosis: { type: String, required: true },
  recommendations: [{ type: String }],
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  treatmentOptions: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    products: [{ type: String }],
    cost: { type: Number },
    duration: { type: String },
    effectiveness: { type: Number, min: 0, max: 1 }
  }],
  followUpRequired: { type: Boolean, default: false },
  processedAt: { type: Date, default: Date.now },
  modelVersion: { type: String, required: true }
});

export const DiagnosticRequest = model<IDiagnosticRequest>('DiagnosticRequest', DiagnosticRequestSchema);
export const DiagnosticResult = model<IDiagnosticResult>('DiagnosticResult', DiagnosticResultSchema);

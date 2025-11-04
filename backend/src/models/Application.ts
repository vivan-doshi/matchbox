import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IApplication extends Document {
  project: Types.ObjectId;
  user: Types.ObjectId;
  role: string;
  message: string;
  fitScore: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
    },
    message: {
      type: String,
      maxlength: 500,
    },
    fitScore: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
ApplicationSchema.index({ project: 1, user: 1, role: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);

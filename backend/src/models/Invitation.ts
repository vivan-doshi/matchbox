import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInvitation extends Document {
  project: Types.ObjectId;
  inviter: Types.ObjectId;
  invitee: Types.ObjectId;
  role?: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    declineReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate invitations
InvitationSchema.index({ project: 1, invitee: 1 }, { unique: true });

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);

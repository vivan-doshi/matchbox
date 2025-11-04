import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatch extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  approvedByUser1: boolean;
  approvedByUser2: boolean;
  isBoxed: boolean;
  project?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedByUser1: {
      type: Boolean,
      default: false,
    },
    approvedByUser2: {
      type: Boolean,
      default: false,
    },
    isBoxed: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique matches (regardless of order)
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Update isBoxed when both approve
MatchSchema.pre('save', function (next) {
  if (this.approvedByUser1 && this.approvedByUser2) {
    this.isBoxed = true;
  }
  next();
});

export default mongoose.model<IMatch>('Match', MatchSchema);

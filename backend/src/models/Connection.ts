import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConnection extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Blocked';
  requestMessage?: string;
  declineReason?: string;
  connectionContext?: {
    sharedInterests?: string[];
    sharedSkills?: string[];
    mutualConnections?: number;
    fromProject?: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Blocked'],
      default: 'Pending',
      required: true,
      index: true,
    },
    requestMessage: {
      type: String,
      maxlength: 300,
    },
    declineReason: {
      type: String,
      maxlength: 200,
    },
    connectionContext: {
      sharedInterests: [String],
      sharedSkills: [String],
      mutualConnections: Number,
      fromProject: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
      },
    },
    acceptedAt: Date,
    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connection requests
ConnectionSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

// Index for querying pending requests received by a user
ConnectionSchema.index({ recipient: 1, status: 1 });

// Index for querying requests sent by a user
ConnectionSchema.index({ requester: 1, status: 1 });

// Index for recent connections
ConnectionSchema.index({ status: 1, acceptedAt: -1 });

// Virtual to check if connection is mutual (accepted)
ConnectionSchema.virtual('isMutual').get(function () {
  return this.status === 'Accepted';
});

// Method to get all connections for a user (both as requester and recipient)
ConnectionSchema.statics.getUserConnections = async function (
  userId: string,
  status: string = 'Accepted'
) {
  return this.find({
    $or: [
      { requester: userId, status },
      { recipient: userId, status },
    ],
  })
    .populate('requester', 'firstName lastName email profilePicture university major')
    .populate('recipient', 'firstName lastName email profilePicture university major')
    .sort('-acceptedAt');
};

// Method to get mutual connections between two users
ConnectionSchema.statics.getMutualConnections = async function (
  user1Id: string,
  user2Id: string
) {
  const user1Connections = await this.find({
    $or: [
      { requester: user1Id, status: 'Accepted' },
      { recipient: user1Id, status: 'Accepted' },
    ],
  }).select('requester recipient');

  const user1ConnectionIds = user1Connections.map((conn) =>
    conn.requester.toString() === user1Id
      ? conn.recipient.toString()
      : conn.requester.toString()
  );

  const mutualConnections = await this.find({
    $or: [
      { requester: user2Id, recipient: { $in: user1ConnectionIds }, status: 'Accepted' },
      { recipient: user2Id, requester: { $in: user1ConnectionIds }, status: 'Accepted' },
    ],
  })
    .populate('requester', 'firstName lastName profilePicture')
    .populate('recipient', 'firstName lastName profilePicture');

  return mutualConnections.map((conn) =>
    conn.requester._id.toString() === user2Id ? conn.recipient : conn.requester
  );
};

// Method to check connection status between two users
ConnectionSchema.statics.getConnectionStatus = async function (
  user1Id: string,
  user2Id: string
) {
  const connection = await this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id },
    ],
  });

  if (!connection) {
    return { exists: false, status: null, isSent: false, isReceived: false };
  }

  return {
    exists: true,
    status: connection.status,
    isSent: connection.requester.toString() === user1Id,
    isReceived: connection.recipient.toString() === user1Id,
    connection,
  };
};

// Pre-save middleware to set acceptedAt/rejectedAt
ConnectionSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Accepted' && !this.acceptedAt) {
      this.acceptedAt = new Date();
    } else if (this.status === 'Rejected' && !this.rejectedAt) {
      this.rejectedAt = new Date();
    }
  }
  next();
});

const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);

export default Connection;

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage {
  sender: Types.ObjectId;
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface IChat extends Document {
  participants: Types.ObjectId[];
  messages: IMessage[];
  lastMessage?: {
    text: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
  type: 'direct' | 'invitation' | 'application';
  relatedProject?: Types.ObjectId;
  relatedInvitation?: Types.ObjectId;
  relatedApplication?: Types.ObjectId;
  status?: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [MessageSchema],
    lastMessage: {
      text: String,
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: Date,
    },
    type: {
      type: String,
      enum: ['direct', 'invitation', 'application'],
      default: 'direct',
    },
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    relatedInvitation: {
      type: Schema.Types.ObjectId,
      ref: 'Invitation',
    },
    relatedApplication: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
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

// Update lastMessage before saving
ChatSchema.pre('save', function (next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      text: lastMsg.text,
      sender: lastMsg.sender,
      createdAt: lastMsg.createdAt,
    };
  }
  next();
});

export default mongoose.model<IChat>('Chat', ChatSchema);

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGroupMessage {
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IGroup extends Document {
  name: string;
  members: Types.ObjectId[];
  project?: Types.ObjectId;
  messages: IGroupMessage[];
  lastMessage?: {
    text: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageSchema = new Schema<IGroupMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    messages: [GroupMessageSchema],
    lastMessage: {
      text: String,
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastMessage before saving
GroupSchema.pre('save', function (next) {
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

export default mongoose.model<IGroup>('Group', GroupSchema);

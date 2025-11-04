import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRole {
  title: string;
  description: string;
  filled: boolean;
  user?: Types.ObjectId;
}

export interface IProject extends Document {
  title: string;
  description: string;
  creator: Types.ObjectId;
  tags: string[];
  status: 'Planning' | 'In Progress' | 'Completed';
  roles: IRole[];
  startDate?: Date;
  deadline?: Date;
  githubRepo?: string;
  mediumArticle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  filled: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed'],
      default: 'Planning',
    },
    roles: [RoleSchema],
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    githubRepo: {
      type: String,
    },
    mediumArticle: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
ProjectSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProject>('Project', ProjectSchema);

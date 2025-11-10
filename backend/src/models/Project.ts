import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRole {
  title: string;
  description: string;
  filled: boolean;
  user?: Types.ObjectId;
}

export interface ICreatorRole {
  title: string;
  responsibilities?: string;
  expertise?: string;
}

export interface ITeamMember {
  name: string;
  profileLink?: string;
  role: string;
  description?: string;
}

export interface IProject extends Document {
  title: string;
  description: string;
  creator: Types.ObjectId;
  category: string;
  tags?: string[];
  timeCommitment?: string;
  duration?: number;
  status: 'Planning' | 'In Progress' | 'Completed';
  roles: IRole[];
  creatorRole?: ICreatorRole;
  existingMembers?: ITeamMember[];
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

const CreatorRoleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  responsibilities: String,
  expertise: String,
});

const TeamMemberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  profileLink: String,
  role: {
    type: String,
    required: true,
  },
  description: String,
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Tech', 'Design', 'Business', 'Marketing', 'Case Competitions', 'Hackathons'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    timeCommitment: {
      type: String,
    },
    duration: {
      type: Number,
      min: 1,
      max: 52,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed'],
      default: 'Planning',
    },
    roles: [RoleSchema],
    creatorRole: CreatorRoleSchema,
    existingMembers: [TeamMemberSchema],
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
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for search
ProjectSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

export default mongoose.model<IProject>('Project', ProjectSchema);

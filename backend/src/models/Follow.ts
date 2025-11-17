import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate follows
FollowSchema.index(
  { follower: 1, following: 1 },
  { unique: true }
);

// Index for getting all followers of a user
FollowSchema.index({ following: 1, createdAt: -1 });

// Index for getting all users a user follows
FollowSchema.index({ follower: 1, createdAt: -1 });

// Static method to check if user1 follows user2
FollowSchema.statics.isFollowing = async function (
  followerId: string,
  followingId: string
): Promise<boolean> {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
  });
  return !!follow;
};

// Static method to check if two users follow each other (bidirectional)
FollowSchema.statics.isFollowingEachOther = async function (
  user1Id: string,
  user2Id: string
): Promise<boolean> {
  const follow1 = await this.findOne({
    follower: user1Id,
    following: user2Id,
  });
  const follow2 = await this.findOne({
    follower: user2Id,
    following: user1Id,
  });
  return !!(follow1 && follow2);
};

// Static method to get all followers of a user
FollowSchema.statics.getFollowers = async function (userId: string) {
  return this.find({ following: userId })
    .populate('follower', 'firstName lastName email profilePicture university major bio')
    .sort('-createdAt');
};

// Static method to get all users a user follows
FollowSchema.statics.getFollowing = async function (userId: string) {
  return this.find({ follower: userId })
    .populate('following', 'firstName lastName email profilePicture university major bio')
    .sort('-createdAt');
};

// Static method to get follow status between two users
FollowSchema.statics.getFollowStatus = async function (
  currentUserId: string,
  targetUserId: string
) {
  const isFollowing = await this.isFollowing(currentUserId, targetUserId);
  const isFollower = await this.isFollowing(targetUserId, currentUserId);
  const isMutual = isFollowing && isFollower;

  return {
    isFollowing,
    isFollower,
    isMutual,
  };
};

// Static method to get follower/following counts
FollowSchema.statics.getCounts = async function (userId: string) {
  const [followersCount, followingCount] = await Promise.all([
    this.countDocuments({ following: userId }),
    this.countDocuments({ follower: userId }),
  ]);

  const mutualFollows = await this.find({
    follower: userId,
  }).then(async (following) => {
    const followingIds = following.map((f) => f.following.toString());
    return this.countDocuments({
      follower: { $in: followingIds },
      following: userId,
    });
  });

  return {
    followers: followersCount,
    following: followingCount,
    mutualFollows,
  };
};

// Pre-save validation: prevent self-following
FollowSchema.pre('save', function (next) {
  if (this.follower.toString() === this.following.toString()) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

const Follow = mongoose.model<IFollow>('Follow', FollowSchema);

export default Follow;

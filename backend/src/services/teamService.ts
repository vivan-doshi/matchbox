import Team, { ITeam, IDeliverable } from '../models/Team';
import Competition from '../models/Competition';
import User from '../models/User';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper';

class TeamService {
  /**
   * Create a new team for a competition
   */
  async createTeam(
    competitionId: mongoose.Types.ObjectId,
    leaderId: mongoose.Types.ObjectId,
    leaderName: string,
    leaderEmail: string,
    teamData: { name: string; description: string }
  ): Promise<ITeam> {
    // Verify competition exists and is accepting teams
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    if (competition.status === 'closed' || competition.status === 'archived') {
      throw new Error('Competition is not accepting new teams');
    }

    // Check if max teams limit reached
    if (competition.maxTeams) {
      const currentTeamCount = await Team.countDocuments({ competitionId });
      if (currentTeamCount >= competition.maxTeams) {
        throw new Error('Competition has reached maximum team capacity');
      }
    }

    // Check if user already in a team for this competition
    const isAlreadyInTeam = await (Team as any).isUserInCompetitionTeam(
      leaderId,
      competitionId
    );

    if (isAlreadyInTeam) {
      throw new Error('You are already part of a team in this competition');
    }

    // Create team with leader as first member
    const team = await Team.create({
      competitionId,
      ...teamData,
      leaderId,
      maxMembers: competition.maxTeamSize,
      members: [
        {
          userId: leaderId,
          name: leaderName,
          email: leaderEmail,
          role: 'leader',
          joinedAt: new Date(),
          status: 'active',
        },
      ],
      status: 'forming',
    });

    // Update user's participatedTeams
    await User.findByIdAndUpdate(leaderId, {
      $push: { participatedTeams: team._id },
    });

    // Update competition team count
    await Competition.findByIdAndUpdate(competitionId, {
      $inc: { registeredTeamCount: 1, totalParticipants: 1 },
    });

    return team;
  }

  /**
   * Get all teams for a competition
   */
  async getTeamsByCompetition(
    competitionId: mongoose.Types.ObjectId
  ): Promise<ITeam[]> {
    return Team.find({ competitionId })
      .populate('members.userId', 'firstName lastName email profilePicture')
      .sort({ currentProgress: -1, createdAt: -1 });
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: mongoose.Types.ObjectId): Promise<ITeam | null> {
    return Team.findById(teamId).populate(
      'members.userId',
      'firstName lastName email profilePicture skills'
    );
  }

  /**
   * Invite user to team
   */
  async inviteToTeam(
    teamId: mongoose.Types.ObjectId,
    email: string,
    invitedById: mongoose.Types.ObjectId
  ): Promise<void> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    if (team.isFull) {
      throw new Error('Team is already full');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User with this email not found');
    }

    // Check if user already in this team
    const isAlreadyMember = team.members.some(
      (m) => m.userId.toString() === user._id.toString() && m.status === 'active'
    );

    if (isAlreadyMember) {
      throw new Error('User is already a member of this team');
    }

    // Check if user already in another team for this competition
    const isInOtherTeam = await (Team as any).isUserInCompetitionTeam(
      user._id,
      team.competitionId
    );

    if (isInOtherTeam) {
      throw new Error('User is already part of another team in this competition');
    }

    // Send notification (invitation logic would be implemented here)
    await createNotification({
      user: user._id,
      type: 'team_invitation',
      title: 'Team Invitation',
      message: `You've been invited to join team "${team.name}"`,
      actionUrl: `/competitions/${team.competitionId}/teams/${team._id}/accept-invite`,
      metadata: {
        teamId: team._id,
        competitionId: team.competitionId,
        invitedBy: invitedById,
      },
    });
  }

  /**
   * Accept team invitation
   */
  async acceptTeamInvitation(
    teamId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    userName: string,
    userEmail: string
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Add member to team
    await (team as any).addMember(userId, userName, userEmail, 'member');

    // Update user's participatedTeams
    await User.findByIdAndUpdate(userId, {
      $push: { participatedTeams: team._id },
    });

    // Update competition participant count
    await Competition.findByIdAndUpdate(team.competitionId, {
      $inc: { totalParticipants: 1 },
    });

    // Notify all team members
    for (const member of team.members) {
      if (member.userId.toString() !== userId.toString()) {
        await createNotification({
          user: member.userId,
          type: 'team_update',
          title: 'New Team Member',
          message: `${userName} has joined your team`,
          actionUrl: `/competitions/${team.competitionId}/team/${team._id}`,
        });
      }
    }

    return team;
  }

  /**
   * Remove member from team
   */
  async removeMember(
    teamId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    await (team as any).removeMember(userId);

    // Update competition participant count
    await Competition.findByIdAndUpdate(team.competitionId, {
      $inc: { totalParticipants: -1 },
    });

    return team;
  }

  /**
   * Update team progress
   */
  async updateProgress(
    teamId: mongoose.Types.ObjectId,
    progressPercentage: number,
    comment: string,
    updatedBy: mongoose.Types.ObjectId,
    updatedByName: string
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    await (team as any).updateProgress(
      progressPercentage,
      comment,
      updatedBy,
      updatedByName
    );

    // Recalculate competition average progress
    const allTeams = await Team.find({ competitionId: team.competitionId });
    const averageProgress =
      allTeams.reduce((sum, t) => sum + t.currentProgress, 0) / allTeams.length;

    await Competition.findByIdAndUpdate(team.competitionId, {
      averageProgress: Math.round(averageProgress),
    });

    // Notify team members
    for (const member of team.members) {
      if (
        member.userId.toString() !== updatedBy.toString() &&
        member.status === 'active'
      ) {
        await createNotification({
          user: member.userId,
          type: 'team_update',
          title: 'Team Progress Updated',
          message: `${updatedByName} updated team progress to ${progressPercentage}%`,
          actionUrl: `/competitions/${team.competitionId}/team/${team._id}`,
        });
      }
    }

    return team;
  }

  /**
   * Achieve milestone
   */
  async achieveMilestone(
    teamId: mongoose.Types.ObjectId,
    milestoneId: mongoose.Types.ObjectId,
    comment: string,
    deliverables: IDeliverable[] = []
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify milestone exists in competition
    const competition = await Competition.findById(team.competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    const milestone = competition.milestones.find(
      (m) => m._id.toString() === milestoneId.toString()
    );

    if (!milestone) {
      throw new Error('Milestone not found in competition');
    }

    await (team as any).achieveMilestone(milestoneId, comment, deliverables);

    // Notify competition host
    await createNotification({
      user: competition.hostId,
      type: 'milestone_achieved',
      title: 'Milestone Achieved',
      message: `Team "${team.name}" achieved milestone "${milestone.title}"`,
      actionUrl: `/competitions/${competition._id}/manage`,
      metadata: {
        teamId: team._id,
        milestoneId: milestone._id,
      },
    });

    return team;
  }

  /**
   * Submit final deliverables
   */
  async submitFinal(
    teamId: mongoose.Types.ObjectId,
    deliverables: IDeliverable[],
    teamSummary: string,
    contributionBreakdown: { userId: mongoose.Types.ObjectId; percentage: number }[]
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validate contribution breakdown sums to 100%
    const totalPercentage = contributionBreakdown.reduce(
      (sum, cb) => sum + cb.percentage,
      0
    );

    if (totalPercentage !== 100) {
      throw new Error('Contribution percentages must sum to 100%');
    }

    // Validate all team members are in contribution breakdown
    const teamMemberIds = team.members
      .filter((m) => m.status === 'active')
      .map((m) => m.userId.toString());

    const breakdownUserIds = contributionBreakdown.map((cb) =>
      cb.userId.toString()
    );

    for (const memberId of teamMemberIds) {
      if (!breakdownUserIds.includes(memberId)) {
        throw new Error('All team members must be included in contribution breakdown');
      }
    }

    await (team as any).submitFinal(
      deliverables,
      teamSummary,
      contributionBreakdown
    );

    // Notify competition host
    const competition = await Competition.findById(team.competitionId);
    if (competition) {
      await createNotification({
        user: competition.hostId,
        type: 'submission_received',
        title: 'Final Submission Received',
        message: `Team "${team.name}" has submitted their final deliverables`,
        actionUrl: `/competitions/${competition._id}/manage`,
        metadata: {
          teamId: team._id,
        },
      });
    }

    // Notify all team members
    for (const member of team.members.filter((m) => m.status === 'active')) {
      await createNotification({
        user: member.userId,
        type: 'team_update',
        title: 'Final Submission Complete',
        message: `Your team has successfully submitted the final deliverables`,
        actionUrl: `/competitions/${team.competitionId}/team/${team._id}`,
      });
    }

    return team;
  }

  /**
   * Get teams by user
   */
  async getTeamsByUser(
    userId: mongoose.Types.ObjectId
  ): Promise<ITeam[]> {
    return (Team as any).getTeamsByUser(userId);
  }

  /**
   * Verify milestone (host only)
   */
  async verifyMilestone(
    teamId: mongoose.Types.ObjectId,
    milestoneId: mongoose.Types.ObjectId,
    verified: boolean,
    feedback?: string
  ): Promise<ITeam> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const achievedMilestone = team.achievedMilestones.find(
      (am) => am.milestoneId.toString() === milestoneId.toString()
    );

    if (!achievedMilestone) {
      throw new Error('Milestone not achieved by team yet');
    }

    achievedMilestone.verificationFeedback = feedback;

    await team.save();

    return team;
  }
}

export default new TeamService();

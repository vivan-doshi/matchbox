import React from 'react';
import { MessageSquareIcon, TrashIcon } from 'lucide-react';
type TeamMember = {
  id: string;
  name: string;
  role: string;
  university: string;
  profilePic: string;
  status: string;
  joinedAt: string;
};
interface ProjectTeamTableProps {
  teamMembers: TeamMember[];
}
const ProjectTeamTable: React.FC<ProjectTeamTableProps> = ({
  teamMembers
}) => {
  return <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 rounded-lg">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Team Member
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {teamMembers.map(member => <tr key={member.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <img className="h-8 w-8 rounded-full" src={member.profilePic} alt={member.name} />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-900">
                      {member.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {member.university}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{member.role}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {member.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {member.joinedAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                    <MessageSquareIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
};
export default ProjectTeamTable;
import { LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  title: string;
  onLogout: () => void;
}

const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    head: 'Head',
    hr_assistant: 'HR Assistant',
    class_moderator: 'Class Monitor',
    teacher: 'Professor',
    staff: 'Staff Office'
  };
  return roleLabels[role] || role;
};

const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500',
    head: 'bg-blue-500',
    hr_assistant: 'bg-green-500',
    class_moderator: 'bg-yellow-500',
    teacher: 'bg-indigo-500',
    staff: 'bg-pink-500'
  };
  return roleColors[role] || 'bg-gray-500';
};

export default function Header({ user, title, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white`}>
              <UserIcon size={20} />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{getRoleLabel(user.role)}</p>
              <p className="text-xs text-gray-500">{user.name}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

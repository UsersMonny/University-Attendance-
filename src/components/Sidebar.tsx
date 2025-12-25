import { Users, BookOpen, Settings, LayoutDashboard, Calendar, ClipboardList, FileCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['admin', 'head', 'hr_assistant', 'class_moderator', 'teacher', 'staff']
  },
  {
    path: '/users',
    label: 'User Management',
    icon: <Users size={20} />,
    roles: ['admin']
  },
  {
    path: '/academic-setup',
    label: 'Academic Setup',
    icon: <BookOpen size={20} />,
    roles: ['admin']
  },
  {
    path: '/configuration',
    label: 'Configuration',
    icon: <Settings size={20} />,
    roles: ['admin']
  },
  {
    path: '/leave-requests',
    label: 'Leave Requests',
    icon: <Calendar size={20} />,
    roles: ['head', 'teacher', 'staff']
  },
  {
    path: '/attendance',
    label: 'Attendance',
    icon: <ClipboardList size={20} />,
    roles: ['head', 'hr_assistant', 'class_moderator', 'teacher', 'staff']
  },
  {
    path: '/check-attendance',
    label: 'Check Attendance',
    icon: <FileCheck size={20} />,
    roles: ['hr_assistant', 'class_moderator']
  }
];

export default function Sidebar({ user, currentPath, onNavigate }: SidebarProps) {
  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 bg-[#1e293b] min-h-screen text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">University Attendance System</h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p>Version 1.0</p>
          <p className="mt-1">© 2025 University</p>
        </div>
      </div>
    </div>
  );
}

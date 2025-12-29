import { useState } from 'react';
import { Users, BookOpen, Settings, LayoutDashboard, Calendar, ClipboardList, FileCheck, ChevronDown, ChevronRight, GraduationCap, Clock, Building2, BookMarked, Library } from 'lucide-react';
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

interface NavItemWithSubmenu {
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  subItems: NavItem[];
}

type NavElement = NavItem | NavItemWithSubmenu;

const isNavItemWithSubmenu = (item: NavElement): item is NavItemWithSubmenu => {
  return 'subItems' in item;
};

const navItems: NavElement[] = [
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
    label: 'Academic',
    icon: <BookOpen size={20} />,
    roles: ['admin'],
    subItems: [
      {
        path: '/academic/class',
        label: 'Class',
        icon: <GraduationCap size={18} />,
        roles: ['admin']
      },
      {
        path: '/academic/schedule',
        label: 'Schedule',
        icon: <Clock size={18} />,
        roles: ['admin']
      }
    ]
  },
  {
    label: 'Configuration',
    icon: <Settings size={20} />,
    roles: ['admin'],
    subItems: [
      {
        path: '/configuration/department',
        label: 'Department',
        icon: <Building2 size={18} />,
        roles: ['admin']
      },
      {
        path: '/configuration/major',
        label: 'Major',
        icon: <BookMarked size={18} />,
        roles: ['admin']
      },
      {
        path: '/configuration/subject',
        label: 'Subject',
        icon: <Library size={18} />,
        roles: ['admin']
      }
    ]
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Academic', 'Configuration']);

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  };

  const isSubItemActive = (item: NavItemWithSubmenu) => {
    return item.subItems.some(sub => currentPath === sub.path);
  };

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
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            if (isNavItemWithSubmenu(item)) {
              const isExpanded = expandedMenus.includes(item.label);
              const isActive = isSubItemActive(item);
              
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.subItems
                        .filter(sub => sub.roles.includes(user.role))
                        .map(subItem => (
                          <li key={subItem.path}>
                            <button
                              onClick={() => onNavigate(subItem.path)}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                currentPath === subItem.path
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              {subItem.icon}
                              <span className="text-sm">{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              );
            } else {
              return (
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
              );
            }
          })}
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

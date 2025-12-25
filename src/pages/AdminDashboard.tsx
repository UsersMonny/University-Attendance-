import { useEffect, useState } from 'react';
import { Users, BookOpen, Building2, GraduationCap } from 'lucide-react';
import { userService } from '../services/userService';
import { classService } from '../services/classService';
import { departmentService } from '../services/departmentService';
import { majorService } from '../services/majorService';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-xl p-6 text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function QuickAction({ title, icon, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-xl p-6 hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-3 min-h-[120px]`}
    >
      {icon}
      <span className="font-semibold">{title}</span>
    </button>
  );
}

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    majors: 0,
    classes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, departments, majors, classes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        majorService.getAll(),
        classService.getAll()
      ]);

      setStats({
        users: users.length,
        departments: departments.length,
        majors: majors.length,
        classes: classes.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={<Users size={32} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Majors"
          value={stats.majors}
          icon={<GraduationCap size={32} />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Classes"
          value={stats.classes}
          icon={<BookOpen size={32} />}
          color="bg-pink-500"
        />
        <StatCard
          title="Total Departments"
          value={stats.departments}
          icon={<Building2 size={32} />}
          color="bg-purple-500"
        />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Add User"
            icon={<Users size={32} />}
            color="bg-blue-500"
            onClick={() => onNavigate('/users')}
          />
          <QuickAction
            title="Academic Setup"
            icon={<BookOpen size={32} />}
            color="bg-green-500"
            onClick={() => onNavigate('/academic-setup')}
          />
          <QuickAction
            title="Configuration"
            icon={<Building2 size={32} />}
            color="bg-purple-500"
            onClick={() => onNavigate('/configuration')}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Departments</span>
            <span className="font-semibold text-gray-800">{stats.departments}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Majors</span>
            <span className="font-semibold text-gray-800">{stats.majors}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Staff</span>
            <span className="font-semibold text-gray-800">{stats.users}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Class Moderators</span>
            <span className="font-semibold text-gray-800">0</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Total Subjects</span>
            <span className="font-semibold text-gray-800">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

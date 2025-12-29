import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { User } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import HeadDashboard from './pages/HeadDashboard';
import HRAssistantDashboard from './pages/HRAssistantDashboard';
import ClassMonitorDashboard from './pages/ClassMonitorDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserManagement from './pages/UserManagement';
import AcademicSetup from './pages/AcademicSetup';
import Configuration from './pages/Configuration';
import Major from './pages/Major';
import SubjectPage from './pages/Subject';
import Schedule from './pages/Schedule';
import LeaveRequestManagement from './pages/LeaveRequestManagement';
import AttendanceView from './pages/AttendanceView';
import LeaveRequest from './pages/LeaveRequest';
import CheckAttendance from './pages/CheckAttendance';

type PageType =
  | 'dashboard'
  | 'users'
  | 'academic/class'
  | 'academic/schedule'
  | 'configuration/department'
  | 'configuration/major'
  | 'configuration/subject'
  | 'leave-requests'
  | 'attendance'
  | 'check-attendance';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogin = async (uniqueId: string, password: string) => {
    const user = await authService.login(uniqueId, password);
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (path: string) => {
    const page = path.replace('/', '') as PageType;
    setCurrentPage(page || 'dashboard');
  };

  const getPageTitle = (): string => {
    const titles: Record<PageType, string> = {
      dashboard: 'Dashboard',
      users: 'User Management',
      'academic/class': 'Class Management',
      'academic/schedule': 'Schedule Management',
      'configuration/department': 'Department Management',
      'configuration/major': 'Major Management',
      'configuration/subject': 'Subject Management',
      'leave-requests': 'Leave Requests',
      attendance: 'Attendance',
      'check-attendance': 'Check Attendance'
    };
    return titles[currentPage] || 'Dashboard';
  };

  const renderPage = () => {
    if (!currentUser) return null;

    switch (currentPage) {
      case 'dashboard':
        if (currentUser.role === 'admin') {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        if (currentUser.role === 'head') {
          return <HeadDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        }
        if (currentUser.role === 'hr_assistant') {
          return <HRAssistantDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        }
        if (currentUser.role === 'class_moderator') {
          return <ClassMonitorDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        }
        if (currentUser.role === 'teacher' || currentUser.role === 'staff') {
          return <EmployeeDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        }
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome, {currentUser.name}
              </h2>
              <p className="text-gray-600">
                Use the sidebar to navigate through the system.
              </p>
            </div>
          </div>
        );

      case 'users':
        if (currentUser.role === 'admin') {
          return <UserManagement />;
        }
        break;

      case 'academic/class':
        if (currentUser.role === 'admin') {
          return <AcademicSetup />;
        }
        break;

      case 'academic/schedule':
        if (currentUser.role === 'admin') {
          return <Schedule />;
        }
        break;

      case 'configuration/department':
        if (currentUser.role === 'admin') {
          return <Configuration />;
        }
        break;

      case 'configuration/major':
        if (currentUser.role === 'admin') {
          return <Major />;
        }
        break;

      case 'configuration/subject':
        if (currentUser.role === 'admin') {
          return <SubjectPage />;
        }
        break;

      case 'leave-requests':
        if (currentUser.role === 'head') {
          return <LeaveRequestManagement currentUser={currentUser} />;
        } else if (currentUser.role === 'teacher' || currentUser.role === 'staff') {
          return <LeaveRequest currentUser={currentUser} />;
        }
        break;

      case 'attendance':
        if (currentUser.role === 'head') {
          return <AttendanceView currentUser={currentUser} viewOwnOnly={false} />;
        } else if (currentUser.role === 'teacher' || currentUser.role === 'staff') {
          return <AttendanceView currentUser={currentUser} viewOwnOnly={true} />;
        }
        break;

      case 'check-attendance':
        if (currentUser.role === 'hr_assistant' || currentUser.role === 'class_moderator') {
          return <CheckAttendance currentUser={currentUser} />;
        }
        break;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Page not found</p>
          </div>
        );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don't have access to this page</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      user={currentUser}
      title={getPageTitle()}
      currentPath={`/${currentPage}`}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;

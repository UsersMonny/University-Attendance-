import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { userService } from '../services/userService';
import { User, Attendance } from '../types';

interface ClassMonitorDashboardProps {
  currentUser: User;
  onNavigate: (path: string) => void;
}

export default function ClassMonitorDashboard({ currentUser, onNavigate }: ClassMonitorDashboardProps) {
  const [stats, setStats] = useState({
    totalProfessors: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  });
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [professorUsers, setProfessorUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [professorList, todayAttendanceData] = await Promise.all([
        userService.getByRole('teacher'),
        attendanceService.getByDate(today)
      ]);

      const professorMap: Record<number, User> = {};
      professorList.forEach(user => {
        professorMap[user.id] = user;
      });

      const presentCount = todayAttendanceData.filter(a => a.status === 'present').length;
      const absentCount = todayAttendanceData.filter(a => a.status === 'absent').length;
      const lateCount = todayAttendanceData.filter(a => a.status === 'late').length;
      const attendanceRate = professorList.length > 0 ? Math.round((presentCount / professorList.length) * 100) : 0;

      setStats({
        totalProfessors: professorList.length,
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount,
        attendanceRate
      });

      setTodayAttendance(todayAttendanceData.slice(0, 8));
      setProfessorUsers(professorMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Professors</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalProfessors}</h3>
            </div>
            <Users className="text-indigo-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Present Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.presentToday}</h3>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Absent Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.absentToday}</h3>
            </div>
            <AlertCircle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Late Today</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.lateToday}</h3>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90">Attendance Rate</p>
          <h3 className="text-3xl font-bold mt-2">{stats.attendanceRate}%</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Today's Attendance</h2>
            <button
              onClick={() => onNavigate('/check-attendance')}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Mark Attendance
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Professor ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              ) : (
                todayAttendance.map((attendance) => {
                  const professor = professorUsers[attendance.user_id];
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{professor?.unique_id}</td>
                      <td className="px-6 py-4 text-gray-800">{professor?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          attendance.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : attendance.status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : attendance.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {attendance.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('/check-attendance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-lg transition-colors border border-yellow-200"
          >
            <CheckCircle size={24} className="text-yellow-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Mark Attendance</p>
              <p className="text-sm text-gray-600">Record professor attendance</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/attendance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-lg transition-colors border border-indigo-200"
          >
            <Users size={24} className="text-indigo-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">View Records</p>
              <p className="text-sm text-gray-600">Check attendance history</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

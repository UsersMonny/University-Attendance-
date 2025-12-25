import { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { userService } from '../services/userService';
import { User } from '../types';

interface CheckAttendanceProps {
  currentUser: User;
}

export default function CheckAttendance({ currentUser }: CheckAttendanceProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      let targetUsers: User[];

      if (currentUser.role === 'class_moderator') {
        targetUsers = await userService.getByRole('teacher');
      } else if (currentUser.role === 'hr_assistant') {
        targetUsers = await userService.getByRole('staff');
      } else {
        targetUsers = [];
      }

      const existingAttendance = await attendanceService.getByDate(selectedDate);
      const statusMap: Record<number, string> = {};
      existingAttendance.forEach(att => {
        statusMap[att.user_id] = att.status;
      });

      setUsers(targetUsers);
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (userId: number, status: string) => {
    try {
      await attendanceService.markAttendance(userId, selectedDate, status);
      setAttendanceStatus(prev => ({
        ...prev,
        [userId]: status
      }));
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStats = () => {
    const statuses = Object.values(attendanceStatus);
    return {
      present: statuses.filter(s => s === 'present').length,
      absent: statuses.filter(s => s === 'absent').length,
      late: statuses.filter(s => s === 'late').length,
      unmarked: users.length - statuses.length
    };
  };

  const stats = getStats();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Check Attendance</h2>
        <p className="text-gray-600 mt-1">
          {currentUser.role === 'class_moderator'
            ? 'Mark attendance for professors'
            : 'Mark attendance for staff members'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Present</p>
          <h3 className="text-3xl font-bold mt-2">{stats.present}</h3>
        </div>
        <div className="bg-red-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Absent</p>
          <h3 className="text-3xl font-bold mt-2">{stats.absent}</h3>
        </div>
        <div className="bg-yellow-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Late</p>
          <h3 className="text-3xl font-bold mt-2">{stats.late}</h3>
        </div>
        <div className="bg-gray-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Unmarked</p>
          <h3 className="text-3xl font-bold mt-2">{stats.unmarked}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = attendanceStatus[user.id];
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{user.unique_id}</td>
                      <td className="px-6 py-4 text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status || 'Not Marked'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(user.id, 'present')}
                            className={`p-2 rounded-lg transition-colors ${
                              status === 'present'
                                ? 'bg-green-500 text-white'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title="Present"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(user.id, 'absent')}
                            className={`p-2 rounded-lg transition-colors ${
                              status === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Absent"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(user.id, 'late')}
                            className={`p-2 rounded-lg transition-colors ${
                              status === 'late'
                                ? 'bg-yellow-500 text-white'
                                : 'text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title="Late"
                          >
                            <Clock size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

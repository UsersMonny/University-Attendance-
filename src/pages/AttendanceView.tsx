import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { userService } from '../services/userService';
import { Attendance, User } from '../types';

interface AttendanceViewProps {
  currentUser: User;
  viewOwnOnly?: boolean;
}

export default function AttendanceView({ currentUser, viewOwnOnly = false }: AttendanceViewProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      let attendanceData: Attendance[];

      if (viewOwnOnly) {
        attendanceData = await attendanceService.getByUser(currentUser.id);
      } else if (currentUser.role === 'head' && currentUser.department_id) {
        const deptUsers = await userService.getByDepartment(currentUser.department_id);
        const allAttendances = await Promise.all(
          deptUsers.map(user => attendanceService.getByUser(user.id))
        );
        attendanceData = allAttendances.flat();
      } else {
        attendanceData = [];
      }

      const allUsers = await userService.getAll();
      const usersMap: Record<number, User> = {};
      allUsers.forEach(user => {
        usersMap[user.id] = user;
      });

      setAttendances(attendanceData);
      setUsers(usersMap);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const userAttendances = viewOwnOnly
      ? attendances
      : attendances.filter(a => a.user_id === currentUser.id);

    const total = userAttendances.length;
    const present = userAttendances.filter(a => a.status === 'present').length;
    const absent = userAttendances.filter(a => a.status === 'absent').length;
    const late = userAttendances.filter(a => a.status === 'late').length;
    const excused = userAttendances.filter(a => a.status === 'excused').length;

    return { total, present, absent, late, excused };
  };

  const stats = getStats();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Attendance Records</h2>
        <p className="text-gray-600 mt-1">
          {viewOwnOnly ? 'View your attendance history' : 'View attendance records'}
        </p>
      </div>

      {viewOwnOnly && (
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
          <div className="bg-blue-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">Excused</p>
            <h3 className="text-3xl font-bold mt-2">{stats.excused}</h3>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {!viewOwnOnly && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={viewOwnOnly ? 3 : 5} className="px-6 py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendances.map((attendance) => {
                  const user = users[attendance.user_id];
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      {!viewOwnOnly && (
                        <>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{user?.unique_id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user?.role}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(attendance.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {attendance.notes || '-'}
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

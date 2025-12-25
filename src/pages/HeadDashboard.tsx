import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { attendanceService } from '../services/attendanceService';
import { userService } from '../services/userService';
import { LeaveRequest, User, Attendance } from '../types';

interface HeadDashboardProps {
  currentUser: User;
  onNavigate: (path: string) => void;
}

export default function HeadDashboard({ currentUser, onNavigate }: HeadDashboardProps) {
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaves, allUsers, attendances] = await Promise.all([
        leaveService.getPending(),
        userService.getAll(),
        attendanceService.getByDate(new Date().toISOString().split('T')[0])
      ]);

      const usersMap: Record<number, User> = {};
      allUsers.forEach(user => {
        usersMap[user.id] = user;
      });

      const pendingCount = leaves.filter(l => l.status === 'pending').length;
      const approvedCount = leaves.filter(l => l.status === 'approved').length;
      const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

      const presentCount = attendances.filter(a => a.status === 'present').length;
      const absentCount = attendances.filter(a => a.status === 'absent').length;
      const lateCount = attendances.filter(a => a.status === 'late').length;

      setStats({
        pendingLeaves: pendingCount,
        approvedLeaves: approvedCount,
        rejectedLeaves: rejectedCount,
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalLate: lateCount
      });

      setLeaveRequests(leaves.slice(0, 5));
      setUsers(usersMap);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Pending Leave Requests</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.pendingLeaves}</h3>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Approved Leave Requests</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.approvedLeaves}</h3>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Rejected Leave Requests</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.rejectedLeaves}</h3>
            </div>
            <AlertCircle className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Present Today</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalPresent}</h3>
        </div>
        <div className="bg-red-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Absent Today</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalAbsent}</h3>
        </div>
        <div className="bg-yellow-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Late Today</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalLate}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Recent Leave Requests</h2>
            <button
              onClick={() => onNavigate('/leave-requests')}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">To Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No recent leave requests
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => {
                  const user = users[request.user_id];
                  const formatDate = (dateStr: string) =>
                    new Date(dateStr).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{user?.name}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.from_date)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.to_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
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
            onClick={() => onNavigate('/leave-requests')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-lg transition-colors border border-yellow-200"
          >
            <Calendar size={24} className="text-yellow-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Review Leave Requests</p>
              <p className="text-sm text-gray-600">Approve or reject pending requests</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/attendance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-colors border border-blue-200"
          >
            <CheckCircle size={24} className="text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">View Attendance</p>
              <p className="text-sm text-gray-600">Check staff attendance records</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

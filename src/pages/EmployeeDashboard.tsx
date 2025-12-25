import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { Attendance, LeaveRequest, User } from '../types';

interface EmployeeDashboardProps {
  currentUser: User;
  onNavigate: (path: string) => void;
}

export default function EmployeeDashboard({ currentUser, onNavigate }: EmployeeDashboardProps) {
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalExcused: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    attendanceRate: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceData, leaveData] = await Promise.all([
        attendanceService.getByUser(currentUser.id),
        leaveService.getByUser(currentUser.id)
      ]);

      const presentCount = attendanceData.filter(a => a.status === 'present').length;
      const absentCount = attendanceData.filter(a => a.status === 'absent').length;
      const lateCount = attendanceData.filter(a => a.status === 'late').length;
      const excusedCount = attendanceData.filter(a => a.status === 'excused').length;
      const totalRecords = attendanceData.length;
      const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

      const pendingCount = leaveData.filter(l => l.status === 'pending').length;
      const approvedCount = leaveData.filter(l => l.status === 'approved').length;

      setStats({
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalLate: lateCount,
        totalExcused: excusedCount,
        pendingLeaves: pendingCount,
        approvedLeaves: approvedCount,
        attendanceRate
      });

      setRecentAttendance(attendanceData.slice(0, 5));
      setRecentLeaves(leaveData.slice(0, 5));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Present</span>
              <span className="text-2xl font-bold text-green-600">{stats.totalPresent}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600">Absent</span>
              <span className="text-2xl font-bold text-red-600">{stats.totalAbsent}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600">Late</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.totalLate}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600">Excused</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalExcused}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Requests</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600">Approved</span>
              <span className="text-2xl font-bold text-green-600">{stats.approvedLeaves}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Present</p>
            <h3 className="text-3xl font-bold mt-2">{stats.totalPresent}</h3>
          </div>
          <CheckCircle size={40} className="opacity-80" />
        </div>

        <div className="bg-red-500 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Absent</p>
            <h3 className="text-3xl font-bold mt-2">{stats.totalAbsent}</h3>
          </div>
          <AlertCircle size={40} className="opacity-80" />
        </div>

        <div className="bg-yellow-500 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Late</p>
            <h3 className="text-3xl font-bold mt-2">{stats.totalLate}</h3>
          </div>
          <Clock size={40} className="opacity-80" />
        </div>

        <div className="bg-blue-500 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Pending Leaves</p>
            <h3 className="text-3xl font-bold mt-2">{stats.pendingLeaves}</h3>
          </div>
          <Calendar size={40} className="opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Recent Attendance</h2>
            <button
              onClick={() => onNavigate('/attendance')}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAttendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              ) : (
                recentAttendance.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{formatDate(attendance.date)}</td>
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
                    <td className="px-6 py-4 text-gray-600 text-sm">{attendance.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Leave Requests</h2>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">To Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLeaves.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No leave requests yet
                  </td>
                </tr>
              ) : (
                recentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{formatDate(leave.from_date)}</td>
                    <td className="px-6 py-4 text-gray-800">{formatDate(leave.to_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        leave.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : leave.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('/attendance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-colors border border-green-200"
          >
            <CheckCircle size={24} className="text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">My Attendance</p>
              <p className="text-xs text-gray-600">View your records</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/leave-requests')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-colors border border-blue-200"
          >
            <FileText size={24} className="text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Leave Requests</p>
              <p className="text-xs text-gray-600">Manage requests</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('/leave-requests')}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors border border-purple-200"
          >
            <Calendar size={24} className="text-purple-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-800">Request Leave</p>
              <p className="text-xs text-gray-600">Submit new request</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

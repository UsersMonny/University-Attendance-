import { useEffect, useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { userService } from '../services/userService';
import { LeaveRequest, User } from '../types';

interface LeaveRequestManagementProps {
  currentUser: User;
}

export default function LeaveRequestManagement({ currentUser }: LeaveRequestManagementProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let leaveRequests: LeaveRequest[];

      if (currentUser.role === 'head' && currentUser.department_id) {
        leaveRequests = await leaveService.getByDepartment(currentUser.department_id);
      } else {
        leaveRequests = await leaveService.getPending();
      }

      const allUsers = await userService.getAll();
      const usersMap: Record<number, User> = {};
      allUsers.forEach(user => {
        usersMap[user.id] = user;
      });

      setRequests(leaveRequests);
      setUsers(usersMap);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: LeaveRequest) => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;

    try {
      await leaveService.approve(request.id, currentUser.id, comments || undefined);
      await loadData();
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this leave request?')) return;

    try {
      await leaveService.reject(request.id, currentUser.id, comments);
      await loadData();
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Leave Request Management</h2>
        <p className="text-gray-600 mt-1">Review and approve leave requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">To Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No pending leave requests
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const user = users[request.user_id];
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{user?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user?.unique_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user?.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(request.from_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(request.to_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setComments('');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                            >
                              <Check size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setComments('');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Review Leave Request</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <p className="text-gray-800">{users[selectedRequest.user_id]?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <p className="text-gray-800">{formatDate(selectedRequest.from_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <p className="text-gray-800">{formatDate(selectedRequest.to_date)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <p className="text-gray-800">{selectedRequest.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your comments here..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setComments('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { majorService } from '../services/majorService';
import { Department } from '../types';

interface DepartmentFormData {
  name: string;
  short_name: string;
}

interface MajorFormData {
  name: string;
  short_name: string;
  department_id: string;
}

export default function Configuration() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [deptFormData, setDeptFormData] = useState<DepartmentFormData>({
    name: '',
    short_name: ''
  });
  const [majorFormData, setMajorFormData] = useState<MajorFormData>({
    name: '',
    short_name: '',
    department_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, deptFormData);
      } else {
        await departmentService.create(deptFormData);
      }

      await loadData();
      handleCloseDeptModal();
    } catch (error: any) {
      console.error('Failed to save department:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to save department';
      alert(errorMessage);
    }
  };

  const handleMajorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorFormData.department_id) {
      alert('Please select a department');
      return;
    }
    try {
      await majorService.create({
        name: majorFormData.name,
        short_name: majorFormData.short_name,
        department_id: parseInt(majorFormData.department_id)
      });

      await loadData();
      setMajorFormData({
        name: '',
        short_name: '',
        department_id: ''
      });
      setShowMajorModal(false);
    } catch (error: any) {
      console.error('Failed to save major:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to save major';
      alert(errorMessage);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setDeptFormData({
      name: dept.name,
      short_name: dept.short_name
    });
    setShowDeptModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete department:', error);
      alert('Failed to delete department');
    }
  };

  const handleCloseDeptModal = () => {
    setShowDeptModal(false);
    setEditingDept(null);
    setDeptFormData({
      name: '',
      short_name: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
          <p className="text-gray-600 mt-1">Manage university departments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Department
          </button>
          <button
            onClick={() => setShowMajorModal(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Major
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">DEPARTMENT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SHORT NAME</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                        <span className="text-sm font-bold">{dept.short_name.substring(0, 2)}</span>
                      </div>
                      <span className="font-medium text-gray-800">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{dept.short_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing 1 to {departments.length} of {departments.length} results
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <div className="flex gap-1 ml-4">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Previous</button>
              <button className="px-3 py-1 text-sm bg-purple-500 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Next</button>
            </div>
          </div>
        </div>
      </div>

      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={handleCloseDeptModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Information Technology & Engineering"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                <input
                  type="text"
                  value={deptFormData.short_name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, short_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., ITE"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDeptModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMajorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Add New Major</h3>
              <button
                onClick={() => setShowMajorModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMajorSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={majorFormData.department_id}
                  onChange={(e) => setMajorFormData({ ...majorFormData, department_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major Name</label>
                <input
                  type="text"
                  value={majorFormData.name}
                  onChange={(e) => setMajorFormData({ ...majorFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                <input
                  type="text"
                  value={majorFormData.short_name}
                  onChange={(e) => setMajorFormData({ ...majorFormData, short_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMajorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Create Major
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

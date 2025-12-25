import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { classService } from '../services/classService';
import { majorService } from '../services/majorService';
import { Class, Major } from '../types';

interface ClassFormData {
  name: string;
  major_id: string;
  year: string;
  semester: string;
  academic_year: string;
  group: string;
  is_active: boolean;
}

export default function AcademicSetup() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    major_id: '',
    year: '1',
    semester: '1',
    academic_year: '2025-2026',
    group: 'M1',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, majorsData] = await Promise.all([
        classService.getAll(),
        majorService.getAll()
      ]);
      setClasses(classesData);
      setMajors(majorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const classData = {
        ...formData,
        major_id: parseInt(formData.major_id),
        year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      };

      if (editingClass) {
        await classService.update(editingClass.id, classData);
      } else {
        await classService.create(classData);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save class:', error);
      alert('Failed to save class');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      major_id: classItem.major_id.toString(),
      year: classItem.year.toString(),
      semester: classItem.semester.toString(),
      academic_year: classItem.academic_year,
      group: classItem.group,
      is_active: classItem.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await classService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({
      name: '',
      major_id: '',
      year: '1',
      semester: '1',
      academic_year: '2025-2026',
      group: 'M1',
      is_active: true
    });
  };

  const getMajorName = (majorId: number) => {
    const major = majors.find(m => m.id === majorId);
    return major ? `${major.short_name}` : 'N/A';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
          <p className="text-gray-600 mt-1">Manage academic classes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Class
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">CLASS LABEL</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">MAJOR</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Semester</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Group</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {classItem.group}
                      </div>
                      <span className="font-semibold text-gray-800">{classItem.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-800">{getMajorName(classItem.major_id)}</div>
                      <div className="text-sm text-gray-500">{getMajorName(classItem.major_id)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{classItem.year}</td>
                  <td className="px-6 py-4 text-gray-600">{classItem.semester}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {classItem.group}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{classItem.academic_year}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
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
            Showing 1 to {classes.length} of {classes.length} results
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., BDSE Y1S1 M1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                <select
                  value={formData.major_id}
                  onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Major</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name} ({major.short_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  <input
                    type="text"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., M1, M2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 2025-2026"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

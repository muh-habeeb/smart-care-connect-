import { useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users as UsersIcon, Plus, ArrowUpDown, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Modal } from '../../components/ui/Modal';

export default function ManagerUsers() {
  const { users, updateUser, deleteUser } = useDataStore();
  const usersList = Object.entries(users || {}).map(([id, data]) => ({ id, ...data }));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Junior Doctor', seniorDoctorId: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deletingUser, setDeletingUser] = useState(null);
  const [replacementSeniorId, setReplacementSeniorId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sortConfig, setSortConfig] = useState({ column: null, step: 0 });

  const handleSort = (col) => {
    if (sortConfig.column !== col) {
      setSortConfig({ column: col, step: 2 }); // Step 2 is Alphabetical Ascending
    } else {
      setSortConfig({ column: col, step: (sortConfig.step + 1) % 4 });
    }
  };

  const sortedUsers = useMemo(() => {
    return [...usersList].sort((a, b) => {
      const { step, column } = sortConfig;
      if (step === 0 || !column) return new Date(a.createdAt || 0) - new Date(b.createdAt || 0); // Created Asc
      if (step === 1) return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // Created Desc
      if (step === 2) return (a[column] || '').localeCompare(b[column] || ''); // Alphabet Asc
      if (step === 3) return (b[column] || '').localeCompare(a[column] || ''); // Alphabet Desc
      return 0;
    });
  }, [usersList, sortConfig]);

  const seniorDoctors = usersList.filter(u => u.role === 'Senior Doctor');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/users', formData, { withCredentials: true });
      toast.success('User created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Junior Doctor', seniorDoctorId: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create user';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage doctors, delivery personnel, and managers.</p>
        </div>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {usersList.length === 0 ? (
        <EmptyState 
          title="No users found" 
          description="Get started by creating your first user account."
          icon={UsersIcon}
        />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {sortConfig.column === 'name' && sortConfig.step === 2 && <ArrowUp className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'name' && sortConfig.step === 3 && <ArrowDown className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'name' && sortConfig.step === 0 && <Clock className="w-3 h-3 text-slate-400" />}
                    {sortConfig.column === 'name' && sortConfig.step === 1 && <Clock className="w-3 h-3 text-slate-500" />}
                    {sortConfig.column !== 'name' && <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email
                    {sortConfig.column === 'email' && sortConfig.step === 2 && <ArrowUp className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'email' && sortConfig.step === 3 && <ArrowDown className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'email' && sortConfig.step === 0 && <Clock className="w-3 h-3 text-slate-400" />}
                    {sortConfig.column === 'email' && sortConfig.step === 1 && <Clock className="w-3 h-3 text-slate-500" />}
                    {sortConfig.column !== 'email' && <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors select-none group"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    Role
                    {sortConfig.column === 'role' && sortConfig.step === 2 && <ArrowUp className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'role' && sortConfig.step === 3 && <ArrowDown className="w-3 h-3 text-primary" />}
                    {sortConfig.column === 'role' && sortConfig.step === 0 && <Clock className="w-3 h-3 text-slate-400" />}
                    {sortConfig.column === 'role' && sortConfig.step === 1 && <Clock className="w-3 h-3 text-slate-500" />}
                    {sortConfig.column !== 'role' && <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDeletingUser(user);
                          setReplacementSeniorId('');
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        {editingUser && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setEditLoading(true);
            try {
              const { id, name, email, role, seniorDoctorId } = editingUser;
              await updateUser(id, { name, email, role, seniorDoctorId: role === 'Junior Doctor' ? seniorDoctorId : null });
              toast.success('User updated successfully!');
              setIsEditModalOpen(false);
            } catch (err) {
              toast.error('Failed to update user');
            } finally {
              setEditLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                required value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" required value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              >
                <option value="Junior Doctor">Junior Doctor</option>
                <option value="Senior Doctor">Senior Doctor</option>
                <option value="Delivery Person">Delivery Person</option>
              </select>
            </div>
            {editingUser.role === 'Junior Doctor' && (() => {
              const availableSeniorDoctors = seniorDoctors.filter(sd => sd.id !== editingUser.id);
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Senior Doctor</label>
                  <select 
                    required value={editingUser.seniorDoctorId || ''} onChange={e => setEditingUser({...editingUser, seniorDoctorId: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
                  >
                    {availableSeniorDoctors.length === 0 ? (
                      <option value="" disabled>No other senior doctors available</option>
                    ) : (
                      <option value="">Select a Senior Doctor...</option>
                    )}
                    {availableSeniorDoctors.map(sd => (
                      <option key={sd.id || sd.email} value={sd.id || sd.email}>{sd.name}</option>
                    ))}
                  </select>
                </div>
              );
            })()}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-500">Cancel</Button>
              <Button type="submit" disabled={editLoading} className="shadow-md">{editLoading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              placeholder="Ex: Dr. John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              placeholder="john@hospital.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
            <PasswordInput 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              className="h-11"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
            >
              <option value="Junior Doctor">Junior Doctor</option>
              <option value="Senior Doctor">Senior Doctor</option>
              <option value="Delivery Person">Delivery Person</option>
            </select>
          </div>
          {formData.role === 'Junior Doctor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Senior Doctor</label>
              <select 
                required value={formData.seniorDoctorId} onChange={e => setFormData({...formData, seniorDoctorId: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
              >
                <option value="">Select a Senior Doctor...</option>
                {seniorDoctors.map(sd => (
                  <option key={sd.id || sd.email} value={sd.id || sd.email}>{sd.name}</option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500">Cancel</Button>
            <Button type="submit" disabled={loading} className="shadow-md">{loading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Confirm Deletion">
        {deletingUser && (() => {
          const dependentJuniors = deletingUser.role === 'Senior Doctor' 
            ? usersList.filter(u => u.seniorDoctorId === deletingUser.id)
            : [];
          
          const availableSeniors = seniorDoctors.filter(sd => sd.id !== deletingUser.id);

          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deletingUser.name}</span>? 
                This action is permanent and cannot be undone.
              </p>

              {dependentJuniors.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-sm text-amber-700 font-bold mb-3">
                    Warning: Senior Reassignment Required
                  </p>
                  <p className="text-xs text-amber-600 mb-4">
                    This doctor oversees {dependentJuniors.length} junior(s). You must assign them to a new senior before deleting.
                  </p>
                  
                  {availableSeniors.length === 0 ? (
                    <p className="text-xs text-red-600 font-bold">
                      Critical: No other Senior Doctors available. Deletion blocked.
                    </p>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Replacement Senior</label>
                      <select 
                        required 
                        value={replacementSeniorId} 
                        onChange={e => setReplacementSeniorId(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900"
                      >
                        <option value="">Select a new Senior Doctor...</option>
                        {availableSeniors.map(sd => (
                          <option key={sd.id} value={sd.id}>{sd.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setDeletingUser(null)} className="text-slate-500">Cancel</Button>
                <Button 
                  type="button" 
                  className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
                  disabled={deleteLoading || (dependentJuniors.length > 0 && !replacementSeniorId)}
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      if (dependentJuniors.length > 0) {
                        for (const junior of dependentJuniors) {
                          await updateUser(junior.id, { seniorDoctorId: replacementSeniorId });
                        }
                      }
                      await deleteUser(deletingUser.id);
                      toast.success('User deleted successfully');
                      setDeletingUser(null);
                    } catch (err) {
                      toast.error('Failed to delete user');
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

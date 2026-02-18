import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { mockDb } from '../../services/mockDb';
import { Button, Input, Card, Modal, Select, Badge, ConfirmationModal } from '../../components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(mockDb.getUsers());
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {
    setFormError(null);
    if (!currentUser.name || !currentUser.email || !currentUser.role) {
      setFormError("Please fill all fields");
      return;
    }

    if (!isValidEmail(currentUser.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const userData: User = {
      id: currentUser.id || `u${Date.now()}`,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role as Role,
      avatarUrl: currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`
    };

    if (currentUser.id) {
      mockDb.updateUser(userData);
    } else {
      mockDb.createUser(userData);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Prevent deleting the main admin demo user
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete && userToDelete.email === 'admin@nexus.com') {
        return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      mockDb.deleteUser(deleteId);
      refreshData();
      setDeleteId(null);
    }
  };

  const openCreateModal = () => {
    setCurrentUser({ role: Role.STUDENT });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setCurrentUser({ ...user });
    setFormError(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Users</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage students, instructors and admins.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-800">
              <tr className="border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-gray-800/50 dark:data-[state=selected]:bg-gray-800">
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle"><Badge variant="info">{user.role}</Badge></td>
                  <td className="p-4 align-middle text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(user)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        type="button"
                        onClick={(e) => handleDeleteClick(user.id, e)} 
                        disabled={user.email === 'admin@nexus.com'}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser.id ? "Edit User" : "Add User"}>
        <div className="space-y-4 pt-2">
          <Input 
            label="Full Name" 
            value={currentUser.name || ''} 
            onChange={e => setCurrentUser({...currentUser, name: e.target.value})} 
            placeholder="John Doe"
          />
          <Input 
            label="Email" 
            type="email"
            value={currentUser.email || ''} 
            onChange={e => setCurrentUser({...currentUser, email: e.target.value})} 
            placeholder="john@nexus.com"
          />
          <Select 
            label="Role" 
            options={[
                { value: Role.STUDENT, label: 'Student' },
                { value: Role.INSTRUCTOR, label: 'Instructor' },
                { value: Role.ADMIN, label: 'Admin' }
            ]}
            value={currentUser.role || Role.STUDENT}
            onChange={e => setCurrentUser({...currentUser, role: e.target.value as Role})}
          />

          {formError && (
            <p className="text-sm text-red-500 font-medium">{formError}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSave}>Save User</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default UserManagement;
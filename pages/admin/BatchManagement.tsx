import React, { useState, useEffect } from 'react';
import { Batch, User, Role } from '../../types';
import { mockDb } from '../../services/mockDb';
import { Button, Input, Card, Modal, Select, Badge, ConfirmationModal } from '../../components/ui';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

const BatchManagement: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Partial<Batch>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBatches(mockDb.getBatches());
    const allUsers = mockDb.getUsers();
    setInstructors(allUsers.filter(u => u.role === Role.INSTRUCTOR));
    setStudents(allUsers.filter(u => u.role === Role.STUDENT));
  };

  const handleSave = () => {
    setFormError(null);
    if (!currentBatch.name || !currentBatch.instructorId || !currentBatch.startDate) {
        setFormError("Please fill required fields (Name, Instructor, Start Date)");
        return;
    }

    const start = new Date(currentBatch.startDate);
    
    // Only validate start date for NEW batches
    if (!currentBatch.id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            setFormError("Start Date cannot be in the past for new batches.");
            return;
        }
    }

    if (currentBatch.endDate) {
      const end = new Date(currentBatch.endDate);
      if (end < start) {
        setFormError("End Date cannot be earlier than Start Date.");
        return;
      }
    }

    const batchData: Batch = {
      id: currentBatch.id || `b${Date.now()}`,
      name: currentBatch.name,
      instructorId: currentBatch.instructorId,
      studentIds: currentBatch.studentIds || [],
      startDate: currentBatch.startDate,
      endDate: currentBatch.endDate || '',
    };

    if (currentBatch.id) {
      mockDb.updateBatch(batchData);
    } else {
      mockDb.createBatch(batchData);
    }
    
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
        mockDb.deleteBatch(deleteId);
        refreshData();
        setDeleteId(null);
    }
  };

  const openCreateModal = () => {
    setCurrentBatch({ studentIds: [] });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (batch: Batch) => {
    setCurrentBatch({ ...batch });
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleStudentSelection = (studentId: string) => {
    const currentIds = currentBatch.studentIds || [];
    if (currentIds.includes(studentId)) {
        setCurrentBatch({ ...currentBatch, studentIds: currentIds.filter(id => id !== studentId) });
    } else {
        setCurrentBatch({ ...currentBatch, studentIds: [...currentIds, studentId] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Batches</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage cohorts, assign instructors and enroll students.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" /> Create Batch
        </Button>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-800">
              <tr className="border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-gray-800/50 dark:data-[state=selected]:bg-gray-800">
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Batch Name</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Instructor</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Enrollment</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400">Duration</th>
                <th className="h-10 px-4 align-middle font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {batches.map(batch => {
                const instructor = instructors.find(i => i.id === batch.instructorId);
                return (
                  <tr key={batch.id} className="border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 align-middle font-medium text-gray-900 dark:text-white">{batch.name}</td>
                    <td className="p-4 align-middle">{instructor?.name || <span className="text-red-500 italic">Unassigned</span>}</td>
                    <td className="p-4 align-middle"><Badge>{batch.studentIds.length} Students</Badge></td>
                    <td className="p-4 align-middle text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{batch.startDate} — {batch.endDate || 'Ongoing'}</span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(batch)} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => handleDeleteClick(batch.id, e)} 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No batches found. Create one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentBatch.id ? "Edit Batch" : "Create Batch"}>
        <div className="space-y-4 pt-2">
          <Input 
            label="Batch Name" 
            value={currentBatch.name || ''} 
            onChange={e => setCurrentBatch({...currentBatch, name: e.target.value})} 
            placeholder="e.g. React Native Spring 2024"
          />
          
          <Select 
            label="Instructor" 
            options={[{value: '', label: 'Select Instructor'}, ...instructors.map(i => ({ value: i.id, label: i.name }))]}
            value={currentBatch.instructorId || ''}
            onChange={e => setCurrentBatch({...currentBatch, instructorId: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
                type="date" 
                label="Start Date" 
                value={currentBatch.startDate || ''} 
                onChange={e => setCurrentBatch({...currentBatch, startDate: e.target.value})} 
            />
            <Input 
                type="date" 
                label="End Date" 
                value={currentBatch.endDate || ''} 
                onChange={e => setCurrentBatch({...currentBatch, endDate: e.target.value})} 
            />
          </div>

          <div>
             <label className="block text-sm font-medium leading-none text-gray-900 dark:text-gray-100 mb-2">Enroll Students</label>
             {students.length > 0 ? (
                 <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-800 p-1 bg-gray-50 dark:bg-gray-900">
                    {students.map(s => (
                        <div key={s.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <input 
                                type="checkbox" 
                                checked={(currentBatch.studentIds || []).includes(s.id)}
                                onChange={() => toggleStudentSelection(s.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                id={`student-${s.id}`}
                            />
                            <label htmlFor={`student-${s.id}`} className="text-sm font-medium leading-none cursor-pointer w-full select-none text-gray-700 dark:text-gray-300">
                                {s.name} <span className="text-gray-400 font-normal">({s.email})</span>
                            </label>
                        </div>
                    ))}
                 </div>
             ) : (
                <p className="text-sm text-gray-500 italic">No students available.</p>
             )}
          </div>

          {formError && (
            <p className="text-sm text-red-500 font-medium">{formError}</p>
          )}

          <div className="flex justify-end gap-2 mt-6">
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSave}>Save Batch</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Batch"
        message="Are you sure you want to delete this batch? All associated assignments and submissions will also be deleted."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default BatchManagement;
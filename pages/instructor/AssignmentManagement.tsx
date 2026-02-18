import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Assignment, Batch, Role, Submission } from '../../types';
import { mockDb } from '../../services/mockDb';
import { Button, Input, Card, Modal, Select, Badge, ConfirmationModal } from '../../components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]); // For student view
  
  // Instructor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Student Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = () => {
    if (!user) return;
    const allBatches = mockDb.getBatches();
    const allAssignments = mockDb.getAssignments();
    const allSubmissions = mockDb.getSubmissions();

    if (user.role === Role.INSTRUCTOR) {
      const myBatches = allBatches.filter(b => b.instructorId === user.id);
      setBatches(myBatches);
      const myBatchIds = myBatches.map(b => b.id);
      setAssignments(allAssignments.filter(a => myBatchIds.includes(a.batchId)));
    } else if (user.role === Role.STUDENT) {
      const myBatches = allBatches.filter(b => b.studentIds.includes(user.id));
      setBatches(myBatches);
      const myBatchIds = myBatches.map(b => b.id);
      setAssignments(allAssignments.filter(a => myBatchIds.includes(a.batchId) && a.status === 'PUBLISHED'));
      setSubmissions(allSubmissions.filter(s => s.studentId === user.id));
    }
  };

  // Instructor Actions
  const handleSaveAssignment = () => {
    setFormError(null);
    if (!currentAssignment.title || !currentAssignment.batchId) {
        setFormError("Please enter title and select a batch");
        return;
    }

    if (currentAssignment.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(currentAssignment.dueDate);
      if (due < today) {
        setFormError("Due date cannot be in the past.");
        return;
      }
    }
    
    const data: Assignment = {
      id: currentAssignment.id || `a${Date.now()}`,
      batchId: currentAssignment.batchId,
      title: currentAssignment.title,
      description: currentAssignment.description || '',
      dueDate: currentAssignment.dueDate || '',
      maxScore: Number(currentAssignment.maxScore) || 100,
      status: currentAssignment.status || 'DRAFT',
      createdAt: currentAssignment.createdAt || new Date().toISOString()
    };

    if (currentAssignment.id) mockDb.updateAssignment(data);
    else mockDb.createAssignment(data);

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
        mockDb.deleteAssignment(deleteId);
        refreshData();
        setDeleteId(null);
    }
  };

  const openCreateModal = () => {
    // Default valid future date or empty
    setCurrentAssignment({ status: 'DRAFT', maxScore: 100, dueDate: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assign: Assignment) => {
    setCurrentAssignment({ ...assign });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Student Actions
  const openSubmitModal = (assignmentId: string) => {
    const existing = submissions.find(s => s.assignmentId === assignmentId);
    setSubmissionContent(existing ? existing.content : '');
    setActiveAssignmentId(assignmentId);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignment = () => {
    if (!user || !activeAssignmentId) return;
    
    const submission: Submission = {
      id: `s${Date.now()}`, 
      assignmentId: activeAssignmentId,
      studentId: user.id,
      content: submissionContent,
      submittedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    mockDb.createSubmission(submission);
    setIsSubmitModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user?.role === Role.INSTRUCTOR ? 'Manage Assignments' : 'My Assignments'}
        </h1>
        {user?.role === Role.INSTRUCTOR && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" /> New Assignment
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map(assign => {
          const batchName = batches.find(b => b.id === assign.batchId)?.name;
          const submission = user?.role === Role.STUDENT ? submissions.find(s => s.assignmentId === assign.id) : null;
          
          return (
            <Card key={assign.id} className="flex flex-col h-full">
               <div className="flex justify-between items-start mb-2">
                 <Badge variant={assign.status === 'PUBLISHED' ? 'success' : 'warning'}>{assign.status}</Badge>
                 {user?.role === Role.STUDENT && submission && (
                   <Badge variant={submission.status === 'GRADED' ? 'success' : 'info'}>
                     {submission.status === 'GRADED' ? `Score: ${submission.grade}/${assign.maxScore}` : 'Submitted'}
                   </Badge>
                 )}
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assign.title}</h3>
               <p className="text-xs text-gray-500 mb-2">{batchName}</p>
               <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">{assign.description}</p>
               
               <div className="text-xs text-gray-500 mb-4 space-y-1">
                 <p>Due: {assign.dueDate || 'No date set'}</p>
                 <p>Max Score: {assign.maxScore}</p>
               </div>

               <div className="mt-auto">
                 {user?.role === Role.INSTRUCTOR ? (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(assign)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={(e) => handleDeleteClick(assign.id, e)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                 ) : (
                   <Button 
                      className="w-full" 
                      onClick={() => openSubmitModal(assign.id)}
                      disabled={submission?.status === 'GRADED'}
                   >
                     {submission ? (submission.status === 'GRADED' ? 'Graded' : 'Update Submission') : 'Submit'}
                   </Button>
                 )}
               </div>
            </Card>
          );
        })}
        {assignments.length === 0 && (
           <div className="col-span-full text-center text-gray-500 py-10">No assignments found.</div>
        )}
      </div>

      {/* Instructor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assignment Details">
        <div className="space-y-4">
          <Input label="Title" value={currentAssignment.title || ''} onChange={e => setCurrentAssignment({...currentAssignment, title: e.target.value})} />
          <Select 
            label="Batch"
            options={[
              { value: '', label: 'Select Batch' },
              ...batches.map(b => ({ value: b.id, label: b.name }))
            ]}
            value={currentAssignment.batchId || ''}
            onChange={e => setCurrentAssignment({...currentAssignment, batchId: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
               className="w-full rounded-md border border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-primary-500 dark:text-white"
               rows={4}
               value={currentAssignment.description || ''}
               onChange={e => setCurrentAssignment({...currentAssignment, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
                type="date" 
                label="Due Date" 
                value={currentAssignment.dueDate || ''} 
                onChange={e => setCurrentAssignment({...currentAssignment, dueDate: e.target.value})} 
             />
             <Input 
                type="number" 
                label="Max Score" 
                value={currentAssignment.maxScore || ''} 
                onChange={e => setCurrentAssignment({...currentAssignment, maxScore: Number(e.target.value)})} 
             />
          </div>
          <Select 
            label="Status"
            options={[{value: 'DRAFT', label: 'Draft'}, {value: 'PUBLISHED', label: 'Published'}]}
            value={currentAssignment.status || 'DRAFT'}
            onChange={e => setCurrentAssignment({...currentAssignment, status: e.target.value as any})}
          />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSaveAssignment}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Student Submission Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Assignment">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a URL to your work (GitHub, Google Doc, etc.) or paste the text directly.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submission Content</label>
            <textarea 
               className="w-full rounded-md border border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-primary-500 dark:text-white"
               rows={6}
               value={submissionContent}
               onChange={e => setSubmissionContent(e.target.value)}
               placeholder="https://github.com/my-repo..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSubmitAssignment}>Submit Work</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? All submissions for this assignment will also be deleted."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default AssignmentManagement;
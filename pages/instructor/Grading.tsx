import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Assignment, Submission, User } from '../../types';
import { Button, Input, Card, Modal, Badge } from '../../components/ui';
import { generateFeedback } from '../../services/geminiService';
import { Wand2, Check } from 'lucide-react';

const Grading: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  // Grading Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (user) {
      const myBatches = mockDb.getBatches().filter(b => b.instructorId === user.id);
      const batchIds = myBatches.map(b => b.id);
      const myAssignments = mockDb.getAssignments().filter(a => batchIds.includes(a.batchId));
      setAssignments(myAssignments);
      setStudents(mockDb.getUsers());
      
      if (myAssignments.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(myAssignments[0].id);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedAssignmentId) {
      setSubmissions(mockDb.getSubmissionsByAssignment(selectedAssignmentId));
    }
  }, [selectedAssignmentId]);

  const openGradingModal = (submission: Submission) => {
    setCurrentSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setIsModalOpen(true);
  };

  const handleSaveGrade = () => {
    if (!currentSubmission) return;
    
    // Validate Max Score
    const assignment = assignments.find(a => a.id === currentSubmission.assignmentId);
    if (assignment && grade > assignment.maxScore) {
      alert(`Grade cannot exceed max score of ${assignment.maxScore}`);
      return;
    }

    const updated: Submission = {
      ...currentSubmission,
      grade,
      feedback,
      status: 'GRADED'
    };
    
    mockDb.updateSubmission(updated);
    setIsModalOpen(false);
    // Refresh submissions locally
    setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleAiFeedback = async () => {
    if (!currentSubmission) return;
    const assignment = assignments.find(a => a.id === currentSubmission.assignmentId);
    if (!assignment) return;

    setIsGeneratingAi(true);
    const suggestion = await generateFeedback(
      assignment.title,
      assignment.description,
      currentSubmission.content
    );
    setFeedback(prev => prev ? `${prev}\n\nAI Suggestion: ${suggestion}` : suggestion);
    setIsGeneratingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grading Dashboard</h1>
        <select 
          className="rounded-md border-gray-300 dark:bg-gray-800 dark:border-gray-700 p-2"
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
        >
          {assignments.map(a => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
               <tr>
                 <th className="px-6 py-3">Student</th>
                 <th className="px-6 py-3">Submitted At</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3">Grade</th>
                 <th className="px-6 py-3">Action</th>
               </tr>
             </thead>
             <tbody>
               {submissions.map(sub => {
                 const student = students.find(s => s.id === sub.studentId);
                 return (
                   <tr key={sub.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-800">
                     <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <img src={student?.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                            {student?.name}
                        </div>
                     </td>
                     <td className="px-6 py-4">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                     <td className="px-6 py-4"><Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'}>{sub.status}</Badge></td>
                     <td className="px-6 py-4">{sub.grade !== undefined ? sub.grade : '-'}</td>
                     <td className="px-6 py-4">
                       <Button size="sm" onClick={() => openGradingModal(sub)}>
                         {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade'}
                       </Button>
                     </td>
                   </tr>
                 );
               })}
               {submissions.length === 0 && (
                 <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No submissions found for this assignment.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Grade Submission">
        <div className="space-y-4">
           <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
             <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Student Content</h4>
             <p className="text-sm font-mono whitespace-pre-wrap break-all dark:text-gray-300">
               {currentSubmission?.content}
             </p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <Input 
                type="number" 
                label="Score" 
                value={grade} 
                onChange={e => setGrade(Number(e.target.value))} 
              />
              <div className="flex items-end pb-1">
                 <Button 
                   type="button" 
                   variant="secondary" 
                   size="sm" 
                   onClick={handleAiFeedback} 
                   isLoading={isGeneratingAi}
                   className="w-full"
                 >
                   <Wand2 className="w-4 h-4 mr-2" /> AI Suggest
                 </Button>
              </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
             <textarea 
               className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 p-2 text-sm focus:ring-primary-500 focus:border-primary-500 dark:text-white"
               rows={4}
               value={feedback}
               onChange={e => setFeedback(e.target.value)}
             />
           </div>

           <div className="flex justify-end gap-2 mt-4">
             <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button onClick={handleSaveGrade}>Save Grade</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Grading;

import { User, Batch, Assignment, Submission, Role } from '../types';

// Initial Data
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@nexus.com', role: Role.ADMIN, avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff' },
  { id: 'u2', name: 'John Instructor', email: 'instructor@nexus.com', role: Role.INSTRUCTOR, avatarUrl: 'https://ui-avatars.com/api/?name=John+Instructor&background=random' },
  { id: 'u3', name: 'Alice Student', email: 'alice@nexus.com', role: Role.STUDENT, avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Student&background=random' },
  { id: 'u4', name: 'Bob Student', email: 'bob@nexus.com', role: Role.STUDENT, avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Student&background=random' },
  { id: 'u5', name: 'Charlie Student', email: 'charlie@nexus.com', role: Role.STUDENT, avatarUrl: 'https://ui-avatars.com/api/?name=Charlie+Student&background=random' },
];

const INITIAL_BATCHES: Batch[] = [
  { id: 'b1', name: 'React Fundamentals 2024', instructorId: 'u2', studentIds: ['u3', 'u4'], startDate: '2024-01-01', endDate: '2024-03-30' },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', batchId: 'b1', title: 'Component Basics', description: 'Create a reusable Button component.', dueDate: '2024-02-01', maxScore: 100, status: 'PUBLISHED', createdAt: new Date().toISOString() },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  { id: 's1', assignmentId: 'a1', studentId: 'u3', content: 'Here is my submission: github.com/alice/button', submittedAt: new Date().toISOString(), status: 'PENDING' },
];

const STORAGE_KEYS = {
  USERS: 'nexus_users',
  BATCHES: 'nexus_batches',
  ASSIGNMENTS: 'nexus_assignments',
  SUBMISSIONS: 'nexus_submissions',
};

// Helper to load/save
const load = <T,>(key: string, defaults: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
};

const save = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// DB Service
export const mockDb = {
  getUsers: (): User[] => load(STORAGE_KEYS.USERS, INITIAL_USERS),
  getBatches: (): Batch[] => load(STORAGE_KEYS.BATCHES, INITIAL_BATCHES),
  getAssignments: (): Assignment[] => load(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS),
  getSubmissions: (): Submission[] => load(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS),

  // Users
  getUserByEmail: (email: string) => mockDb.getUsers().find(u => u.email === email),
  createUser: (user: User) => {
    const users = mockDb.getUsers();
    users.push(user);
    save(STORAGE_KEYS.USERS, users);
  },
  updateUser: (user: User) => {
    const users = mockDb.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      save(STORAGE_KEYS.USERS, users);
    }
  },
  deleteUser: (id: string) => {
    const users = mockDb.getUsers().filter(u => u.id !== id);
    save(STORAGE_KEYS.USERS, users);
    // Cleanup: Remove user from batches
    const batches = mockDb.getBatches().map(b => ({
      ...b,
      studentIds: b.studentIds.filter(sId => sId !== id),
      instructorId: b.instructorId === id ? '' : b.instructorId // Unassign instructor if deleted
    }));
    save(STORAGE_KEYS.BATCHES, batches);
  },
  
  // Batches
  createBatch: (batch: Batch) => {
    const batches = mockDb.getBatches();
    batches.push(batch);
    save(STORAGE_KEYS.BATCHES, batches);
  },
  updateBatch: (batch: Batch) => {
    const batches = mockDb.getBatches();
    const index = batches.findIndex(b => b.id === batch.id);
    if (index !== -1) {
      batches[index] = batch;
      save(STORAGE_KEYS.BATCHES, batches);
    }
  },
  deleteBatch: (id: string) => {
    const batches = mockDb.getBatches().filter(b => b.id !== id);
    save(STORAGE_KEYS.BATCHES, batches);
    
    // Cascade delete assignments
    const assignments = mockDb.getAssignments();
    const batchAssignmentIds = assignments.filter(a => a.batchId === id).map(a => a.id);
    const remainingAssignments = assignments.filter(a => a.batchId !== id);
    save(STORAGE_KEYS.ASSIGNMENTS, remainingAssignments);

    // Cascade delete submissions
    const submissions = mockDb.getSubmissions().filter(s => !batchAssignmentIds.includes(s.assignmentId));
    save(STORAGE_KEYS.SUBMISSIONS, submissions);
  },

  // Assignments
  createAssignment: (assignment: Assignment) => {
    const assignments = mockDb.getAssignments();
    assignments.push(assignment);
    save(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },
  updateAssignment: (assignment: Assignment) => {
    const assignments = mockDb.getAssignments();
    const index = assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      assignments[index] = assignment;
      save(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }
  },
  deleteAssignment: (id: string) => {
    const assignments = mockDb.getAssignments().filter(a => a.id !== id);
    save(STORAGE_KEYS.ASSIGNMENTS, assignments);
    // Cascade delete submissions
    const submissions = mockDb.getSubmissions().filter(s => s.assignmentId !== id);
    save(STORAGE_KEYS.SUBMISSIONS, submissions);
  },
  getAssignmentsByBatch: (batchId: string) => mockDb.getAssignments().filter(a => a.batchId === batchId),

  // Submissions
  createSubmission: (submission: Submission) => {
    const submissions = mockDb.getSubmissions();
    const existingIndex = submissions.findIndex(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
    
    if (existingIndex !== -1) {
       // Preserve original ID if updating
       const originalId = submissions[existingIndex].id;
       submissions[existingIndex] = { ...submission, id: originalId };
    } else {
       submissions.push(submission);
    }
    save(STORAGE_KEYS.SUBMISSIONS, submissions);
  },
  updateSubmission: (submission: Submission) => {
    const submissions = mockDb.getSubmissions();
    const index = submissions.findIndex(s => s.id === submission.id);
    if (index !== -1) {
      submissions[index] = submission;
      save(STORAGE_KEYS.SUBMISSIONS, submissions);
    }
  },
  getSubmissionsByAssignment: (assignmentId: string) => mockDb.getSubmissions().filter(s => s.assignmentId === assignmentId),
  getSubmissionByStudentAndAssignment: (studentId: string, assignmentId: string) => 
    mockDb.getSubmissions().find(s => s.studentId === studentId && s.assignmentId === assignmentId),

  // Reset
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
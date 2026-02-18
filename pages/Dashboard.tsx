import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { mockDb } from '../services/mockDb';
import { Card } from '../components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; className?: string }> = ({ title, value, icon, className }) => (
  <Card className={`p-6 ${className}`}>
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="text-gray-500 dark:text-gray-400">
        {icon}
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+20.1% from last month</p>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const stats = useMemo(() => {
    if (!user) return null;

    const batches = mockDb.getBatches();
    const assignments = mockDb.getAssignments();
    const submissions = mockDb.getSubmissions();

    if (user.role === Role.ADMIN) {
      return {
        totalUsers: mockDb.getUsers().length,
        totalBatches: batches.length,
        totalAssignments: assignments.length,
        activeStudents: mockDb.getUsers().filter(u => u.role === Role.STUDENT).length
      };
    } else if (user.role === Role.INSTRUCTOR) {
      const myBatches = batches.filter(b => b.instructorId === user.id);
      const myBatchIds = myBatches.map(b => b.id);
      const myAssignments = assignments.filter(a => myBatchIds.includes(a.batchId));
      const mySubmissions = submissions.filter(s => myAssignments.map(a => a.id).includes(s.assignmentId));
      
      return {
        myBatches: myBatches.length,
        myAssignments: myAssignments.length,
        pendingGrading: mySubmissions.filter(s => s.status === 'PENDING').length,
        totalStudents: myBatches.reduce((acc, b) => acc + b.studentIds.length, 0)
      };
    } else {
      // Student
      const myBatchIds = batches.filter(b => b.studentIds.includes(user.id)).map(b => b.id);
      const myAssignments = assignments.filter(a => myBatchIds.includes(a.batchId) && a.status === 'PUBLISHED');
      const mySubmissions = submissions.filter(s => s.studentId === user.id);
      
      return {
        enrolledBatches: myBatchIds.length,
        pendingAssignments: myAssignments.length - mySubmissions.length,
        completedAssignments: mySubmissions.length,
        averageGrade: mySubmissions.length > 0 
           ? Math.round(mySubmissions.reduce((acc, s) => acc + (s.grade || 0), 0) / mySubmissions.length) + '%' 
           : 'N/A'
      };
    }
  }, [user]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
     return [
       { name: 'Jan', submissions: 4 },
       { name: 'Feb', submissions: 10 },
       { name: 'Mar', submissions: 2 },
       { name: 'Apr', submissions: 7 },
       { name: 'May', submissions: 15 },
       { name: 'Jun', submissions: 23 },
     ];
  }, []);

  if (!user || !stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Overview of your activity and performance.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === Role.ADMIN && (
          <>
            <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-4 h-4" />} />
            <StatCard title="Total Batches" value={stats.totalBatches} icon={<BookOpen className="w-4 h-4" />} />
            <StatCard title="Assignments" value={stats.totalAssignments} icon={<CheckCircle className="w-4 h-4" />} />
            <StatCard title="Active Students" value={stats.activeStudents} icon={<Users className="w-4 h-4" />} />
          </>
        )}
        {user.role === Role.INSTRUCTOR && (
          <>
            <StatCard title="My Batches" value={stats.myBatches} icon={<Users className="w-4 h-4" />} />
            <StatCard title="Assignments" value={stats.myAssignments} icon={<BookOpen className="w-4 h-4" />} />
            <StatCard title="Pending Grading" value={stats.pendingGrading} icon={<Clock className="w-4 h-4" />} />
            <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="w-4 h-4" />} />
          </>
        )}
        {user.role === Role.STUDENT && (
          <>
            <StatCard title="Enrolled Batches" value={stats.enrolledBatches} icon={<BookOpen className="w-4 h-4" />} />
            <StatCard title="Pending Tasks" value={stats.pendingAssignments} icon={<Clock className="w-4 h-4" />} />
            <StatCard title="Completed" value={stats.completedAssignments} icon={<CheckCircle className="w-4 h-4" />} />
            <StatCard title="Average Grade" value={stats.averageGrade} icon={<Users className="w-4 h-4" />} />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card title="Overview" className="col-span-1 lg:col-span-4 min-h-[350px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#0f172a' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="submissions" fill="#0f172a" radius={[4, 4, 0, 0]} className="dark:fill-gray-50" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Recent Activity" className="col-span-1 lg:col-span-3 min-h-[350px]">
          <div className="space-y-6 pt-2">
             <div className="flex items-start space-x-4">
               <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-sky-500" />
               <div className="space-y-1">
                 <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">New Assignment Posted</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">React Hooks Deep Dive</p>
                 <p className="text-xs text-gray-400">2 hours ago</p>
               </div>
             </div>
             <div className="flex items-start space-x-4">
               <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-green-500" />
               <div className="space-y-1">
                 <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Submission Graded</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Component Basics - 95/100</p>
                 <p className="text-xs text-gray-400">Yesterday at 4:30 PM</p>
               </div>
             </div>
             <div className="flex items-start space-x-4">
               <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gray-500" />
               <div className="space-y-1">
                 <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Batch Enrollment</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Added to 'Advanced TypeScript'</p>
                 <p className="text-xs text-gray-400">2 days ago</p>
               </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
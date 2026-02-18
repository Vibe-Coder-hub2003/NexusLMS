import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, ConfirmationModal } from '../components/ui';
import { mockDb } from '../services/mockDb';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleReset = () => {
    mockDb.reset();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Card title="Profile Information">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <img src={user?.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full bg-gray-200" />
              <div>
                 <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                 <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
           </div>
           <Input label="Email" value={user?.email} disabled />
           <p className="text-xs text-gray-500">Profile editing is disabled in this demo.</p>
        </div>
      </Card>

      <Card title="Application Data">
         <div className="space-y-4">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               NexusLMS uses local storage to simulate a database. You can reset the application to its initial state.
             </p>
             <Button variant="danger" onClick={() => setIsResetConfirmOpen(true)}>Reset All Data</Button>
         </div>
      </Card>

      <ConfirmationModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="Reset Application"
        message="Are you sure you want to reset all data? This will clear all users, batches, assignments, and submissions, and reload the application."
        variant="danger"
        confirmText="Reset"
      />
    </div>
  );
};

export default Settings;
import { useState } from 'react';
import UsersList from './UsersList';
import AddUserForm from './AddUserForm';
import { Plus } from 'lucide-react';

const UsersPanel = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshUsers = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm">Manage and monitor all platform users</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="gaming-btn flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <UsersList key={refreshTrigger} onUserDeleted={refreshUsers} />

      {showAddUser && (
        <AddUserForm
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            refreshUsers();
            setShowAddUser(false);
          }}
        />
      )}
    </div>
  );
};

export default UsersPanel;
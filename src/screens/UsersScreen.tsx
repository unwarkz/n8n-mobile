import { useEffect, useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers();
        setUsers(res.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Users</h2>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {users.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No users found.
            </div>
          ) : (
            users.map((user) => (
              <div 
                key={user.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center shrink-0 font-bold uppercase">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-neutral-900 truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
                <div className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md shrink-0">
                  {user.role}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

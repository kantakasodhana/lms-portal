'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';
import { UserPlus, Users } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'INTERN' as 'MENTOR' | 'INTERN' });
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await api.get('/users');
    setUsers(data.data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/users', form);
      setTempPassword(data.data.tempPassword);
      setShowForm(false);
      setForm({ email: '', name: '', role: 'INTERN' });
      loadUsers();
    } catch {
      // handled by interceptor
    } finally {
      setCreating(false);
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INVITED: 'bg-yellow-100 text-yellow-700',
    ONBOARDING: 'bg-blue-100 text-blue-700',
    PAUSED: 'bg-gray-100 text-gray-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
    REMOVED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentUser?.role === 'MENTOR' ? 'My Interns' : 'Users'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{users.length} users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Create {currentUser?.role === 'ADMIN' ? 'User' : 'Intern'}
        </button>
      </div>

      {tempPassword && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            User created! Temporary password:{' '}
            <code className="rounded bg-green-100 px-2 py-0.5 font-mono">
              {tempPassword}
            </code>
          </p>
          <button
            onClick={() => setTempPassword('')}
            className="mt-2 text-xs text-green-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              required
            />
            {currentUser?.role === 'ADMIN' && (
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'MENTOR' | 'INTERN' })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                <option value="INTERN">Intern</option>
                <option value="MENTOR">Mentor</option>
              </select>
            )}
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[u.status] || ''}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

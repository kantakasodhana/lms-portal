'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { Course, User } from '@/types';
import { BookOpen, Users, FolderOpen } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          api.get('/courses'),
          user?.role !== 'INTERN' ? api.get('/users') : Promise.resolve({ data: { data: [] } }),
        ]);
        setCourses(coursesRes.data.data);
        setUsers(usersRes.data.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const mentors = users.filter((u) => u.role === 'MENTOR');
  const interns = users.filter((u) => u.role === 'INTERN');

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">
        Welcome back, {user?.name}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {user?.role === 'ADMIN' && 'Admin Dashboard'}
        {user?.role === 'MENTOR' && 'Mentor Dashboard'}
        {user?.role === 'INTERN' && 'Your Learning Dashboard'}
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<BookOpen className="h-6 w-6 text-blue-500" />}
          label="Courses"
          value={courses.length}
          bg="bg-blue-50"
        />
        {user?.role !== 'INTERN' && (
          <>
            <StatCard
              icon={<Users className="h-6 w-6 text-sky-500" />}
              label="Interns"
              value={interns.length}
              bg="bg-sky-50"
            />
            <StatCard
              icon={<FolderOpen className="h-6 w-6 text-indigo-500" />}
              label="Mentors"
              value={mentors.length}
              bg="bg-indigo-50"
            />
          </>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          14-Week Curriculum
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-blue-100 bg-white p-4 transition hover:shadow-md hover:border-blue-200"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  Week {course.weekNumber}
                </span>
                <span className="text-xs text-gray-400">
                  {course._count?.modules || 0} modules
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-800">
                {course.title}
              </h3>
              {course.category && (
                <p className="mt-1 text-xs text-gray-500">{course.category}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

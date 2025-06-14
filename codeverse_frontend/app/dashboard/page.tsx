// app/dashboard/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import ProgressCard from "@/components/ProgressCard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email}! 👋</h1>
            <p className="mt-2 text-gray-600">Account created: {user ? new Date(user.createdAt).toLocaleDateString() : ''}</p>
            <p className="mt-2 text-gray-600">Here's your coding journey overview and progress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Progress Card */}
            <ProgressCard />
            {/* Recent Activity Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <p className="text-gray-600">No recent activity to show.</p>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Challenges</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

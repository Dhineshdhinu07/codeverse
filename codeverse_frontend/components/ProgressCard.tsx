"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProgressData {
  total: number;
  correct: number;
  accuracy: number;
  level: number;
}

export default function ProgressCard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        const response = await api.get('/progress');
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch progress:', err);
        setError(err.response?.data?.message || 'Failed to fetch progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900">{data.total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Correct Submissions</p>
          <p className="text-2xl font-bold text-gray-900">{data.correct}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Accuracy</p>
          <p className="text-2xl font-bold text-gray-900">{data.accuracy.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Level</p>
          <p className="text-2xl font-bold text-gray-900">{data.level}</p>
        </div>
      </div>
    </div>
  );
}
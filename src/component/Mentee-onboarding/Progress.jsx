import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Target, TrendingUp, Calendar, Star } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';

const Progress = () => {
  const { handleToggleState } = useContext(GlobalContext);
  const [progress, setProgress] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalHours: 0,
    achievements: [],
    goals: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress/mentee', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const completionRate = progress.totalSessions > 0
    ? Math.round((progress.completedSessions / progress.totalSessions) * 100)
    : 0;

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-medium">My Progress</h1>
            <p className="text-base font-medium text-slate-600">Track your learning journey</p>
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Sessions</h3>
                <p className="text-2xl font-bold">{progress.completedSessions}/{progress.totalSessions}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{completionRate}% completion rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Learning Hours</h3>
                <p className="text-2xl font-bold">{progress.totalHours}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total time spent learning</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold">Achievements</h3>
                <p className="text-2xl font-bold">{progress.achievements.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Milestones reached</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold">Goals</h3>
                <p className="text-2xl font-bold">{progress.goals.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active learning goals</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
            <div className="space-y-4">
              {progress.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Award className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Goals</h2>
            <div className="space-y-4">
              {progress.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Target className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.progress}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {progress.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress; 
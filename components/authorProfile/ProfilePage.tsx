'use client';

import { getProfile } from '@/actions/profile-actions';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaUser, 
  FaCalendar, 
  FaPhone, 
  FaIdCard, 
  FaClock,
  FaSync,
  FaCog,
  FaAward
} from 'react-icons/fa';
import { FaShieldHalved } from 'react-icons/fa6';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getProfile();
      
      if (result.success && result.data) {
        setProfile(result.data);
      } else if (result.success && !result.data) {
        setError('No profile found. Please create a profile first.');
      } else {
        setError(result.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to get dashboard path based on user role
  const getDashboardPath = () => {
    if (!profile) return '/authDashboard/posts'; // Default fallback
    
    if (profile.role === 'reader') {
      return '/userDashboard/save';
    } else if (profile.role === 'writer') {
      return '/authDashboard/posts';
    }
    
    return '/authDashboard/posts'; // Default fallback
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link 
            href="/profile/create" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaUser className="w-4 h-4" />
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Let's create your profile to get started</p>
          <Link 
            href="/authDashboard/profile/create" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaUser className="w-4 h-4" />
            Create Your Profile
          </Link>
        </div>
      </div>
    );
  }

  const dashboardPath = getDashboardPath();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={dashboardPath}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your personal information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile/update"
              className="flex items-center gap-2 bg-blue-600  dark:bg-gray-800 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 p-6 text-center">
                <div className="relative inline-block">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-2xl mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-2xl mx-auto">
                      <FaUser className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                    <FaShieldHalved className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{profile.name || 'No Name'}</h2>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.role === 'writer' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    <FaAward className="w-3 h-3" />
                    {profile.role === 'writer' ? '✍️ Writer' : '📖 Reader'}
                  </span>
                </div>
                <p className="text-blue-100 flex items-center justify-center gap-2 mt-2">
                  <FaAward className="w-4 h-4" />
                  Member since {new Date(profile.$createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <FaClock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Member For</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {Math.floor((new Date().getTime() - new Date(profile.$createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <FaCog className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                    <p className="font-bold text-gray-900 dark:text-white">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your basic details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                        <FaUser className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{profile.name || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 rounded-xl">
                        <FaCalendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 rounded-xl">
                        <FaPhone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FaIdCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 rounded-xl">
                        <FaIdCard className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile ID</p>
                          <p className="text-gray-900 dark:text-white font-mono text-sm font-semibold">{profile.$id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 rounded-xl">
                        <FaCalendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{new Date(profile.$createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gray-50 shadow-lg dark:bg-gray-800 rounded-xl">
                        <FaSync className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {profile.$updatedAt && profile.$updatedAt !== profile.$createdAt 
                              ? new Date(profile.$updatedAt).toLocaleString()
                              : 'Never updated'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={dashboardPath}
                      className="flex-1 flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium border border-gray-200 dark:border-gray-600 hover:shadow-md"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      Back to Dashboard
                    </Link>
                    <button
                      onClick={loadProfile}
                      className="flex-1 flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 py-4 px-6 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 font-medium border border-blue-100 dark:border-blue-800 hover:shadow-md"
                    >
                      <FaSync className="w-4 h-4" />
                      Refresh Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
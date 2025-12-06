export const dynamic = 'force-dynamic'; // 🎯 ADD THIS LINE

import { getCurrentAdminProfile } from "@/actions/admin-auth";
import { FaUserShield, FaIdCard, FaUserTag, FaCrown, FaUser } from "react-icons/fa";

export default async function AdminProfilePage() {
  const profileData = await getCurrentAdminProfile();

  if (!profileData.success || !profileData.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-200 dark:border-red-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserShield className="text-2xl text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Error</h2>
            <p className="text-red-600 dark:text-red-400">{profileData.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { profile } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Admin Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your administrator account</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaUserShield className="text-3xl text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <FaCrown className="text-yellow-300" />
                  <span className="font-semibold">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Name */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUser className="text-xl text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {profile.name}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaCrown className="text-xl text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {profile.role}
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaIdCard className="text-xl text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 break-all">
                  {profile.userId}
                </div>
              </div>
            </div>

            {/* Admin ID */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUserTag className="text-xl text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Admin ID
                </label>
                <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 break-all">
                  {profile.$id}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Active Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
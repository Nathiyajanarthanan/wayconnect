import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Users, MessageCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardContent = () => {
    switch (user.userType) {
      case 'company':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">48</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applied Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">5</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.profile?.firstName || user.profile?.companyName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            {user.userType === 'company' 
              ? 'Manage your projects and find the best talent'
              : 'Discover new opportunities and grow your network'
            }
          </p>
        </div>

        {getDashboardContent()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Completion Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Strength</span>
                  <span className="text-sm font-medium text-purple-600">
                    {(() => {
                      let completed = 0;
                      const total = 5;
                      if (user.profile?.profilePicture) completed++;
                      if (user.profile?.bio) completed++;
                      if (user.profile?.location) completed++;
                      if (user.profile?.headline) completed++;
                      if (user.profile?.skills?.length > 0) completed++;
                      return `${Math.round((completed / total) * 100)}%`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        let completed = 0;
                        const total = 5;
                        if (user.profile?.profilePicture) completed++;
                        if (user.profile?.bio) completed++;
                        if (user.profile?.location) completed++;
                        if (user.profile?.headline) completed++;
                        if (user.profile?.skills?.length > 0) completed++;
                        return (completed / total) * 100;
                      })()}%`
                    }}
                  ></div>
                </div>
                <div className="space-y-2">
                  {!user.profile?.profilePicture && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Add profile picture</span>
                    </div>
                  )}
                  {!user.profile?.headline && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Add professional headline</span>
                    </div>
                  )}
                  {!user.profile?.bio && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Write about yourself</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {user.userType === 'company' ? (
                  <>
                    <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors border border-purple-200">
                      <div className="font-medium text-purple-900">Post New Project</div>
                      <div className="text-sm text-purple-600">Find talent for your next project</div>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="font-medium text-gray-900">Review Applications</div>
                      <div className="text-sm text-gray-600">Check pending project applications</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors border border-purple-200">
                      <div className="font-medium text-purple-900">Browse Projects</div>
                      <div className="text-sm text-purple-600">Find your next opportunity</div>
                    </button>
                    <button 
                      onClick={() => window.location.href = '/profile'}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">Update Profile</div>
                      <div className="text-sm text-gray-600">Keep your profile current</div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
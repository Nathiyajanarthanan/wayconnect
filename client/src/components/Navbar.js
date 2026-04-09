import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Briefcase, 
  MessageCircle, 
  User, 
  LogOut, 
  Users, 
  Bell, 
  Plus,
  Brain,
  Award,
  TrendingUp,
  ChevronDown,
  Zap,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showInnovationMenu, setShowInnovationMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white rounded-full relative">
                  <div className="absolute -right-1 -top-1 w-3 h-3 border-2 border-white rounded-full bg-gradient-to-r from-blue-400 to-green-400"></div>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                WayConnectX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to={user?.userType === 'company' ? '/company-dashboard' : '/dashboard'}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard') || isActive('/company-dashboard')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link
              to="/network"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/network')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={20} />
              <span>Network</span>
            </Link>

            <Link
              to="/projects"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/projects')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase size={20} />
              <span>Projects</span>
            </Link>

            {user?.userType === 'company' && (
              <Link
                to="/post-project"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/post-project')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plus size={20} />
                <span>Post</span>
              </Link>
            )}

            <Link
              to="/messages"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/messages')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>

            {/* Innovation Menu */}
            <div className="relative">
              <button
                onClick={() => setShowInnovationMenu(!showInnovationMenu)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/smart-match') || isActive('/skill-verification') || isActive('/career-path')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap size={20} />
                <span>Innovation</span>
                <ChevronDown size={16} />
              </button>

              {showInnovationMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <Link
                      to="/smart-match"
                      onClick={() => setShowInnovationMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <Brain size={16} className="text-purple-500" />
                      <div>
                        <div className="font-medium">AI Smart Match</div>
                        <div className="text-xs text-gray-500">Intelligent connections</div>
                      </div>
                    </Link>
                    <Link
                      to="/skill-verification"
                      onClick={() => setShowInnovationMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Award size={16} className="text-blue-500" />
                      <div>
                        <div className="font-medium">Skill Verification</div>
                        <div className="text-xs text-gray-500">Peer endorsements</div>
                      </div>
                    </Link>
                    <Link
                      to="/career-path"
                      onClick={() => setShowInnovationMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <TrendingUp size={16} className="text-indigo-500" />
                      <div>
                        <div className="font-medium">Career Journey</div>
                        <div className="text-xs text-gray-500">Path visualization</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/notifications"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium relative ${
                isActive('/notifications')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to={user?.userType === 'company' ? '/company-dashboard' : '/dashboard'}
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard') || isActive('/company-dashboard')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link
              to="/network"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/network')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={20} />
              <span>Network</span>
            </Link>

            <Link
              to="/projects"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/projects')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} />
              <span>Projects</span>
            </Link>

            <Link
              to="/messages"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/messages')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>

            <Link
              to="/smart-match"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/smart-match')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Brain size={20} />
              <span>AI Smart Match</span>
            </Link>

            <Link
              to="/skill-verification"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/skill-verification')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Award size={20} />
              <span>Skill Verification</span>
            </Link>

            <Link
              to="/career-path"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/career-path')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={20} />
              <span>Career Journey</span>
            </Link>

            <Link
              to="/notifications"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium relative ${
                isActive('/notifications')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              <span>Notifications</span>
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>

            <button
              onClick={() => {
                logout();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
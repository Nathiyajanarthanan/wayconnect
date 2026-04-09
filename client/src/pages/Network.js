import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, UserPlus, MessageCircle, Users, Check, X, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';
import api from '../services/api';

const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [globalSuggestions, setGlobalSuggestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('grow');
  const [showGlobal, setShowGlobal] = useState(false);

  // Fetch user suggestions on component mount
  useEffect(() => {
    fetchSuggestions();
    fetchConnections();
    fetchGlobalSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      console.log('Fetching suggestions...');
      const response = await api.get('/api/users/suggestions');
      console.log('Suggestions response:', response.data);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Set empty array if error
      setSuggestions([]);
    }
  };

  const fetchConnections = async () => {
    try {
      console.log('Fetching connections...');
      const response = await api.get('/api/users/following');
      console.log('Connections response:', response.data);
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      // Set empty array if error
      setConnections([]);
    }
  };

  const fetchGlobalSuggestions = async () => {
    try {
      const skills = user?.profile?.skills?.join(',') || '';
      const location = user?.profile?.location || '';
      const response = await api.get(`/api/discovery/global-suggestions?skills=${skills}&location=${location}`);
      setGlobalSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching global suggestions:', error);
    }
  };

  const handleLinkedInConnect = async () => {
    try {
      // Check if LinkedIn credentials are configured
      if (!process.env.LINKEDIN_CLIENT_ID) {
        alert('LinkedIn integration is not configured yet. This feature requires LinkedIn Developer App credentials.\n\nFor now, you can:\n1. Connect with local users in the suggestions\n2. Use the global professionals feature\n3. Search for users manually');
        return;
      }
      
      const response = await api.get('/api/linkedin/auth-url');
      window.open(response.data.authUrl, '_blank', 'width=600,height=600');
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      alert('LinkedIn integration is not available yet. Please use the local networking features for now.');
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/users/search/${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      console.log('Attempting to follow user:', userId);
      const response = await api.post(`/api/users/follow/${userId}`);
      console.log('Follow response:', response.data);
      
      if (response.data.isFollowing) {
        // User is now following - remove from suggestions, refresh connections
        setSuggestions(prev => prev.filter(user => user._id !== userId));
        fetchConnections();
        alert(response.data.message || 'Successfully connected!');
      } else {
        // User unfollowed - remove from connections, refresh suggestions
        setConnections(prev => prev.filter(user => user._id !== userId));
        fetchSuggestions();
        alert(response.data.message || 'Successfully disconnected!');
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Error connecting: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGlobalConnect = async (globalUser) => {
    try {
      if (globalUser.source === 'github') {
        window.open(globalUser.githubUrl, '_blank');
      } else if (globalUser.source === 'linkedin') {
        // Handle LinkedIn connection
        alert('LinkedIn connection feature coming soon!');
      } else {
        // Import user to our platform
        const response = await api.post('/api/discovery/import-external-user', {
          platform: globalUser.source,
          externalId: globalUser.id,
          userData: {
            firstName: globalUser.name?.split(' ')[0],
            lastName: globalUser.name?.split(' ').slice(1).join(' '),
            headline: globalUser.headline,
            location: globalUser.location,
            skills: globalUser.skills,
            profilePicture: globalUser.profilePicture
          }
        });
        
        if (response.data.success) {
          alert('User imported successfully! You can now connect with them.');
          fetchSuggestions();
        }
      }
    } catch (error) {
      console.error('Global connect error:', error);
    }
  };

  const UserCard = ({ userData, showFollowButton = true, isConnection = false, isGlobal = false }) => (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div 
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden cursor-pointer"
          onClick={() => !isGlobal && navigate(`/user/${userData._id}`)}
        >
          {userData.profilePicture ? (
            <img 
              src={userData.profilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            userData.name?.[0] || userData.profile?.firstName?.[0] || userData.profile?.companyName?.[0] || 'U'
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 
              className={`font-semibold text-gray-900 ${!isGlobal ? 'cursor-pointer hover:text-purple-600' : ''}`}
              onClick={() => !isGlobal && navigate(`/user/${userData._id}`)}
            >
              {isGlobal ? userData.name : (
                userData.userType === 'company' 
                  ? userData.profile?.companyName || 'Company'
                  : `${userData.profile?.firstName || 'User'} ${userData.profile?.lastName || ''}`
              )}
            </h3>
            {isGlobal && (
              <div className="flex space-x-1">
                {userData.source === 'github' && <Github size={16} className="text-gray-600" />}
                {userData.source === 'linkedin' && <Linkedin size={16} className="text-blue-600" />}
                {userData.source === 'global' && <Globe size={16} className="text-green-600" />}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {isGlobal ? userData.headline : (userData.profile?.headline || `${userData.userType} • ${userData.profile?.location || 'Location not set'}`)}
          </p>
          <p className="text-xs text-gray-500">
            {isGlobal ? userData.location : `${userData.followers?.length || 0} followers`}
          </p>
          {isGlobal && userData.skills && (
            <div className="flex flex-wrap gap-1 mt-2">
              {userData.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          {!isGlobal && (
            <button
              onClick={() => navigate(`/user/${userData._id}`)}
              className="flex items-center space-x-1 px-3 py-1 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 text-sm"
            >
              <span>View Profile</span>
            </button>
          )}
          {showFollowButton && (
            <button
              onClick={() => isGlobal ? handleGlobalConnect(userData) : handleFollow(userData._id)}
              className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 text-sm"
            >
              {isGlobal ? <ExternalLink size={14} /> : <UserPlus size={14} />}
              <span>{isGlobal ? 'WayConnectX' : (isConnection ? 'Unfollow' : 'WayConnectX')}</span>
            </button>
          )}
          {!isGlobal && (
            <button 
              onClick={() => navigate('/messages', { state: { selectedUser: userData } })}
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <MessageCircle size={14} />
              <span>Message</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">Grow your professional network globally on WayConnectX</p>
      </div>

      {/* Global Integration Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">WayConnectX Globally</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLinkedInConnect}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Linkedin size={16} />
            <span>Import LinkedIn WayConnectXions</span>
          </button>
          <button
            onClick={() => setShowGlobal(!showGlobal)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Globe size={16} />
            <span>{showGlobal ? 'Hide' : 'Show'} Global Professionals</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search for people you know globally..."
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('grow')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'grow'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users size={16} />
            <span>Grow</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'connections'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Check size={16} />
            <span>Following ({connections.length})</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {searchQuery && searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((userData) => (
              <UserCard key={userData._id} userData={userData} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grow' && (
        <div>
          {/* Network Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{connections.length}</div>
                <div className="text-sm text-gray-600">Local Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{globalSuggestions.length}</div>
                <div className="text-sm text-gray-600">Global Suggestions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user?.followers?.length || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user?.following?.length || 0}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
          </div>

          {/* Global Suggestions */}
          {showGlobal && globalSuggestions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="mr-2" size={20} />
                Global Professionals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalSuggestions.slice(0, 6).map((userData, index) => (
                  <UserCard key={`global-${index}`} userData={userData} isGlobal={true} />
                ))}
              </div>
            </div>
          )}

          {/* Local People You May Know */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">People you may know</h2>
            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((userData) => (
                  <UserCard key={userData._id} userData={userData} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No local suggestions available</h3>
                <p className="text-gray-600">Try following globally or check back later for new suggestions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Following</h2>
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((userData) => (
                <UserCard key={userData._id} userData={userData} isConnection={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No following yet</h3>
              <p className="text-gray-600 mb-4">Start building your professional network by following people globally.</p>
              <button
                onClick={() => setActiveTab('grow')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-pink-700"
              >
                Find People to WayConnectX
              </button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

export default Network;
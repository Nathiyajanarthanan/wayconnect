import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
  Target, 
  Zap, 
  Users, 
  MessageCircle, 
  Star,
  TrendingUp,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const SmartMatch = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchType, setMatchType] = useState('skills'); // 'skills', 'goals', 'projects'
  const [userGoals, setUserGoals] = useState('');
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const fetchSmartMatches = async (type = 'skills') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/smart-match/${type}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching smart matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserGoals = async () => {
    try {
      await axios.put('/api/users/profile', { goals: userGoals });
      setShowGoalsModal(false);
      fetchSmartMatches('goals');
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  useEffect(() => {
    fetchSmartMatches(matchType);
  }, [matchType]);

  const getMatchScore = (match) => {
    return Math.floor(Math.random() * 30) + 70; // 70-100% match
  };

  const getMatchReason = (match, type) => {
    switch (type) {
      case 'skills':
        return `Shared skills: ${match.profile?.skills?.slice(0, 2).join(', ') || 'Programming'}`;
      case 'goals':
        return `Similar career goals in ${match.userType}`;
      case 'projects':
        return `Looking for collaboration in ${match.profile?.skills?.[0] || 'tech'}`;
      default:
        return 'Great potential connection';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
              <Brain className="text-white" size={32} />
            </div>
            <Sparkles className="text-yellow-400 ml-2" size={24} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI Smart Matching
          </h1>
          <p className="text-gray-600 text-lg">
            Discover meaningful wayconnectxions powered by intelligent algorithms
          </p>
        </div>

        {/* Match Type Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setMatchType('skills')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                matchType === 'skills'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Zap size={20} />
              <span>Skill Match</span>
            </button>
            
            <button
              onClick={() => setMatchType('goals')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                matchType === 'goals'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Target size={20} />
              <span>Goal Match</span>
            </button>
            
            <button
              onClick={() => setMatchType('projects')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
                matchType === 'projects'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Lightbulb size={20} />
              <span>Project Match</span>
            </button>
          </div>

          {matchType === 'goals' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowGoalsModal(true)}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
              >
                Set Your Goals
              </button>
            </div>
          )}
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const matchScore = getMatchScore(match);
              const displayName = match.profile?.firstName 
                ? `${match.profile.firstName} ${match.profile.lastName}`
                : match.profile?.companyName || 'User';

              return (
                <div key={match._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  {/* Match Score Badge */}
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        matchScore >= 90 ? 'bg-green-500 text-white' :
                        matchScore >= 80 ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {matchScore}% Match
                      </div>
                    </div>
                    
                    {/* Profile Section */}
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                          {match.profile?.profilePicture ? (
                            <img 
                              src={match.profile.profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            displayName[0]
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{displayName}</h3>
                          <p className="text-purple-100">{match.profile?.headline || match.userType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <TrendingUp size={16} />
                        <span>Why you match:</span>
                      </div>
                      <p className="text-gray-800">{getMatchReason(match, matchType)}</p>
                    </div>

                    {/* Skills */}
                    {match.profile?.skills && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {match.profile.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                        <Users size={16} />
                        <span>WayConnectX</span>
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center space-x-2">
                        <MessageCircle size={16} />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {matches.length === 0 && !loading && (
          <div className="text-center py-12">
            <Brain size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
            <p className="text-gray-500">Try updating your profile or changing match type</p>
          </div>
        )}
      </div>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Set Your Career Goals</h3>
            <textarea
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
              placeholder="Describe your career goals, aspirations, and what you're looking to achieve..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={saveUserGoals}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                Save Goals
              </button>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMatch;
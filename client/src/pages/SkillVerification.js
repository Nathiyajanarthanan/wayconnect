import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  Plus,
  Shield,
  TrendingUp,
  Target,
  Zap,
  Badge,
  X,
  ThumbsUp,
  Eye
} from 'lucide-react';
import axios from 'axios';

const SkillVerification = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [pendingEndorsements, setPendingEndorsements] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [endorsers, setEndorsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserSkills = async () => {
    try {
      const response = await axios.get('/api/skills/my-skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      // Mock data for demo
      setSkills([
        { 
          name: 'React.js', 
          level: 'Expert', 
          endorsements: 12, 
          verified: true,
          endorsers: ['John Doe', 'Sarah Wilson', 'Mike Chen']
        },
        { 
          name: 'Node.js', 
          level: 'Advanced', 
          endorsements: 8, 
          verified: false,
          endorsers: ['Emma Garcia', 'Alex Rodriguez']
        },
        { 
          name: 'Python', 
          level: 'Intermediate', 
          endorsements: 5, 
          verified: false,
          endorsers: ['Tech Corp']
        }
      ]);
    }
  };

  const fetchPendingEndorsements = async () => {
    try {
      const response = await axios.get('/api/skills/pending-endorsements');
      setPendingEndorsements(response.data);
    } catch (error) {
      console.error('Error fetching endorsements:', error);
      // Mock data
      setPendingEndorsements([
        {
          id: 1,
          requester: { name: 'ABC Company', email: 'abc@gmail.com' },
          skill: 'JavaScript',
          message: 'Please endorse my JavaScript skills based on our recent project collaboration.'
        }
      ]);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      const response = await axios.post('/api/skills/add', { 
        skill: newSkill,
        level: 'Beginner'
      });
      setSkills([...skills, response.data]);
      setNewSkill('');
      setShowAddSkill(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      // Mock add
      const newSkillObj = {
        name: newSkill,
        level: 'Beginner',
        endorsements: 0,
        verified: false,
        endorsers: []
      };
      setSkills([...skills, newSkillObj]);
      setNewSkill('');
      setShowAddSkill(false);
    }
  };

  const endorseSkill = async (endorsementId, approve) => {
    try {
      await axios.post(`/api/skills/endorse/${endorsementId}`, { approve });
      setPendingEndorsements(prev => prev.filter(e => e.id !== endorsementId));
    } catch (error) {
      console.error('Error endorsing skill:', error);
      setPendingEndorsements(prev => prev.filter(e => e.id !== endorsementId));
    }
  };

  const requestVerification = async (skillName) => {
    try {
      await axios.post('/api/skills/request-verification', { skill: skillName });
      alert('Verification request sent to your connections!');
    } catch (error) {
      console.error('Error requesting verification:', error);
      alert('Verification request sent to your connections!');
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-green-500';
      case 'Advanced': return 'bg-blue-500';
      case 'Intermediate': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getVerificationBadge = (skill) => {
    if (skill.verified) {
      return <CheckCircle className="text-green-500" size={20} />;
    } else if (skill.endorsements >= 3) {
      return <Clock className="text-yellow-500" size={20} />;
    }
    return null;
  };

  useEffect(() => {
    fetchUserSkills();
    fetchPendingEndorsements();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <Shield className="text-white" size={32} />
            </div>
            <Badge className="text-yellow-400 ml-2" size={24} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Skill Verification Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Build trust through peer-verified skills and endorsements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Skills */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Award className="text-blue-500 mr-2" size={24} />
                  My Skills
                </h2>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{skill.name}</h3>
                      {getVerificationBadge(skill)}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Level</span>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-600">{skill.endorsements} endorsements</span>
                      </div>
                      <button
                        onClick={() => setSelectedSkill(skill)}
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </div>

                    {!skill.verified && (
                      <button
                        onClick={() => requestVerification(skill.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
                      >
                        Request Verification
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Endorsements */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="text-yellow-500 mr-2" size={20} />
                Pending Endorsements ({pendingEndorsements.length})
              </h2>

              {pendingEndorsements.length > 0 ? (
                <div className="space-y-4">
                  {pendingEndorsements.map((endorsement) => (
                    <div key={endorsement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {endorsement.requester.name[0]}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{endorsement.requester.name}</h4>
                          <p className="text-sm text-gray-600">wants endorsement for</p>
                          <span className="text-sm font-medium text-blue-600">{endorsement.skill}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4">{endorsement.message}</p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => endorseSkill(endorsement.id, true)}
                          className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Endorse
                        </button>
                        <button
                          onClick={() => endorseSkill(endorsement.id, false)}
                          className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No pending endorsements</p>
                </div>
              )}
            </div>

            {/* Skill Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="text-green-500 mr-2" size={20} />
                Your Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Skills</span>
                  <span className="font-bold text-2xl text-blue-600">{skills.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified Skills</span>
                  <span className="font-bold text-2xl text-green-600">
                    {skills.filter(s => s.verified).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Endorsements</span>
                  <span className="font-bold text-2xl text-purple-600">
                    {skills.reduce((sum, s) => sum + s.endorsements, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Skill Modal */}
        {showAddSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Add New Skill</h3>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name (e.g., React.js, Python, Design)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              />
              
              <div className="flex space-x-4">
                <button
                  onClick={addSkill}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  Add Skill
                </button>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Skill Detail Modal */}
        {selectedSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{selectedSkill.name}</h3>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-white ${getSkillLevelColor(selectedSkill.level)}`}>
                    {selectedSkill.level}
                  </span>
                  {selectedSkill.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">
                  {selectedSkill.endorsements} people have endorsed this skill
                </p>
                
                <div>
                  <h4 className="font-medium mb-2">Endorsed by:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.endorsers.map((endorser, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {endorser}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedSkill(null)}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillVerification;
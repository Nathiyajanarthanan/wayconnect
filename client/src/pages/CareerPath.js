import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';
import axios from 'axios';

const CareerPath = () => {
  const { user } = useAuth();
  const [careerMilestones, setCareerMilestones] = useState([]);
  const [futureGoals, setFutureGoals] = useState([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    company: '',
    date: '',
    type: 'work', // work, education, achievement
    description: '',
    skills: []
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetDate: '',
    priority: 'medium',
    description: '',
    steps: []
  });
  const [careerInsights, setCareerInsights] = useState(null);

  const fetchCareerData = async () => {
    try {
      const response = await axios.get('/api/career/path');
      setCareerMilestones(response.data.milestones);
      setFutureGoals(response.data.goals);
      setCareerInsights(response.data.insights);
    } catch (error) {
      console.error('Error fetching career data:', error);
      // Mock data for demo
      setCareerMilestones([
        {
          id: 1,
          title: 'Started Computer Science Degree',
          company: 'SECE College',
          date: '2022-06-01',
          type: 'education',
          description: 'Began my journey in computer science with focus on AI and software development',
          skills: ['Programming Fundamentals', 'Mathematics', 'Problem Solving'],
          completed: true
        },
        {
          id: 2,
          title: 'First Internship',
          company: 'Tech Startup',
          date: '2023-06-01',
          type: 'work',
          description: 'Gained hands-on experience in web development and learned React.js',
          skills: ['React.js', 'JavaScript', 'Team Collaboration'],
          completed: true
        },
        {
          id: 3,
          title: 'Built WayConnectX Platform',
          company: 'Personal Project',
          date: '2024-01-01',
          type: 'achievement',
          description: 'Created a professional networking platform with innovative features',
          skills: ['Full Stack Development', 'MongoDB', 'Socket.io', 'UI/UX Design'],
          completed: true
        }
      ]);

      setFutureGoals([
        {
          id: 1,
          title: 'Graduate with Honors',
          targetDate: '2026-05-01',
          priority: 'high',
          description: 'Complete my degree with distinction and strong technical foundation',
          steps: ['Maintain high GPA', 'Complete final year project', 'Prepare for placements'],
          progress: 60
        },
        {
          id: 2,
          title: 'Land Software Engineer Role',
          targetDate: '2026-07-01',
          priority: 'high',
          description: 'Secure a position at a leading tech company',
          steps: ['Build strong portfolio', 'Practice coding interviews', 'Network with professionals'],
          progress: 40
        },
        {
          id: 3,
          title: 'Launch Tech Startup',
          targetDate: '2028-01-01',
          priority: 'medium',
          description: 'Start my own technology company focusing on innovative solutions',
          steps: ['Gain industry experience', 'Build network', 'Develop business skills', 'Find co-founders'],
          progress: 15
        }
      ]);

      setCareerInsights({
        totalExperience: '2 years',
        skillsGained: 12,
        nextMilestone: 'Graduate with Honors',
        careerGrowth: 85,
        recommendations: [
          'Consider adding cloud computing skills to your profile',
          'Network with alumni in your target companies',
          'Start contributing to open source projects'
        ]
      });
    }
  };

  const addMilestone = async () => {
    try {
      const response = await axios.post('/api/career/milestone', newMilestone);
      setCareerMilestones([...careerMilestones, response.data]);
      setNewMilestone({
        title: '',
        company: '',
        date: '',
        type: 'work',
        description: '',
        skills: []
      });
      setShowAddMilestone(false);
    } catch (error) {
      console.error('Error adding milestone:', error);
      // Mock add
      const milestone = {
        ...newMilestone,
        id: Date.now(),
        completed: true
      };
      setCareerMilestones([...careerMilestones, milestone]);
      setNewMilestone({
        title: '',
        company: '',
        date: '',
        type: 'work',
        description: '',
        skills: []
      });
      setShowAddMilestone(false);
    }
  };

  const addGoal = async () => {
    try {
      const response = await axios.post('/api/career/goal', newGoal);
      setFutureGoals([...futureGoals, response.data]);
      setNewGoal({
        title: '',
        targetDate: '',
        priority: 'medium',
        description: '',
        steps: []
      });
      setShowAddGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
      // Mock add
      const goal = {
        ...newGoal,
        id: Date.now(),
        progress: 0
      };
      setFutureGoals([...futureGoals, goal]);
      setNewGoal({
        title: '',
        targetDate: '',
        priority: 'medium',
        description: '',
        steps: []
      });
      setShowAddGoal(false);
    }
  };

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'work': return <Briefcase className="text-blue-500" size={20} />;
      case 'education': return <GraduationCap className="text-green-500" size={20} />;
      case 'achievement': return <Award className="text-yellow-500" size={20} />;
      default: return <Star className="text-purple-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  useEffect(() => {
    fetchCareerData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full">
              <TrendingUp className="text-white" size={32} />
            </div>
            <MapPin className="text-pink-400 ml-2" size={24} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Career Journey Map
          </h1>
          <p className="text-gray-600 text-lg">
            Visualize your career path and plan your future milestones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Career Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="text-yellow-500 mr-2" size={20} />
                Career Insights
              </h2>
              
              {careerInsights && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Career Growth</span>
                      <span className="text-sm font-medium">{careerInsights.careerGrowth}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${careerInsights.careerGrowth}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{careerInsights.totalExperience}</div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{careerInsights.skillsGained}</div>
                      <div className="text-xs text-gray-600">Skills Gained</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Milestone</h4>
                    <p className="text-sm text-gray-600">{careerInsights.nextMilestone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {careerInsights.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <Zap size={12} className="text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Career Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MapPin className="text-indigo-500 mr-2" size={24} />
                  Career Timeline
                </h2>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                
                <div className="space-y-8">
                  {careerMilestones
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((milestone, index) => (
                    <div key={milestone.id} className="relative flex items-start">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 w-4 h-4 bg-white border-4 border-indigo-500 rounded-full"></div>
                      
                      {/* Content */}
                      <div className="ml-16 bg-gray-50 rounded-xl p-4 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getMilestoneIcon(milestone.type)}
                            <h3 className="font-semibold text-lg text-gray-900">{milestone.title}</h3>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(milestone.date)}</span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{milestone.company}</p>
                        <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                        
                        {milestone.skills && milestone.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills.map((skill, skillIndex) => (
                              <span key={skillIndex} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Future Goals */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="text-purple-500 mr-2" size={20} />
                  Future Goals
                </h2>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {futureGoals.map((goal) => (
                  <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                      <span className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`}></span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Target: {formatDate(goal.targetDate)}</span>
                      <Clock size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Milestone Modal */}
        {showAddMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Add Career Milestone</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <input
                  type="text"
                  placeholder="Company/Organization"
                  value={newMilestone.company}
                  onChange={(e) => setNewMilestone({...newMilestone, company: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                <select
                  value={newMilestone.type}
                  onChange={(e) => setNewMilestone({...newMilestone, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="work">Work Experience</option>
                  <option value="education">Education</option>
                  <option value="achievement">Achievement</option>
                </select>
                
                <textarea
                  placeholder="Description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                />
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={addMilestone}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  Add Milestone
                </button>
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Add Future Goal</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                
                <textarea
                  placeholder="Goal description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                />
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={addGoal}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  Add Goal
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPath;
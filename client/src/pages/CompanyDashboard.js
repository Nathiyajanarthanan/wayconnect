import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, DollarSign, TrendingUp, Eye, MessageCircle, 
  Plus, Filter, Search, Calendar, Award, BarChart3, PieChart 
} from 'lucide-react';
import axios from 'axios';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    completedProjects: 0,
    totalSpent: 0,
    avgProjectValue: 0
  });
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockProjects = [
    {
      id: 1,
      title: 'React E-commerce Website',
      status: 'active',
      applications: 12,
      budget: { min: 2000, max: 5000, currency: 'USD' },
      deadline: '2024-02-15',
      postedDate: '2024-01-10',
      category: 'web-development'
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Design',
      status: 'completed',
      applications: 8,
      budget: { min: 1500, max: 3000, currency: 'USD' },
      deadline: '2024-01-30',
      postedDate: '2024-01-05',
      category: 'design'
    },
    {
      id: 3,
      title: 'Data Analysis Dashboard',
      status: 'in-review',
      applications: 15,
      budget: { min: 3000, max: 7000, currency: 'USD' },
      deadline: '2024-03-01',
      postedDate: '2024-01-12',
      category: 'data-science'
    }
  ];

  const mockApplications = [
    {
      id: 1,
      projectTitle: 'React E-commerce Website',
      applicantName: 'Sarah Johnson',
      applicantHeadline: 'Full Stack Developer',
      proposedBudget: 3500,
      appliedDate: '2024-01-11',
      status: 'pending',
      rating: 4.8
    },
    {
      id: 2,
      projectTitle: 'React E-commerce Website',
      applicantName: 'Mike Chen',
      applicantHeadline: 'React Specialist',
      proposedBudget: 4200,
      appliedDate: '2024-01-12',
      status: 'pending',
      rating: 4.9
    }
  ];

  useEffect(() => {
    if (user?.userType === 'company') {
      setProjects(mockProjects);
      setApplications(mockApplications);
      setAnalytics({
        totalProjects: 15,
        activeProjects: 5,
        totalApplications: 47,
        completedProjects: 8,
        totalSpent: 45000,
        avgProjectValue: 3750
      });
    }
  }, [user]);

  if (user?.userType !== 'company') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Dashboard</h2>
          <p className="text-gray-600 mb-6">This dashboard is only available for company accounts.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-pink-700"
          >
            Go to Regular Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.profile?.companyName || 'Company'}!</p>
          </div>
          <button
            onClick={() => navigate('/post-project')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Post New Project</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">${analytics.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-purple-600 hover:text-purple-700 text-sm"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{project.applications} applications</span>
                    <span>${project.budget.min} - ${project.budget.max}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Posted: {project.postedDate}</span>
                    <div className="flex space-x-2">
                      <button className="text-purple-600 hover:text-purple-700">
                        <Eye size={16} />
                      </button>
                      <button className="text-purple-600 hover:text-purple-700">
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              <button className="text-purple-600 hover:text-purple-700 text-sm">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{application.applicantName}</h4>
                      <p className="text-sm text-gray-600">{application.applicantHeadline}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="text-yellow-500" size={16} />
                      <span className="text-sm font-medium">{application.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Applied for: {application.projectTitle}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">${application.proposedBudget}</span>
                    <div className="flex space-x-2">
                      <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">
                        Accept
                      </button>
                      <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Project Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="text-sm font-medium">4.7/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PieChart className="mr-2" size={20} />
            Budget Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Project Value</span>
              <span className="text-sm font-medium">${analytics.avgProjectValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Budget Allocated</span>
              <span className="text-sm font-medium">${analytics.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Payments</span>
              <span className="text-sm font-medium text-orange-600">$12,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/post-project')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Plus className="text-purple-600 mb-2" size={24} />
            <span className="text-sm font-medium">Post Project</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Search className="text-blue-600 mb-2" size={24} />
            <span className="text-sm font-medium">Find Talent</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <MessageCircle className="text-green-600 mb-2" size={24} />
            <span className="text-sm font-medium">Messages</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <BarChart3 className="text-orange-600 mb-2" size={24} />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
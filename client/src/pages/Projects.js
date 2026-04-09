import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, MapPin, DollarSign, Clock, Users, ExternalLink, Globe, Briefcase } from 'lucide-react';
import axios from 'axios';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [globalProjects, setGlobalProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    budget: '',
    location: '',
    showGlobal: false
  });

  useEffect(() => {
    fetchProjects();
    fetchGlobalProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalProjects = async () => {
    try {
      const skills = user?.profile?.skills?.join(',') || '';
      const response = await axios.get(`/api/discovery/global-projects?skills=${skills}`);
      setGlobalProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching global projects:', error);
    }
  };

  const handleApply = async (projectId, isGlobal = false) => {
    if (isGlobal) {
      alert('This will redirect you to the external platform to apply.');
      return;
    }

    try {
      const proposal = prompt('Enter your proposal:');
      const budget = prompt('Enter your proposed budget:');
      
      if (proposal && budget) {
        await axios.post(`/api/projects/${projectId}/apply`, {
          proposal,
          proposedBudget: parseFloat(budget)
        });
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Apply error:', error);
      alert('Failed to submit application');
    }
  };

  const ProjectCard = ({ project, isGlobal = false }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            {isGlobal && (
              <div className="flex items-center space-x-1">
                <Globe size={16} className="text-green-600" />
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {project.platform}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
          
          {/* Project Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <DollarSign size={16} />
                <span>${project.budget?.min} - ${project.budget?.max} {project.budget?.currency}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin size={16} />
                <span>{project.location || 'Remote'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>{project.applications || 0} applications</span>
              </div>
            </div>

            {/* Skills */}
            {project.skills && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {project.skills.length > 4 && (
                  <span className="text-xs text-gray-500">+{project.skills.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {isGlobal ? `Posted on ${project.platform}` : `Posted by ${project.company?.profile?.companyName || 'Company'}`}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleApply(project.id, isGlobal)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center space-x-1"
          >
            {isGlobal ? <ExternalLink size={16} /> : <Briefcase size={16} />}
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );

  const filteredProjects = projects.filter(project => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category && project.category !== filters.category) {
      return false;
    }
    return true;
  });

  const filteredGlobalProjects = globalProjects.filter(project => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Discover opportunities locally and globally</p>
          </div>
          {user?.userType === 'company' && (
            <button
              onClick={() => window.location.href = '/post-project'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-pink-700"
            >
              Post New Project
            </button>
          )}
        </div>
      </div>

      {/* Global Projects Toggle */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="mr-2" size={20} />
              Global Opportunities
            </h3>
            <p className="text-gray-600 text-sm">Discover projects from platforms worldwide</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showGlobal}
              onChange={(e) => setFilters({...filters, showGlobal: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search projects..."
              />
            </div>
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-app">Mobile App</option>
            <option value="data-science">Data Science</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            value={filters.budget}
            onChange={(e) => setFilters({...filters, budget: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Budgets</option>
            <option value="0-1000">$0 - $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000-10000">$5,000 - $10,000</option>
            <option value="10000+">$10,000+</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-8">
        {/* Global Projects */}
        {filters.showGlobal && filteredGlobalProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="mr-2" size={24} />
              Global Opportunities ({filteredGlobalProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGlobalProjects.map((project, index) => (
                <ProjectCard key={`global-${index}`} project={project} isGlobal={true} />
              ))}
            </div>
          </div>
        )}

        {/* Local Projects */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="mr-2" size={24} />
            Way Connect Projects ({filteredProjects.length})
          </h2>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project._id || project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filters.category 
                  ? 'Try adjusting your search criteria'
                  : 'No projects available at the moment. Check back later!'
                }
              </p>
              {user?.userType === 'company' && (
                <button
                  onClick={() => window.location.href = '/post-project'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-pink-700"
                >
                  Post the First Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

export default Projects;
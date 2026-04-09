import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Projects from './pages/Projects';
import Messages from './pages/Messages';
import Network from './pages/Network';
import PostProject from './pages/PostProject';
import Notifications from './pages/Notifications';
import CompanyDashboard from './pages/CompanyDashboard';
import SmartMatch from './pages/SmartMatch';
import SkillVerification from './pages/SkillVerification';
import CareerPath from './pages/CareerPath';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      
      <Routes>
        <Route 
          path="/auth" 
          element={!user ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/login" 
          element={!user ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/profile/:id?" 
          element={user ? <Profile /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/user/:userId" 
          element={user ? <UserProfile /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/projects" 
          element={user ? <Projects /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/messages" 
          element={user ? <Messages /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/network" 
          element={user ? <Network /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/post-project" 
          element={user ? <PostProject /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/notifications" 
          element={user ? <Notifications /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/company-dashboard" 
          element={user ? <CompanyDashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/smart-match" 
          element={user ? <SmartMatch /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/skill-verification" 
          element={user ? <SkillVerification /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/career-path" 
          element={user ? <CareerPath /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
        />
      </Routes>
    </div>
  );
}

export default App;
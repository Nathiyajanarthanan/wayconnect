import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Building } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    profile: {
      firstName: '',
      lastName: '',
      companyName: ''
    }
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setRegisterData({
        ...registerData,
        profile: {
          ...registerData.profile,
          [profileField]: value
        }
      });
    } else {
      setRegisterData({
        ...registerData,
        [name]: value
      });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData.email, loginData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      email: registerData.email,
      password: registerData.password,
      userType: registerData.userType,
      profile: registerData.profile
    });
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'student',
      profile: { firstName: '', lastName: '', companyName: '' }
    });
  };

  return (
    <div className="auth-container">
      <div className={`auth-wrapper ${isSignUp ? 'toggled' : ''}`}>
        {/* Sign In Panel */}
        <div className="credentials-panel signin">
          <h2 className="slide-element">Welcome Back</h2>
          
          {error && !isSignUp && (
            <div className="error-message slide-element">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="slide-element">
            <div className="field-wrapper slide-element">
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              <label>Email</label>
              <Mail className="field-icon" size={18} />
            </div>

            <div className="field-wrapper slide-element">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <label>Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="submit-button slide-element"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="switch-link slide-element">
              Don't have an account? 
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
                Sign Up
              </a>
            </div>
          </form>
        </div>

        {/* Sign Up Panel */}
        <div className="credentials-panel signup">
          <h2 className="slide-element">Create Account</h2>
          
          {error && isSignUp && (
            <div className="error-message slide-element">
              {error}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="slide-element">
            <div className="field-wrapper slide-element">
              <select
                name="userType"
                value={registerData.userType}
                onChange={handleRegisterChange}
                required
              >
                <option value="student">Student</option>
                <option value="employee">Employee/Freelancer</option>
                <option value="company">Company</option>
              </select>
              <label>I am a</label>
              <User className="field-icon" size={18} />
            </div>

            {registerData.userType === 'company' ? (
              <div className="field-wrapper slide-element">
                <input
                  type="text"
                  name="profile.companyName"
                  value={registerData.profile.companyName}
                  onChange={handleRegisterChange}
                  required
                />
                <label>Company Name</label>
                <Building className="field-icon" size={18} />
              </div>
            ) : (
              <div className="name-fields slide-element">
                <div className="field-wrapper half">
                  <input
                    type="text"
                    name="profile.firstName"
                    value={registerData.profile.firstName}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>First Name</label>
                  <User className="field-icon" size={18} />
                </div>
                <div className="field-wrapper half">
                  <input
                    type="text"
                    name="profile.lastName"
                    value={registerData.profile.lastName}
                    onChange={handleRegisterChange}
                    required
                  />
                  <label>Last Name</label>
                  <User className="field-icon" size={18} />
                </div>
              </div>
            )}

            <div className="field-wrapper slide-element">
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
              <label>Email</label>
              <Mail className="field-icon" size={18} />
            </div>

            <div className="field-wrapper slide-element">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
              <label>Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="field-wrapper slide-element">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
              />
              <label>Confirm Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="submit-button slide-element"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="switch-link slide-element">
              Already have an account? 
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
                Sign In
              </a>
            </div>
          </form>
        </div>

        {/* Welcome Sections */}
        <div className="welcome-section signin">
          <h2 className="slide-element">Hello, Friend!</h2>
          <p className="slide-element">
            Enter your personal details and start your journey with Way Connect
          </p>
        </div>

        <div className="welcome-section signup">
          <h2 className="slide-element">Welcome Back!</h2>
          <p className="slide-element">
            To keep connected with us please login with your personal info
          </p>
        </div>

        {/* Background Shapes */}
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>
      </div>

      <div className="footer">
        <p>© 2024 Way Connect. Built with ❤️ for connecting talent globally.</p>
      </div>
    </div>
  );
};

export default Auth;
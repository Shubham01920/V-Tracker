import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import axios from 'axios';

const Header = ({ onMenuClick, user }) => {
  const navigate = useNavigate();
  
  const getInitialUser = () => {
    if (user && user.name) return user;
    try {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { name: "V Tracker Admin", email: "admin@vtracker.app", initials: "VA" };
  };

  const [currentUser, setCurrentUser] = useState(getInitialUser());
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (document.body.classList.contains('sidebar-collapsed')) {
      setIsCollapsed(true);
    }

    // Live fetch admin profile from /v1/me
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';
        const res = await axios.get(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data?.data;
        if (data) {
          const updatedUser = {
            id: data.id,
            name: data.fullName || data.email,
            email: data.email,
            role: data.role,
            memberId: data.memberId,
            initials: (data.fullName || data.email || 'VA')
              .split(' ')
              .filter(Boolean)
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            raw: data
          };
          setCurrentUser(updatedUser);
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('Header profile fetch error:', err);
        // If 401, attempt silent refresh
        if (err.response?.status === 401) {
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (storedRefreshToken) {
            try {
              const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken: storedRefreshToken
              });
              const newTokens = refreshRes.data?.data;
              if (newTokens?.accessToken) {
                localStorage.setItem('accessToken', newTokens.accessToken);
                if (newTokens.refreshToken) {
                  localStorage.setItem('refreshToken', newTokens.refreshToken);
                }
                const retryRes = await axios.get(`${API_BASE_URL}/me`, {
                  headers: { Authorization: `Bearer ${newTokens.accessToken}` }
                });
                const d = retryRes.data?.data;
                if (d) {
                  const u = {
                    id: d.id,
                    name: d.fullName || d.email,
                    email: d.email,
                    role: d.role,
                    memberId: d.memberId,
                    initials: (d.fullName || d.email || 'VA')
                      .split(' ')
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase(),
                    raw: d
                  };
                  setCurrentUser(u);
                  localStorage.setItem('loggedInUser', JSON.stringify(u));
                }
              }
            } catch (rErr) {
              console.error('Header token refresh error:', rErr);
            }
          }
        }
      }
    };

    fetchAdminProfile();
  }, []);

  const name = currentUser?.name || "V Tracker Admin";
  const email = currentUser?.email || "admin@vtracker.app";
  const initials = currentUser?.initials || "VA";

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      if (onMenuClick) onMenuClick();
    } else {
      document.body.classList.toggle('sidebar-collapsed');
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <header className="sticky top-0 right-0 w-full z-30 flex justify-between items-center px-6 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center flex-1 gap-4">
        {/* Menu Toggle */}
        <button 
          onClick={handleToggle}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
        >
          <span className="lg:hidden"><Menu className="w-5 h-5" /></span>
          <span className="hidden lg:block">
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
        
        {/* Admin Profile Button */}
        <button 
          type="button"
          onClick={() => navigate('/profile')}
          title="Click to view Admin Profile"
          className="flex items-center gap-3 hover:bg-primary/5 active:scale-95 p-1.5 px-2 rounded-xl transition-all text-left cursor-pointer border border-transparent hover:border-gray-200 group"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center text-primary font-bold text-sm uppercase shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block overflow-hidden">
            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors truncate leading-tight">
              {name}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{email}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;

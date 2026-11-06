import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { KeyRound, Eye, EyeOff, Save, Lock } from 'lucide-react';

const ChangePassword = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    // Simulate API call
    setSuccess("Password changed successfully!");
    setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleShow = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Shared input styling: consistent height, single hairline border, left icon, right toggle
  const inputClasses =
    "w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#051c35]/20 focus:border-[#051c35] transition-all text-gray-900 text-sm placeholder:text-gray-400";

  const PasswordField = ({ label, name, field, placeholder, hint }) => (
    <div>
      <label className="block text-sm font-bold text-[#051c35] mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type={showPassword[field] ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className={inputClasses}
        />
        <button
          type="button"
          onClick={() => toggleShow(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content flex-1 lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header
          onMenuClick={toggleSidebar}
          user={location.state}
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#051c35]/10 flex items-center justify-center text-[#051c35]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 leading-tight">
                Change Password
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Update your account password securely
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 rounded-lg bg-green-50 text-green-600 text-sm font-medium border border-green-100">
                    {success}
                  </div>
                )}

                <PasswordField
                  label="Old Password"
                  name="oldPassword"
                  field="old"
                  placeholder="Enter current password"
                />

                <PasswordField
                  label="New Password"
                  name="newPassword"
                  field="new"
                  placeholder="Enter new password"
                  hint="Must be at least 6 characters long"
                />

                <PasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  field="confirm"
                  placeholder="Confirm new password"
                />

                <div className="pt-3 border-t border-gray-100 mt-6">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#051c35] text-white font-bold rounded-xl hover:bg-[#0a2540] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#051c35]/50 focus:ring-offset-2 cursor-pointer"
                  >
                    <Save className="w-5 h-5" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
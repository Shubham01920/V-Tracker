import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useWishlist } from '../../context/WishlistContext';
import {
  LayoutDashboard,
  Network,
  ChevronDown,
  Users,
  QrCode,
  Car,
  Heart,
  CreditCard,
  ShoppingCart,
  Share2,
  Ticket,
  Phone,
  Headset,
  FileText,
  X,
  LogOut,
  Loader2,
  Wallet,
  KeyRound
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMyTeamOpen, setIsMyTeamOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { unreadCount } = useWishlist();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (accessToken && refreshToken) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loggedInUser');
      toast.success('Logged out successfully');
      setIsLoggingOut(false);
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'User Management', icon: Users, path: '/users' },
    { name: 'QR Inventory', icon: QrCode, path: '/qr-inventory' },
    { name: 'Vehicles', icon: Car, path: '/vehicles' },
    { name: 'Wishlist', icon: Heart, path: '/wishlist', badge: unreadCount },
    { name: 'Plans', icon: CreditCard, path: '/plans' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Referrals', icon: Share2, path: '/referrals' },
    {
      name: 'My Team',
      icon: Network,
      isDropdown: true,
      subItems: [
        { name: 'User Referral Statistics', path: '/my-team/referral-statistics' },
        { name: 'Referral Payouts', path: '/my-team/referral-payouts' },
      ]
    },
    { name: 'Withdraw', icon: Wallet, path: '/withdraw' },
    { name: 'Coupons & Points', icon: Ticket, path: '/coupons' },
    { name: 'Call Logs', icon: Phone, path: '/call-logs' },
    { name: 'Change Password', icon: KeyRound, path: '/change-password' },
    { name: 'Support', icon: Headset, path: '/support' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col z-50 bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden w-[260px] 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Area */}
        <div className="px-6 py-6 flex items-center justify-between lg:justify-start gap-3 border-b border-gray-100 h-20">
          <div className="flex items-center gap-3 w-full [.sidebar-collapsed_&]:justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl shrink-0">
              V
            </div>
            <div className="[.sidebar-collapsed_&]:hidden overflow-hidden transition-all">
              <h1 className="font-heading font-bold text-primary tracking-wide whitespace-nowrap">V-TRACKER</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Enterprise Admin</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button className="lg:hidden text-gray-500 hover:text-primary" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide overflow-x-hidden">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            if (item.isDropdown) {
              const isChildActive = item.subItems.some(sub => location.pathname === sub.path);

              return (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => setIsMyTeamOpen(!isMyTeamOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer [.sidebar-collapsed_&]:justify-center [.sidebar-collapsed_&]:px-0 ${isChildActive || isMyTeamOpen
                      ? 'bg-primary/5 text-primary font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isChildActive || isMyTeamOpen ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                    <span className="text-sm [.sidebar-collapsed_&]:hidden whitespace-nowrap">{item.name}</span>
                    <ChevronDown className={`ml-auto w-4 h-4 transition-transform duration-200 [.sidebar-collapsed_&]:hidden ${isMyTeamOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMyTeamOpen && (
                    <div className="pl-12 pr-4 space-y-1 py-1 [.sidebar-collapsed_&]:hidden">
                      {item.subItems.map((sub, idx) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={idx}
                            to={sub.path}
                            onClick={onClose}
                            className={`block py-2 text-sm transition-colors cursor-pointer whitespace-nowrap ${isSubActive ? 'text-primary font-semibold' : 'text-gray-500 hover:text-primary'
                              }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer [.sidebar-collapsed_&]:justify-center [.sidebar-collapsed_&]:px-0 ${isActive
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                <span className="text-sm [.sidebar-collapsed_&]:hidden whitespace-nowrap">{item.name}</span>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-600 [.sidebar-collapsed_&]:hidden shrink-0">
                    {item.badge}
                  </span>
                )}
                
                {isActive && item.badge === undefined && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent [.sidebar-collapsed_&]:hidden shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group font-semibold cursor-pointer [.sidebar-collapsed_&]:justify-center [.sidebar-collapsed_&]:px-0 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-sm [.sidebar-collapsed_&]:hidden whitespace-nowrap">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

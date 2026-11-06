import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import QRInventory from './pages/QRInventory'
import Vehicles from './pages/Vehicles'
import VehicleDocuments from './pages/VehicleDocuments'
import Wishlist from './pages/Wishlist'
import Plans from './pages/Plans'
import Orders from './pages/Orders'
import OrderInvoicePage from './pages/OrderInvoicePage'
import Referrals from './pages/Referrals'
import Promotions from './pages/Promotions'
import CallLogs from './pages/CallLogs'
import Support from './pages/Support'
import Withdraw from './pages/Withdraw'
import WithdrawHistory from './pages/WithdrawHistory'
import UserReferralStatistics from './pages/UserReferralStatistics'
import ReferralPayouts from './pages/ReferralPayouts'
import ChangePassword from './pages/ChangePassword'
import AdminProfile from './pages/AdminProfile'
import { Toaster } from 'sonner'
import { WishlistProvider } from './context/WishlistContext'

const App = () => {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/qr-inventory" element={<QRInventory />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id/documents" element={<VehicleDocuments />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/invoice/:id" element={<OrderInvoicePage />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/coupons" element={<Promotions />} />
          <Route path="/call-logs" element={<CallLogs />} />
          <Route path="/support" element={<Support />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/withdraw-history" element={<WithdrawHistory />} />
          <Route path="/my-team/referral-statistics" element={<UserReferralStatistics />} />
          <Route path="/my-team/referral-payouts" element={<ReferralPayouts />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<AdminProfile />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </WishlistProvider>
    </BrowserRouter>
  )
}

export default App
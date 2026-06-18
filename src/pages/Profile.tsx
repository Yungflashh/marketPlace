import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Eye, EyeOff, Wallet, Calendar, Shield, Crown, Edit2, Check, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  if (!user) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSavingName(true);
    try {
      const res = await api.patch('/auth/update-profile', { name: nameValue.trim() });
      updateUser({ name: res.data.data.user.name });
      toast.success('Name updated');
      setEditingName(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating name');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelName = () => {
    setNameValue(user.name);
    setEditingName(false);
  };

  const pwStrength =
    pwData.newPassword.length >= 10 ? 'strong'
    : pwData.newPassword.length >= 6 ? 'medium'
    : 'weak';

  const strengthColor =
    pwStrength === 'strong' ? 'bg-green-500'
    : pwStrength === 'medium' ? 'bg-yellow-400'
    : 'bg-red-400';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      toast.success('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setSavingPw(false);
    }
  };

  const INPUT_CLS = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <User className="w-7 h-7 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          <p className="text-gray-500 text-sm ml-10">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelName(); }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {savingName ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                  <button
                    onClick={() => { setNameValue(user.name); setEditingName(true); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                {user.role === 'admin'
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white text-xs font-semibold rounded-full"><Crown className="w-3 h-3" /> Admin</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"><User className="w-3 h-3" /> User</span>
                }
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-xs">Email</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs">Wallet Balance</span>
              </div>
              <p className="text-lg font-bold text-gray-900">${user.walletBalance.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">Member Since</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwData.currentPassword}
                  onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  placeholder="Enter current password"
                  className={`${INPUT_CLS} pl-10 pr-10`}
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwData.newPassword}
                  onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  placeholder="Minimum 6 characters"
                  className={`${INPUT_CLS} pl-10 pr-10`}
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwData.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-0.5 flex-1 rounded-full ${strengthColor}`} />
                    <div className={`h-0.5 flex-1 rounded-full ${pwStrength !== 'weak' ? strengthColor : 'bg-gray-200'}`} />
                    <div className={`h-0.5 flex-1 rounded-full ${pwStrength === 'strong' ? strengthColor : 'bg-gray-200'}`} />
                  </div>
                  <p className={`text-xs mt-1 capitalize ${pwStrength === 'strong' ? 'text-green-600' : pwStrength === 'medium' ? 'text-yellow-600' : 'text-red-500'}`}>
                    {pwStrength} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={pwData.confirmPassword}
                  onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  placeholder="Re-enter new password"
                  className={`${INPUT_CLS} pl-10 pr-10`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwData.confirmPassword && (
                <p className={`text-xs mt-1 ${pwData.newPassword === pwData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {pwData.newPassword === pwData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPw}
              className="w-full bg-gray-900 text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {savingPw ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

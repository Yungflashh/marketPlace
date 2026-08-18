import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Eye, EyeOff, Wallet, Calendar, Shield, Crown, Edit2, Check, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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

  const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

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

  const strengthTone = pwStrength === 'strong' ? 'bg-success' : pwStrength === 'medium' ? 'bg-warning' : 'bg-error';
  const strengthText = pwStrength === 'strong' ? 'text-success' : pwStrength === 'medium' ? 'text-warning' : 'text-error';

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

  const PwToggle: React.FC<{ show: boolean; onClick: () => void }> = ({ show, onClick }) => (
    <button type="button" onClick={onClick} className="text-ink-muted hover:text-ink-soft transition-colors">
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="bg-canvas py-6 sm:py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <User className="w-6 h-6 text-primary" />
            <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-ink">My profile</h1>
          </div>
          <p className="text-ink-muted text-[13px] ml-9">Manage your account information</p>
        </div>

        <Card className="mb-4">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="!h-9 !text-[13px] font-medium"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelName(); }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="w-9 h-9 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {savingName ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="w-9 h-9 shrink-0 rounded-full bg-surface-hover text-ink-soft flex items-center justify-center hover:bg-border transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="font-display text-[17px] font-bold text-ink">{user.name}</h2>
                  <button
                    onClick={() => { setNameValue(user.name); setEditingName(true); }}
                    className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-ink transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {user.role === 'admin' ? (
                  <Badge tone="accent"><Crown className="w-3 h-3" /> Admin</Badge>
                ) : (
                  <Badge tone="neutral"><User className="w-3 h-3" /> User</Badge>
                )}
                <Badge tone={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
              <div className="flex items-center gap-2 text-ink-muted mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-[11px]">Email</span>
              </div>
              <p className="text-[13px] font-medium text-ink truncate">{user.email}</p>
            </div>
            <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
              <div className="flex items-center gap-2 text-ink-muted mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-[11px]">Wallet balance</span>
              </div>
              <p className="font-display text-[16px] font-bold text-ink">${user.walletBalance.toFixed(2)}</p>
            </div>
            <div className="bg-surface-hover rounded-[var(--radius-md)] p-4">
              <div className="flex items-center gap-2 text-ink-muted mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px]">Member since</span>
              </div>
              <p className="text-[13px] font-medium text-ink">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4.5 h-4.5 text-primary" />
            <h3 className="font-display text-[15px] font-bold text-ink">Change password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Current password</label>
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={pwData.currentPassword}
                onChange={(e) => setPwData((p) => ({ ...p, currentPassword: e.target.value }))}
                required
                placeholder="Enter current password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={<PwToggle show={showCurrent} onClick={() => setShowCurrent((v) => !v)} />}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">New password</label>
              <Input
                type={showNew ? 'text' : 'password'}
                value={pwData.newPassword}
                onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))}
                required
                placeholder="Minimum 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={<PwToggle show={showNew} onClick={() => setShowNew((v) => !v)} />}
              />
              {pwData.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-0.5 flex-1 rounded-full ${strengthTone}`} />
                    <div className={`h-0.5 flex-1 rounded-full ${pwStrength !== 'weak' ? strengthTone : 'bg-border'}`} />
                    <div className={`h-0.5 flex-1 rounded-full ${pwStrength === 'strong' ? strengthTone : 'bg-border'}`} />
                  </div>
                  <p className={`text-[11px] mt-1 capitalize ${strengthText}`}>{pwStrength} password</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Confirm new password</label>
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={pwData.confirmPassword}
                onChange={(e) => setPwData((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={<PwToggle show={showConfirm} onClick={() => setShowConfirm((v) => !v)} />}
              />
              {pwData.confirmPassword && (
                <p className={`text-[11px] mt-1 ${pwData.newPassword === pwData.confirmPassword ? 'text-success' : 'text-error'}`}>
                  {pwData.newPassword === pwData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button type="submit" loading={savingPw} fullWidth>
              {savingPw ? 'Saving...' : 'Update password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

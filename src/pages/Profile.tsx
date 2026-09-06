import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Eye, EyeOff, Wallet, Calendar, Shield, Crown, Edit2, Check, X, Users as UsersIcon, Copy, Share2, Phone, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  // Contact info (phone + address) — new fields that unlock the "profile completed" event on the backend.
  const [phoneValue, setPhoneValue] = useState(user?.phone ?? '');
  const [addressValue, setAddressValue] = useState(user?.address ?? '');
  const [savingContact, setSavingContact] = useState(false);
  useEffect(() => {
    setPhoneValue(user?.phone ?? '');
    setAddressValue(user?.address ?? '');
  }, [user?.phone, user?.address]);
  const contactDirty =
    phoneValue.trim() !== (user?.phone ?? '') || addressValue.trim() !== (user?.address ?? '');
  const contactComplete = Boolean((user?.phone ?? '').trim() && (user?.address ?? '').trim());

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [referral, setReferral] = useState<{ referralCode: string; referralsCount: number; rewardsEarned: number; rewardAmount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const [emailStep, setEmailStep] = useState<'idle' | 'otp'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/auth/referral');
        if (!cancelled) setReferral(res.data.data);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const handleSaveContact = async () => {
    setSavingContact(true);
    try {
      const res = await api.patch('/auth/update-profile', {
        phone: phoneValue.trim(),
        address: addressValue.trim(),
      });
      updateUser({
        phone: res.data.data.user.phone,
        address: res.data.data.user.address,
      });
      toast.success('Contact info saved');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving contact info');
    } finally {
      setSavingContact(false);
    }
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

  const referralLink = referral
    ? `${window.location.origin}/register?ref=${referral.referralCode}`
    : '';

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — long-press to copy manually');
    }
  };

  const shareReferral = async () => {
    if (!referralLink) return;
    const shareData = {
      title: 'Join me on ShopLogs',
      text: `Sign up with my code ${referral?.referralCode} and we both get $${referral?.rewardAmount} 🎁`,
      url: referralLink,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* dismissed */ }
    } else {
      copyReferralLink();
    }
  };

  const requestEmailChange = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setEmailBusy(true);
    try {
      await api.post('/auth/change-email/request', { newEmail: email });
      toast.success('Check the new email for a 6-digit code');
      setEmailStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not request email change');
    } finally {
      setEmailBusy(false);
    }
  };

  const confirmEmailChange = async () => {
    if (!emailOtp.trim()) {
      toast.error('Enter the verification code');
      return;
    }
    setEmailBusy(true);
    try {
      const res = await api.post('/auth/change-email/confirm', { otp: emailOtp.trim() });
      updateUser({ email: res.data.data.user.email });
      toast.success('Email updated');
      setEmailStep('idle');
      setNewEmail('');
      setEmailOtp('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setEmailBusy(false);
    }
  };

  const cancelEmailChange = () => {
    setEmailStep('idle');
    setNewEmail('');
    setEmailOtp('');
  };

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

        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-display text-[15px] font-bold text-ink">Contact information</h3>
            </div>
            {contactComplete ? (
              <Badge tone="success"><Check className="w-3 h-3" /> Complete</Badge>
            ) : (
              <Badge tone="warning">Incomplete</Badge>
            )}
          </div>
          <p className="text-[12.5px] text-ink-muted mb-4">
            Add your phone and delivery address so we can reach you about orders.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Phone</label>
              <Input
                type="tel"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                placeholder="+1 555 000 1234"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Delivery address</label>
              <textarea
                value={addressValue}
                onChange={(e) => setAddressValue(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Street, city, state/region, ZIP, country"
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-surface text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <p className="text-[11px] text-ink-muted mt-1">{addressValue.length}/300</p>
            </div>
            <Button
              onClick={handleSaveContact}
              loading={savingContact}
              disabled={savingContact || !contactDirty}
              fullWidth
            >
              {savingContact ? 'Saving…' : 'Save contact info'}
            </Button>
          </div>
        </Card>

        {referral && (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-4 h-4 text-primary" />
              <h3 className="font-display text-[15px] font-bold text-ink">Invite friends, earn ${referral.rewardAmount}</h3>
            </div>
            <p className="text-[12.5px] text-ink-muted mb-4 leading-relaxed">
              Share your code. When a friend signs up and verifies their email, you both get <span className="font-semibold text-ink">${referral.rewardAmount}</span> credited to your wallet.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-1">Friends joined</p>
                <p className="font-display text-[18px] font-bold text-ink">{referral.referralsCount}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-1">Rewards paid</p>
                <p className="font-display text-[18px] font-bold text-ink">{referral.rewardsEarned}</p>
              </div>
              <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-1">Earned</p>
                <p className="font-display text-[18px] font-bold text-primary">${(referral.rewardsEarned * referral.rewardAmount).toFixed(0)}</p>
              </div>
            </div>

            <div className="bg-surface-hover rounded-[var(--radius-md)] p-3 flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-0.5">Your code</p>
                <p className="font-mono text-[16px] font-bold tracking-wider text-ink">{referral.referralCode}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={copyReferralLink}
                  aria-label="Copy referral link"
                  className="w-9 h-9 rounded-[var(--radius-sm)] bg-primary text-on-primary hover:bg-primary-hover flex items-center justify-center transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={shareReferral}
                  aria-label="Share referral link"
                  className="w-9 h-9 rounded-[var(--radius-sm)] bg-surface border border-border text-ink-soft hover:border-border-strong flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-ink-muted truncate">
              Link: <span className="text-ink-soft">{referralLink}</span>
            </div>
          </Card>
        )}

        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <h3 className="font-display text-[15px] font-bold text-ink">Change email</h3>
          </div>

          {emailStep === 'idle' && (
            <>
              <p className="text-[12.5px] text-ink-muted mb-3">
                Current: <span className="font-medium text-ink">{user.email}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  className="flex-1"
                />
                <Button onClick={requestEmailChange} loading={emailBusy} disabled={emailBusy || !newEmail.trim()}>
                  Send code
                </Button>
              </div>
            </>
          )}

          {emailStep === 'otp' && (
            <>
              <p className="text-[12.5px] text-ink-muted mb-3">
                Enter the 6-digit code sent to <span className="font-medium text-ink">{newEmail}</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Input
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  className="flex-1 tracking-widest font-mono text-center"
                />
                <Button onClick={confirmEmailChange} loading={emailBusy} disabled={emailBusy || emailOtp.length < 4}>
                  Confirm
                </Button>
              </div>
              <button onClick={cancelEmailChange} className="text-[11.5px] text-ink-muted hover:text-ink transition-colors">
                Cancel and go back
              </button>
            </>
          )}
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

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Sparkles, Send, Save, Eye, Users, Search, X, Loader2,
  Mail, Info, AlertTriangle, CheckCircle2, Palette, Monitor,
} from 'lucide-react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import Dialog from '../../components/ui/Dialog';
import PageLoader from '../../components/ui/PageLoader';

type RecipientType = 'all' | 'segment' | 'individual' | 'external';
type Template = 'newsletter' | 'promo' | 'announcement' | 'restock' | 'thank-you' | 'reengagement' | 'custom';
type Layout = 'branded' | 'simple' | 'minimal';

interface Design {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerText: string;
  layout: Layout;
}

interface Recipients {
  type: RecipientType;
  filters: {
    role?: 'user' | 'admin' | '';
    isVerified?: boolean | '';
    isActive?: boolean | '';
    hasOrderedInLastDays?: number | '';
    hasNotOrderedInLastDays?: number | '';
  };
  userIds: string[];
  externalEmails: string[];
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface RecipientPreview {
  total: number;
  sample: { email: string; name: string }[];
}

interface Campaign {
  _id: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'failed';
  template: Template;
  aiPrompt?: string;
  recipients: Recipients;
  design?: Design;
  sendResults?: { total: number; succeeded: number; failed: number; details?: { email: string; status: string; error?: string }[] };
}

const COLOR_PRESETS: { name: string; accentColor: string; backgroundColor: string; textColor: string }[] = [
  { name: 'Charcoal', accentColor: '#111827', backgroundColor: '#f9fafb', textColor: '#374151' },
  { name: 'Teal', accentColor: '#0f766e', backgroundColor: '#f0fdfa', textColor: '#134e4a' },
  { name: 'Amber', accentColor: '#b45309', backgroundColor: '#fffbeb', textColor: '#78350f' },
  { name: 'Indigo', accentColor: '#1e40af', backgroundColor: '#eff6ff', textColor: '#1e3a8a' },
  { name: 'Rose', accentColor: '#be185d', backgroundColor: '#fdf2f8', textColor: '#831843' },
  { name: 'Forest', accentColor: '#166534', backgroundColor: '#f0fdf4', textColor: '#14532d' },
];

const defaultDesign: Design = {
  accentColor: '#111827',
  backgroundColor: '#f9fafb',
  textColor: '#374151',
  headerText: 'ShopLogs',
  layout: 'branded',
};

const TEMPLATE_OPTIONS: { value: Template; label: string; hint: string }[] = [
  { value: 'custom', label: 'Custom', hint: 'Free-form, tone matches your prompt' },
  { value: 'newsletter', label: 'Newsletter', hint: 'Warm updates with a few highlights' },
  { value: 'promo', label: 'Promotion', hint: 'Punchy, single call-to-action' },
  { value: 'announcement', label: 'Announcement', hint: 'Direct, professional' },
  { value: 'restock', label: 'Restock alert', hint: 'Excited notification about new stock' },
];

const defaultRecipients: Recipients = {
  type: 'all',
  filters: { role: '', isVerified: '', isActive: true },
  userIds: [],
  externalEmails: [],
};

const RECIPIENT_TYPE_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: 'all', label: 'All active users' },
  { value: 'segment', label: 'Segment (filters)' },
  { value: 'individual', label: 'Pick users' },
  { value: 'external', label: 'External emails' },
];

const AdminEmailComposer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState<Template>('custom');
  const [aiPrompt, setAiPrompt] = useState('');
  const [recipients, setRecipients] = useState<Recipients>(defaultRecipients);
  const [design, setDesign] = useState<Design>(defaultDesign);
  const [sendResults, setSendResults] = useState<Campaign['sendResults']>();
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [fullPreviewHtml, setFullPreviewHtml] = useState('');
  const [fullPreviewLoading, setFullPreviewLoading] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [pickedUsers, setPickedUsers] = useState<UserOption[]>([]);
  const [externalInput, setExternalInput] = useState('');

  const [recipientPreview, setRecipientPreview] = useState<RecipientPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreviewPane, setShowPreviewPane] = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/admin/emails/${id}`);
        const c: Campaign = res.data?.data?.campaign;
        setSubject(c.subject);
        setBody(c.body);
        setTemplate(c.template);
        setAiPrompt(c.aiPrompt || '');
        setRecipients({
          ...defaultRecipients,
          ...c.recipients,
          filters: { ...defaultRecipients.filters, ...(c.recipients?.filters || {}) },
          userIds: c.recipients?.userIds || [],
          externalEmails: c.recipients?.externalEmails || [],
        });
        if (c.design) setDesign({ ...defaultDesign, ...c.design });
        setSendResults(c.sendResults);
        setReadOnly(c.status === 'sent');
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error loading campaign';
        toast.error(message);
        navigate('/admin/emails');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (recipients.type !== 'individual') return;
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/admin/emails/users/search', { params: { q: userSearch } });
        setUserResults(res.data?.data?.users || []);
      } catch {
        setUserResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [userSearch, recipients.type]);

  useEffect(() => {
    if (!pickedUsers.length) return;
    setRecipients((r) => ({ ...r, userIds: pickedUsers.map((u) => u._id) }));
  }, [pickedUsers]);

  const inlinePreviewSrcDoc = useMemo(() => {
    const rendered = (body || '<p style="color:#9ca3af">(empty body)</p>').replaceAll('{{name}}', 'there');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:20px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:${design.textColor};background:${design.backgroundColor};word-wrap:break-word;overflow-wrap:break-word}p{margin:0 0 12px}img{max-width:100%;height:auto}a{color:${design.accentColor}}</style></head><body>${rendered}</body></html>`;
  }, [body, design.textColor, design.backgroundColor, design.accentColor]);

  const cleanRecipientsForBackend = useMemo(() => {
    const cleaned: Recipients = { ...recipients };
    if (recipients.type !== 'segment') {
      cleaned.filters = {};
    } else {
      const f: Recipients['filters'] = {};
      if (recipients.filters.role) f.role = recipients.filters.role;
      if (typeof recipients.filters.isVerified === 'boolean') f.isVerified = recipients.filters.isVerified;
      if (typeof recipients.filters.isActive === 'boolean') f.isActive = recipients.filters.isActive;
      if (typeof recipients.filters.hasOrderedInLastDays === 'number' && recipients.filters.hasOrderedInLastDays > 0)
        f.hasOrderedInLastDays = recipients.filters.hasOrderedInLastDays;
      if (typeof recipients.filters.hasNotOrderedInLastDays === 'number' && recipients.filters.hasNotOrderedInLastDays > 0)
        f.hasNotOrderedInLastDays = recipients.filters.hasNotOrderedInLastDays;
      cleaned.filters = f;
    }
    if (recipients.type !== 'individual') cleaned.userIds = [];
    if (recipients.type !== 'external') cleaned.externalEmails = [];
    return cleaned;
  }, [recipients]);

  const runRecipientPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await api.post('/admin/emails/preview-recipients', { recipients: cleanRecipientsForBackend });
      setRecipientPreview(res.data?.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error resolving recipients';
      toast.error(message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Describe the email you want the AI to draft');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/admin/emails/generate', { prompt: aiPrompt, template, audienceHint: describeAudience(recipients) });
      const draft = res.data?.data?.draft;
      if (draft) {
        setSubject(draft.subject);
        setBody(draft.body);
        toast.success('AI draft ready — review before sending');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'AI drafting failed';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const validate = (): string | null => {
    if (!subject.trim()) return 'Subject is required';
    if (!body.trim()) return 'Body is required';
    if (recipients.type === 'individual' && !pickedUsers.length && !recipients.userIds.length) return 'Pick at least one user';
    if (recipients.type === 'external' && recipients.externalEmails.length === 0) return 'Add at least one external email';
    return null;
  };

  const handleSaveDraft = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const payload = { subject, body, template, aiPrompt: aiPrompt || undefined, recipients: cleanRecipientsForBackend, design };
      if (isEdit) {
        await api.put(`/admin/emails/${id}`, payload);
        toast.success('Draft saved');
      } else {
        const res = await api.post('/admin/emails', payload);
        const newId = res.data?.data?.campaign?._id;
        toast.success('Draft saved');
        if (newId) navigate(`/admin/emails/${newId}`, { replace: true });
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving draft';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSendModal = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (!isEdit) {
      await handleSaveDraft();
    }
    await runRecipientPreview();
    setShowSendModal(true);
  };

  const handleConfirmSend = async () => {
    if (!id || id === 'new') {
      toast.error('Save the draft first');
      return;
    }
    setSending(true);
    try {
      const res = await api.post(`/admin/emails/${id}/send`);
      toast.success(res.data?.message || 'Campaign sent');
      setShowSendModal(false);
      navigate('/admin/emails');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error sending campaign';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const openFullPreview = async () => {
    setShowFullPreview(true);
    setFullPreviewLoading(true);
    try {
      const res = await api.post('/admin/emails/preview-html', { body, design, name: 'there' });
      setFullPreviewHtml(res.data?.data?.html || '');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to render preview';
      toast.error(message);
      setFullPreviewHtml('');
    } finally {
      setFullPreviewLoading(false);
    }
  };

  const applyColorPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setDesign((d) => ({ ...d, accentColor: preset.accentColor, backgroundColor: preset.backgroundColor, textColor: preset.textColor }));
  };

  const addExternalEmail = () => {
    const v = externalInput.trim().toLowerCase();
    if (!v) return;
    if (!/^\S+@\S+\.\S+$/.test(v)) return toast.error('Invalid email');
    if (recipients.externalEmails.includes(v)) return toast.error('Already added');
    setRecipients((r) => ({ ...r, externalEmails: [...r.externalEmails, v] }));
    setExternalInput('');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/emails')}
            className="w-9 h-9 rounded-full hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-[19px] sm:text-[22px] font-bold text-ink">
              {readOnly ? 'View sent campaign' : isEdit ? 'Edit email' : 'New email'}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-ink-muted">
              {readOnly ? 'This campaign has already been sent and cannot be edited.' : 'Draft, preview, then approve before sending.'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
          <Button variant="secondary" onClick={openFullPreview} icon={<Monitor className="w-4 h-4" />}>
            <span className="hidden sm:inline">Full preview</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          {!readOnly && (
            <>
              <Button variant="secondary" onClick={handleSaveDraft} loading={saving} icon={<Save className="w-4 h-4" />}>
                Save draft
              </Button>
              <Button
                onClick={handleOpenSendModal}
                disabled={saving || sending}
                icon={<Send className="w-4 h-4" />}
                className="col-span-2 lg:col-span-1"
              >
                Review & send
              </Button>
            </>
          )}
        </div>
      </div>

      {sendResults && (
        <Card className="mb-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div className="text-[13px]">
            <span className="font-medium text-ink">Delivered {sendResults.succeeded} of {sendResults.total}</span>
            {sendResults.failed > 0 && <span className="text-error ml-2">({sendResults.failed} failed)</span>}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!readOnly && (
            <Card>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display font-bold text-ink text-[14px]">AI drafting</h2>
                <Badge tone="neutral">Optional</Badge>
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:gap-3 mb-3">
                <Select value={template} onChange={(e) => setTemplate(e.target.value as Template)} className="sm:col-span-2 truncate">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label} — {t.hint}</option>
                  ))}
                </Select>
                <Button onClick={handleGenerate} loading={generating} icon={<Sparkles className="w-4 h-4" />} className="sm:col-span-3">
                  {generating ? 'Generating…' : 'Generate draft'}
                </Button>
              </div>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the email: e.g. 'Announce our summer sale, 15% off all logs this weekend only, keep it warm and casual.'"
                rows={3}
              />
              <p className="text-[11.5px] text-ink-muted mt-2 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Use <code className="bg-surface-hover px-1 rounded">{'{{name}}'}</code> anywhere in the body to personalize with each recipient's first name.
              </p>
            </Card>
          )}

          <Card padded={false}>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
              <h2 className="font-display font-bold text-ink text-[14px]">Email content</h2>
              <button onClick={() => setShowPreviewPane((v) => !v)} className="text-[12px] text-ink-muted hover:text-ink flex items-center gap-1 transition-colors">
                <Eye className="w-3.5 h-3.5" />
                {showPreviewPane ? 'Hide preview' : 'Show preview'}
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5 uppercase tracking-wide">Subject</label>
                <Input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={readOnly} placeholder="Your email subject" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5 uppercase tracking-wide">Body (HTML)</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={readOnly}
                  rows={14}
                  placeholder="<p>Hi {{name}},</p><p>Your message here.</p>"
                  className="font-mono"
                />
              </div>
            </div>
          </Card>

          {showPreviewPane && (
            <Card padded={false}>
              <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center gap-2 flex-wrap">
                <Eye className="w-4 h-4 text-ink-muted" />
                <h2 className="font-display font-bold text-ink text-[14px]">Preview</h2>
                <span className="text-[10px] uppercase tracking-wider text-ink-muted hidden sm:inline">{'{{name}}'} shown as "there"</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
                  <div className="bg-surface-hover px-4 py-2.5 border-b border-border">
                    <p className="text-[11px] text-ink-muted">Subject</p>
                    <p className="text-[13px] font-medium text-ink">{(subject || '(no subject)').replaceAll('{{name}}', 'there')}</p>
                  </div>
                  <iframe title="Inline email preview" srcDoc={inlinePreviewSrcDoc} sandbox="" className="w-full h-80 border-0 bg-white block" />
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-display font-bold text-ink text-[14px]">Recipients</h2>
            </div>

            <div className="space-y-2 mb-4">
              {RECIPIENT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer border transition-colors ${
                    recipients.type === opt.value ? 'border-primary bg-primary-soft' : 'border-border hover:border-border-strong'
                  } ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name="rtype"
                    value={opt.value}
                    checked={recipients.type === opt.value}
                    onChange={() => setRecipients((r) => ({ ...r, type: opt.value }))}
                    className="accent-[var(--vault-primary)]"
                  />
                  <span className="text-[13px] text-ink-soft">{opt.label}</span>
                </label>
              ))}
            </div>

            {recipients.type === 'segment' && (
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <label className="block text-[11.5px] text-ink-muted mb-1">Role</label>
                  <Select
                    value={recipients.filters.role || ''}
                    onChange={(e) => setRecipients((r) => ({ ...r, filters: { ...r.filters, role: e.target.value as 'user' | 'admin' | '' } }))}
                  >
                    <option value="">Any</option>
                    <option value="user">Users only</option>
                    <option value="admin">Admins only</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-ink-muted mb-1">Verified</label>
                  <Select
                    value={recipients.filters.isVerified === '' || recipients.filters.isVerified === undefined ? '' : String(recipients.filters.isVerified)}
                    onChange={(e) => setRecipients((r) => ({ ...r, filters: { ...r.filters, isVerified: e.target.value === '' ? '' : e.target.value === 'true' } }))}
                  >
                    <option value="">Any</option>
                    <option value="true">Verified only</option>
                    <option value="false">Unverified only</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-ink-muted mb-1">Active</label>
                  <Select
                    value={recipients.filters.isActive === '' || recipients.filters.isActive === undefined ? '' : String(recipients.filters.isActive)}
                    onChange={(e) => setRecipients((r) => ({ ...r, filters: { ...r.filters, isActive: e.target.value === '' ? '' : e.target.value === 'true' } }))}
                  >
                    <option value="">Any</option>
                    <option value="true">Active only</option>
                    <option value="false">Deactivated only</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-ink-muted mb-1">Ordered in last N days (recent buyers)</label>
                  <Input
                    type="number"
                    min={0}
                    value={recipients.filters.hasOrderedInLastDays ?? ''}
                    onChange={(e) => setRecipients((r) => ({ ...r, filters: { ...r.filters, hasOrderedInLastDays: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    placeholder="e.g. 7"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] text-ink-muted mb-1">Has NOT ordered in last N days (dormant)</label>
                  <Input
                    type="number"
                    min={0}
                    value={recipients.filters.hasNotOrderedInLastDays ?? ''}
                    onChange={(e) => setRecipients((r) => ({ ...r, filters: { ...r.filters, hasNotOrderedInLastDays: e.target.value === '' ? '' : Number(e.target.value) } }))}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
            )}

            {recipients.type === 'individual' && (
              <div className="space-y-3 border-t border-border pt-4">
                <Input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users…"
                  leftIcon={<Search className="w-4 h-4" />}
                />
                {userResults.length > 0 && (
                  <div className="border border-border rounded-[var(--radius-md)] max-h-40 overflow-y-auto vault-scroll">
                    {userResults.map((u) => {
                      const selected = pickedUsers.some((p) => p._id === u._id);
                      return (
                        <button
                          key={u._id}
                          onClick={() => {
                            if (selected) setPickedUsers((prev) => prev.filter((p) => p._id !== u._id));
                            else setPickedUsers((prev) => [...prev, u]);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-surface-hover transition-colors ${selected ? 'bg-surface-hover' : ''}`}
                        >
                          <div>
                            <p className="text-ink">{u.name}</p>
                            <p className="text-[11px] text-ink-muted">{u.email}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {pickedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pickedUsers.map((u) => (
                      <span key={u._id} className="inline-flex items-center gap-1 bg-surface-hover text-ink-soft text-[11.5px] px-2 py-1 rounded-full">
                        {u.name}
                        <button onClick={() => setPickedUsers((prev) => prev.filter((p) => p._id !== u._id))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recipients.type === 'external' && (
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={externalInput}
                    onChange={(e) => setExternalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalEmail())}
                    placeholder="name@example.com"
                    className="flex-1"
                  />
                  <Button onClick={addExternalEmail}>Add</Button>
                </div>
                {recipients.externalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipients.externalEmails.map((email) => (
                      <span key={email} className="inline-flex items-center gap-1 bg-surface-hover text-ink-soft text-[11.5px] px-2 py-1 rounded-full">
                        {email}
                        <button onClick={() => setRecipients((r) => ({ ...r, externalEmails: r.externalEmails.filter((e) => e !== email) }))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!readOnly && (
              <Button variant="secondary" fullWidth onClick={runRecipientPreview} loading={previewLoading} icon={<Users className="w-3.5 h-3.5" />} size="sm" className="mt-4">
                {previewLoading ? 'Resolving…' : 'Preview recipients'}
              </Button>
            )}

            {recipientPreview && (
              <div className="mt-3 text-[12px] text-ink-soft bg-surface-hover rounded-[var(--radius-md)] p-3">
                <p className="font-medium text-ink mb-1">{recipientPreview.total} recipient{recipientPreview.total !== 1 ? 's' : ''}</p>
                {recipientPreview.sample.length > 0 && (
                  <ul className="space-y-0.5 max-h-32 overflow-y-auto vault-scroll">
                    {recipientPreview.sample.map((r) => (
                      <li key={r.email}>{r.name ? `${r.name} — ` : ''}{r.email}</li>
                    ))}
                  </ul>
                )}
                {recipientPreview.total > recipientPreview.sample.length && (
                  <p className="text-ink-muted mt-1">…and {recipientPreview.total - recipientPreview.sample.length} more</p>
                )}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="font-display font-bold text-ink text-[14px]">Design</h2>
            </div>

            <div className="mb-4">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-2">Presets</p>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_PRESETS.map((preset) => {
                  const active = design.accentColor === preset.accentColor && design.backgroundColor === preset.backgroundColor;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      disabled={readOnly}
                      title={preset.name}
                      className={`h-10 rounded-[var(--radius-md)] border transition-all overflow-hidden flex ${active ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border-strong'}`}
                    >
                      <span className="flex-1" style={{ background: preset.accentColor }} />
                      <span className="flex-1" style={{ background: preset.backgroundColor }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <ColorRow label="Accent (header + buttons)" value={design.accentColor} onChange={(v) => setDesign((d) => ({ ...d, accentColor: v }))} disabled={readOnly} />
              <ColorRow label="Background" value={design.backgroundColor} onChange={(v) => setDesign((d) => ({ ...d, backgroundColor: v }))} disabled={readOnly} />
              <ColorRow label="Body text" value={design.textColor} onChange={(v) => setDesign((d) => ({ ...d, textColor: v }))} disabled={readOnly} />
              <div>
                <label className="block text-[11.5px] text-ink-muted mb-1">Header text</label>
                <Input type="text" value={design.headerText} onChange={(e) => setDesign((d) => ({ ...d, headerText: e.target.value }))} disabled={readOnly} />
              </div>
              <div>
                <label className="block text-[11.5px] text-ink-muted mb-1">Layout</label>
                <Select value={design.layout} onChange={(e) => setDesign((d) => ({ ...d, layout: e.target.value as Layout }))} disabled={readOnly}>
                  <option value="branded">Branded — bold header</option>
                  <option value="simple">Simple — underline header</option>
                  <option value="minimal">Minimal — no card</option>
                </Select>
              </div>
            </div>

            <Button variant="secondary" fullWidth onClick={openFullPreview} icon={<Monitor className="w-3.5 h-3.5" />} size="sm" className="mt-4">
              See full preview
            </Button>
          </Card>
        </div>
      </div>

      <Dialog
        open={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        size="xl"
        title="Full email preview"
        description='Exactly what recipients will see (name shown as "there")'
        footer={<Button fullWidth onClick={() => setShowFullPreview(false)}>Close</Button>}
      >
        <div className="-mx-5 sm:-mx-6 -mt-4 sm:-mt-5 px-4 sm:px-6 py-3 border-b border-border bg-surface-hover mb-4">
          <div className="text-[11.5px] text-ink-muted truncate">
            <span className="font-medium text-ink-soft">From:</span> no-reply@shoplogshere.com
          </div>
          <div className="text-[11.5px] text-ink-muted mt-0.5 truncate">
            <span className="font-medium text-ink-soft">Subject:</span> {(subject || '(no subject)').replaceAll('{{name}}', 'there')}
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] overflow-hidden bg-surface-hover">
          {fullPreviewLoading ? (
            <div className="h-[55vh] sm:h-[60vh] flex items-center justify-center text-[13px] text-ink-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Rendering…
            </div>
          ) : (
            <iframe title="Email preview" srcDoc={fullPreviewHtml} className="w-full h-[55vh] sm:h-[60vh] border-0 bg-white" sandbox="" />
          )}
        </div>
      </Dialog>

      <Dialog
        open={showSendModal}
        onClose={() => { if (!sending) setShowSendModal(false); }}
        size="lg"
        hideClose
        footer={
          <>
            <Button variant="secondary" fullWidth onClick={() => setShowSendModal(false)} disabled={sending}>Cancel</Button>
            <Button fullWidth onClick={handleConfirmSend} disabled={sending || !recipientPreview || recipientPreview.total === 0} loading={sending} icon={<Send className="w-4 h-4" />}>
              {sending ? 'Sending…' : 'Send now'}
            </Button>
          </>
        }
      >
        <div className="-mx-5 sm:-mx-6 -mt-4 sm:-mt-5 px-5 sm:px-6 py-5 mb-5 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, #1B1930, #0B0B10)' }}>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-display font-bold text-white">Confirm before sending</h2>
            <p className="text-[12.5px] text-white/45">Review the recipients and content — sending cannot be undone.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-ink-muted mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide">Subject</p>
              <p className="text-[13px] font-medium text-ink">{subject}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-ink-muted mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-ink-muted uppercase tracking-wide">Recipients</p>
              {previewLoading ? (
                <p className="text-[13px] text-ink-muted flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Resolving…</p>
              ) : recipientPreview ? (
                <>
                  <p className="text-[13px] font-medium text-ink">{recipientPreview.total} recipient{recipientPreview.total !== 1 ? 's' : ''}</p>
                  {recipientPreview.sample.length > 0 && (
                    <ul className="mt-1.5 text-[11.5px] text-ink-muted space-y-0.5 max-h-40 overflow-y-auto vault-scroll">
                      {recipientPreview.sample.map((r) => (
                        <li key={r.email}>{r.name ? `${r.name} — ` : ''}{r.email}</li>
                      ))}
                    </ul>
                  )}
                  {recipientPreview.total > recipientPreview.sample.length && (
                    <p className="text-[11.5px] text-ink-muted mt-1">…and {recipientPreview.total - recipientPreview.sample.length} more</p>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-ink-muted">Preview unavailable</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-2">Body preview</p>
            <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
              <iframe title="Send confirmation body preview" srcDoc={inlinePreviewSrcDoc} sandbox="" className="w-full h-64 border-0 bg-white block" />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const ColorRow: React.FC<{ label: string; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-[11.5px] text-ink-muted mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-10 h-10 rounded-[var(--radius-md)] border border-border cursor-pointer disabled:cursor-not-allowed"
      />
      <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="flex-1 font-mono" />
    </div>
  </div>
);

const describeAudience = (r: Recipients): string => {
  if (r.type === 'all') return 'all active users of the ShopLogs marketplace';
  if (r.type === 'external') return 'external recipients (may not be registered users)';
  if (r.type === 'individual') return `${r.userIds.length} hand-picked users`;
  const parts: string[] = [];
  if (r.filters.role) parts.push(`role=${r.filters.role}`);
  if (typeof r.filters.isVerified === 'boolean') parts.push(r.filters.isVerified ? 'verified' : 'unverified');
  if (typeof r.filters.isActive === 'boolean') parts.push(r.filters.isActive ? 'active' : 'deactivated');
  if (typeof r.filters.hasOrderedInLastDays === 'number' && r.filters.hasOrderedInLastDays > 0) parts.push(`ordered in last ${r.filters.hasOrderedInLastDays}d`);
  if (typeof r.filters.hasNotOrderedInLastDays === 'number' && r.filters.hasNotOrderedInLastDays > 0) parts.push(`no order in ${r.filters.hasNotOrderedInLastDays}d`);
  return `segment: ${parts.join(', ') || 'no filters'}`;
};

export default AdminEmailComposer;

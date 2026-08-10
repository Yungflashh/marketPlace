import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Save,
  Eye,
  Users,
  Search,
  X,
  Loader2,
  Mail,
  Info,
  AlertTriangle,
  CheckCircle2,
  Palette,
  Monitor,
} from 'lucide-react';
import api from '../../utils/api';

type RecipientType = 'all' | 'segment' | 'individual' | 'external';
type Template =
  | 'newsletter'
  | 'promo'
  | 'announcement'
  | 'restock'
  | 'thank-you'
  | 'reengagement'
  | 'custom';
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
  sendResults?: {
    total: number;
    succeeded: number;
    failed: number;
    details?: { email: string; status: string; error?: string }[];
  };
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
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Error loading campaign';
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
        const res = await api.get('/admin/emails/users/search', {
          params: { q: userSearch },
        });
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
      const res = await api.post('/admin/emails/preview-recipients', {
        recipients: cleanRecipientsForBackend,
      });
      setRecipientPreview(res.data?.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error resolving recipients';
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
      const res = await api.post('/admin/emails/generate', {
        prompt: aiPrompt,
        template,
        audienceHint: describeAudience(recipients),
      });
      const draft = res.data?.data?.draft;
      if (draft) {
        setSubject(draft.subject);
        setBody(draft.body);
        toast.success('AI draft ready — review before sending');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'AI drafting failed';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const validate = (): string | null => {
    if (!subject.trim()) return 'Subject is required';
    if (!body.trim()) return 'Body is required';
    if (recipients.type === 'individual' && !pickedUsers.length && !recipients.userIds.length)
      return 'Pick at least one user';
    if (recipients.type === 'external' && recipients.externalEmails.length === 0)
      return 'Add at least one external email';
    return null;
  };

  const handleSaveDraft = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const payload = {
        subject,
        body,
        template,
        aiPrompt: aiPrompt || undefined,
        recipients: cleanRecipientsForBackend,
        design,
      };
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error saving draft';
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error sending campaign';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const openFullPreview = async () => {
    setShowFullPreview(true);
    setFullPreviewLoading(true);
    try {
      const res = await api.post('/admin/emails/preview-html', {
        body,
        design,
        name: 'there',
      });
      setFullPreviewHtml(res.data?.data?.html || '');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to render preview';
      toast.error(message);
      setFullPreviewHtml('');
    } finally {
      setFullPreviewLoading(false);
    }
  };

  const applyColorPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setDesign((d) => ({
      ...d,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
    }));
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading composer…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/admin/emails')}
              className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {readOnly ? 'View sent campaign' : isEdit ? 'Edit email' : 'New email'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {readOnly
                  ? 'This campaign has already been sent and cannot be edited.'
                  : 'Draft, preview, then approve before sending.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
            <button
              onClick={openFullPreview}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Full preview</span>
              <span className="sm:hidden">Preview</span>
            </button>
            {!readOnly && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save draft
                </button>
                <button
                  onClick={handleOpenSendModal}
                  disabled={saving || sending}
                  className="col-span-2 lg:col-span-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Review & send
                </button>
              </>
            )}
          </div>
        </div>

        {sendResults && (
          <div className="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Delivered {sendResults.succeeded} of {sendResults.total}
              </span>
              {sendResults.failed > 0 && (
                <span className="text-red-600 ml-2">({sendResults.failed} failed)</span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!readOnly && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">AI drafting</h2>
                  <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                    Optional
                  </span>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:gap-3 mb-3">
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as Template)}
                    className="sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-900 truncate"
                  >
                    {TEMPLATE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} — {t.hint}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="sm:col-span-3 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate draft
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the email: e.g. 'Announce our summer sale, 15% off all logs this weekend only, keep it warm and casual.'"
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{name}}'}</code> anywhere in the body to personalize with each recipient's first name.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Email content</h2>
                <button
                  onClick={() => setShowPreviewPane((v) => !v)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreviewPane ? 'Hide preview' : 'Show preview'}
                </button>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={readOnly}
                    placeholder="Your email subject"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Body (HTML)
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={readOnly}
                    rows={14}
                    placeholder="<p>Hi {{name}},</p><p>Your message here.</p>"
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 font-mono disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {showPreviewPane && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Preview</h2>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {'{{name}}'} shown as "there"
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-950 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {(subject || '(no subject)').replaceAll('{{name}}', 'there')}
                      </p>
                    </div>
                    <div
                      className="p-5 text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: (body || '<p class="text-gray-400">(empty body)</p>').replaceAll('{{name}}', 'there'),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recipients</h2>
              </div>

              <div className="space-y-2 mb-4">
                {(
                  [
                    { value: 'all', label: 'All active users' },
                    { value: 'segment', label: 'Segment (filters)' },
                    { value: 'individual', label: 'Pick users' },
                    { value: 'external', label: 'External emails' },
                  ] as { value: RecipientType; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${ recipients.type === opt.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200' } ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="rtype"
                      value={opt.value}
                      checked={recipients.type === opt.value}
                      onChange={() =>
                        setRecipients((r) => ({ ...r, type: opt.value }))
                      }
                      className="accent-gray-900"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{opt.label}</span>
                  </label>
                ))}
              </div>

              {recipients.type === 'segment' && (
                <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Role</label>
                    <select
                      value={recipients.filters.role || ''}
                      onChange={(e) =>
                        setRecipients((r) => ({
                          ...r,
                          filters: { ...r.filters, role: e.target.value as 'user' | 'admin' | '' },
                        }))
                      }
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <option value="">Any</option>
                      <option value="user">Users only</option>
                      <option value="admin">Admins only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Verified</label>
                    <select
                      value={
                        recipients.filters.isVerified === '' || recipients.filters.isVerified === undefined
                          ? ''
                          : String(recipients.filters.isVerified)
                      }
                      onChange={(e) =>
                        setRecipients((r) => ({
                          ...r,
                          filters: {
                            ...r.filters,
                            isVerified: e.target.value === '' ? '' : e.target.value === 'true',
                          },
                        }))
                      }
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <option value="">Any</option>
                      <option value="true">Verified only</option>
                      <option value="false">Unverified only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Active</label>
                    <select
                      value={
                        recipients.filters.isActive === '' || recipients.filters.isActive === undefined
                          ? ''
                          : String(recipients.filters.isActive)
                      }
                      onChange={(e) =>
                        setRecipients((r) => ({
                          ...r,
                          filters: {
                            ...r.filters,
                            isActive: e.target.value === '' ? '' : e.target.value === 'true',
                          },
                        }))
                      }
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <option value="">Any</option>
                      <option value="true">Active only</option>
                      <option value="false">Deactivated only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Ordered in last N days (recent buyers)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={recipients.filters.hasOrderedInLastDays ?? ''}
                      onChange={(e) =>
                        setRecipients((r) => ({
                          ...r,
                          filters: {
                            ...r.filters,
                            hasOrderedInLastDays: e.target.value === '' ? '' : Number(e.target.value),
                          },
                        }))
                      }
                      placeholder="e.g. 7"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Has NOT ordered in last N days (dormant)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={recipients.filters.hasNotOrderedInLastDays ?? ''}
                      onChange={(e) =>
                        setRecipients((r) => ({
                          ...r,
                          filters: {
                            ...r.filters,
                            hasNotOrderedInLastDays: e.target.value === '' ? '' : Number(e.target.value),
                          },
                        }))
                      }
                      placeholder="e.g. 30"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              )}

              {recipients.type === 'individual' && (
                <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users…"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  {userResults.length > 0 && (
                    <div className="border border-gray-100 dark:border-gray-800 rounded-lg max-h-40 overflow-y-auto">
                      {userResults.map((u) => {
                        const selected = pickedUsers.some((p) => p._id === u._id);
                        return (
                          <button
                            key={u._id}
                            onClick={() => {
                              if (selected) {
                                setPickedUsers((prev) => prev.filter((p) => p._id !== u._id));
                              } else {
                                setPickedUsers((prev) => [...prev, u]);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${ selected ? 'bg-gray-50' : '' }`}
                          >
                            <div>
                              <p className="text-gray-900 dark:text-gray-100">{u.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                            </div>
                            {selected && <CheckCircle2 className="w-4 h-4 text-gray-900 dark:text-gray-100" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {pickedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pickedUsers.map((u) => (
                        <span
                          key={u._id}
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                        >
                          {u.name}
                          <button
                            onClick={() =>
                              setPickedUsers((prev) => prev.filter((p) => p._id !== u._id))
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {recipients.type === 'external' && (
                <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={externalInput}
                      onChange={(e) => setExternalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalEmail())}
                      placeholder="name@example.com"
                      className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={addExternalEmail}
                      className="px-3 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Add
                    </button>
                  </div>
                  {recipients.externalEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {recipients.externalEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                        >
                          {email}
                          <button
                            onClick={() =>
                              setRecipients((r) => ({
                                ...r,
                                externalEmails: r.externalEmails.filter((e) => e !== email),
                              }))
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!readOnly && (
                <button
                  onClick={runRecipientPreview}
                  disabled={previewLoading}
                  className="w-full mt-4 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {previewLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving…
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" /> Preview recipients
                    </>
                  )}
                </button>
              )}

              {recipientPreview && (
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {recipientPreview.total} recipient{recipientPreview.total !== 1 ? 's' : ''}
                  </p>
                  {recipientPreview.sample.length > 0 && (
                    <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                      {recipientPreview.sample.map((r) => (
                        <li key={r.email}>
                          {r.name ? `${r.name} — ` : ''}
                          {r.email}
                        </li>
                      ))}
                    </ul>
                  )}
                  {recipientPreview.total > recipientPreview.sample.length && (
                    <p className="text-gray-400 dark:text-gray-500 mt-1">
                      …and {recipientPreview.total - recipientPreview.sample.length} more
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Design</h2>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Presets</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLOR_PRESETS.map((preset) => {
                    const active =
                      design.accentColor === preset.accentColor &&
                      design.backgroundColor === preset.backgroundColor;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => applyColorPreset(preset)}
                        disabled={readOnly}
                        title={preset.name}
                        className={`h-10 rounded-lg border transition-all overflow-hidden flex ${ active ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200 hover:border-gray-300' }`}
                      >
                        <span className="flex-1" style={{ background: preset.accentColor }} />
                        <span className="flex-1" style={{ background: preset.backgroundColor }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <ColorRow
                  label="Accent (header + buttons)"
                  value={design.accentColor}
                  onChange={(v) => setDesign((d) => ({ ...d, accentColor: v }))}
                  disabled={readOnly}
                />
                <ColorRow
                  label="Background"
                  value={design.backgroundColor}
                  onChange={(v) => setDesign((d) => ({ ...d, backgroundColor: v }))}
                  disabled={readOnly}
                />
                <ColorRow
                  label="Body text"
                  value={design.textColor}
                  onChange={(v) => setDesign((d) => ({ ...d, textColor: v }))}
                  disabled={readOnly}
                />
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Header text</label>
                  <input
                    type="text"
                    value={design.headerText}
                    onChange={(e) => setDesign((d) => ({ ...d, headerText: e.target.value }))}
                    disabled={readOnly}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Layout</label>
                  <select
                    value={design.layout}
                    onChange={(e) => setDesign((d) => ({ ...d, layout: e.target.value as Layout }))}
                    disabled={readOnly}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                  >
                    <option value="branded">Branded — bold header</option>
                    <option value="simple">Simple — underline header</option>
                    <option value="minimal">Minimal — no card</option>
                  </select>
                </div>
              </div>

              <button
                onClick={openFullPreview}
                className="w-full mt-4 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5" /> See full preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullPreview && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Full email preview</h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                    Exactly what recipients will see (name shown as "there")
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullPreview(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                <span className="font-medium text-gray-700 dark:text-gray-300">From:</span> no-reply@shoplogshere.com
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>{' '}
                {(subject || '(no subject)').replaceAll('{{name}}', 'there')}
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
              {fullPreviewLoading ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Rendering…
                </div>
              ) : (
                <iframe
                  title="Email preview"
                  srcDoc={fullPreviewHtml}
                  className="w-full h-[55vh] sm:h-[60vh] border-0 bg-white dark:bg-gray-900"
                  sandbox=""
                />
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowFullPreview(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSendModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="bg-gray-900 text-white px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold">Confirm before sending</h2>
                <p className="text-xs sm:text-sm text-gray-300">
                  Review the recipients and content — sending cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recipients</p>
                  {previewLoading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Resolving…
                    </p>
                  ) : recipientPreview ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {recipientPreview.total} recipient{recipientPreview.total !== 1 ? 's' : ''}
                      </p>
                      {recipientPreview.sample.length > 0 && (
                        <ul className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 space-y-0.5 max-h-40 overflow-y-auto">
                          {recipientPreview.sample.map((r) => (
                            <li key={r.email}>
                              {r.name ? `${r.name} — ` : ''}
                              {r.email}
                            </li>
                          ))}
                        </ul>
                      )}
                      {recipientPreview.total > recipientPreview.sample.length && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          …and {recipientPreview.total - recipientPreview.sample.length} more
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Preview unavailable</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Body preview</p>
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div
                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: body.replaceAll('{{name}}', 'there'),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowSendModal(false)}
                disabled={sending}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sending || !recipientPreview || recipientPreview.total === 0}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer disabled:cursor-not-allowed"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
      />
    </div>
  </div>
);

const describeAudience = (r: Recipients): string => {
  if (r.type === 'all') return 'all active users of the ShopLogs marketplace';
  if (r.type === 'external') return 'external recipients (may not be registered users)';
  if (r.type === 'individual') return `${r.userIds.length} hand-picked users`;
  const parts: string[] = [];
  if (r.filters.role) parts.push(`role=${r.filters.role}`);
  if (typeof r.filters.isVerified === 'boolean')
    parts.push(r.filters.isVerified ? 'verified' : 'unverified');
  if (typeof r.filters.isActive === 'boolean')
    parts.push(r.filters.isActive ? 'active' : 'deactivated');
  if (typeof r.filters.hasOrderedInLastDays === 'number' && r.filters.hasOrderedInLastDays > 0)
    parts.push(`ordered in last ${r.filters.hasOrderedInLastDays}d`);
  if (typeof r.filters.hasNotOrderedInLastDays === 'number' && r.filters.hasNotOrderedInLastDays > 0)
    parts.push(`no order in ${r.filters.hasNotOrderedInLastDays}d`);
  return `segment: ${parts.join(', ') || 'no filters'}`;
};

export default AdminEmailComposer;

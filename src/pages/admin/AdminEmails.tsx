import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Mail, Plus, Trash2, Edit3, Send, Users, Calendar, FileText,
  CheckCircle2, XCircle, Clock, Sparkles, Heart, UserX, Newspaper, ArrowRight, Wand2,
} from 'lucide-react';
import api from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatTile from '../../components/ui/StatTile';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Suggestion {
  id: string;
  icon: string;
  title: string;
  reason: string;
  action: { kind: string; defaultKey: string; alreadyExists: boolean };
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
  aiInsight: string | null;
  stats: { totalUsers: number; verifiedUsers: number; recentBuyers: number; dormantUsers: number };
}

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="w-4 h-4" />,
  'user-x': <UserX className="w-4 h-4" />,
  newspaper: <Newspaper className="w-4 h-4" />,
};

interface Campaign {
  _id: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'failed';
  template: string;
  recipients: {
    type: 'all' | 'segment' | 'individual' | 'external';
    filters?: { role?: string; isVerified?: boolean; isActive?: boolean };
    userIds?: string[];
    externalEmails?: string[];
  };
  sentAt?: string;
  createdAt: string;
  sendResults?: { total: number; succeeded: number; failed: number };
  createdBy?: { name?: string; email?: string };
}

const statusTone: Record<Campaign['status'], 'neutral' | 'success' | 'error'> = {
  draft: 'neutral', sent: 'success', failed: 'error',
};

const statusIcon: Record<Campaign['status'], React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />, sent: <CheckCircle2 className="w-3 h-3" />, failed: <XCircle className="w-3 h-3" />,
};

const recipientLabel = (r: Campaign['recipients']): string => {
  switch (r.type) {
    case 'all': return 'All active users';
    case 'segment': return `Segment${r.filters ? ` (${Object.keys(r.filters).length} filters)` : ''}`;
    case 'individual': return `${r.userIds?.length || 0} picked users`;
    case 'external': return `${r.externalEmails?.length || 0} external emails`;
    default: return 'Unknown';
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminEmails: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'failed'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const res = await api.get('/admin/emails', { params });
      setCampaigns(res.data?.data?.campaigns || []);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error loading campaigns';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/emails/suggestions');
        setSuggestions(res.data?.data || null);
      } catch {
        // suggestions are optional, silently ignore
      }
    })();
  }, []);

  const handleActOnSuggestion = async (s: Suggestion) => {
    setActingOn(s.id);
    try {
      const res = await api.post('/admin/emails/suggestions/act', { defaultKey: s.action.defaultKey });
      const id = res.data?.data?.campaign?._id;
      toast.success(s.action.alreadyExists ? 'Opening existing draft' : 'Draft created — review it');
      if (id) navigate(`/admin/emails/${id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error acting on suggestion';
      toast.error(message);
    } finally {
      setActingOn(null);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/admin/emails/seed-defaults');
      toast.success(res.data?.message || 'Templates seeded');
      fetchCampaigns();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error seeding defaults';
      toast.error(message);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/emails/${deleteTarget._id}`);
      toast.success('Campaign deleted');
      setDeleteTarget(null);
      fetchCampaigns();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error deleting campaign';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: campaigns.length,
    drafts: campaigns.filter((c) => c.status === 'draft').length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
  };

  return (
    <div>
      <AdminPageHeader
        icon={<Mail className="w-5 h-5" />}
        title="Email automation"
        subtitle="Draft, review, and send emails. AI-assisted or manual — you always approve before sending."
        action={<Button onClick={() => navigate('/admin/emails/new')} icon={<Plus className="w-4 h-4" />}>New email</Button>}
      />

      {suggestions && (suggestions.suggestions.length > 0 || suggestions.aiInsight) && (
        <Card padded={false} className="mb-6">
          <div className="bg-[#0B0B10] text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-2 rounded-t-[var(--radius-lg)]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <h2 className="text-[13.5px] font-semibold">AI suggestions</h2>
            <span className="text-[10.5px] text-white/45 sm:ml-auto w-full sm:w-auto">
              Based on {suggestions.stats.totalUsers} users, {suggestions.stats.recentBuyers} recent buyers, {suggestions.stats.dormantUsers} dormant
            </span>
          </div>
          {suggestions.aiInsight && (
            <div className="px-4 sm:px-5 py-3 bg-warning-soft border-b border-warning/15 flex items-start gap-2">
              <Wand2 className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-[12.5px] text-ink-soft leading-relaxed">{suggestions.aiInsight}</p>
            </div>
          )}
          {suggestions.suggestions.length > 0 && (
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestions.suggestions.map((s) => (
                <div key={s.id} className="border border-border rounded-[var(--radius-md)] p-4 hover:border-border-strong transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary-soft text-primary flex items-center justify-center">
                      {iconMap[s.icon] || <Mail className="w-4 h-4" />}
                    </div>
                    <p className="text-[13px] font-semibold text-ink flex-1">{s.title}</p>
                  </div>
                  <p className="text-[11.5px] text-ink-muted mb-3 leading-relaxed">{s.reason}</p>
                  <Button size="sm" fullWidth loading={actingOn === s.id} onClick={() => handleActOnSuggestion(s)}>
                    {actingOn !== s.id && (
                      <>
                        {s.action.alreadyExists ? 'Open draft' : 'Create draft'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Total campaigns" value={stats.total} icon={<FileText className="w-4 h-4" />} />
        <StatTile label="Drafts" value={stats.drafts} icon={<Clock className="w-4 h-4" />} tone="warning" />
        <StatTile label="Sent" value={stats.sent} icon={<CheckCircle2 className="w-4 h-4" />} tone="success" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'draft', 'sent', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-on-primary' : 'bg-surface text-ink-soft border border-border hover:border-border-strong'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="text-center text-[13px] text-ink-muted">Loading campaigns…</Card>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-6 h-6" />}
          title="No campaigns yet"
          description="Create your first email — draft manually, let AI help, or load our starter templates."
          action={
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={() => navigate('/admin/emails/new')} icon={<Plus className="w-4 h-4" />}>New email</Button>
              <Button variant="secondary" onClick={handleSeedDefaults} loading={seeding} icon={<Sparkles className="w-4 h-4" />}>
                {seeding ? 'Seeding…' : 'Load starter templates'}
              </Button>
            </div>
          }
          className="bg-surface border border-border rounded-[var(--radius-xl)]"
        />
      ) : (
        <Card padded={false}>
          <div className="md:hidden divide-y divide-[var(--vault-border)]">
            {campaigns.map((c) => (
              <div key={c._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={`/admin/emails/${c._id}`} className="font-medium text-ink hover:underline line-clamp-2 text-[13px] flex-1 min-w-0">
                    {c.subject}
                  </Link>
                  <Badge tone={statusTone[c.status]}>{statusIcon[c.status]} {c.status}</Badge>
                </div>
                <p className="text-[10.5px] text-ink-muted capitalize mb-2">
                  {c.template} template
                  {c.status === 'sent' && c.sendResults && ` — ${c.sendResults.succeeded}/${c.sendResults.total} delivered`}
                </p>
                <div className="flex items-center gap-3 text-[10.5px] text-ink-muted flex-wrap mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="truncate">{recipientLabel(c.recipients)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(c.sentAt || c.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" fullWidth onClick={() => navigate(`/admin/emails/${c._id}`)} icon={c.status === 'sent' ? <Send className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}>
                    {c.status === 'sent' ? 'View' : 'Edit'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(c)} icon={<Trash2 className="w-4 h-4" />} className="!text-error" />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-surface-hover border-b border-border text-[10.5px] uppercase text-ink-muted tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Subject</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Recipients</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vault-border)]">
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/emails/${c._id}`} className="font-medium text-ink hover:underline line-clamp-1">{c.subject}</Link>
                      <p className="text-[11px] text-ink-muted mt-0.5 capitalize">{c.template} template</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[c.status]}>{statusIcon[c.status]} {c.status}</Badge>
                      {c.status === 'sent' && c.sendResults && (
                        <p className="text-[11px] text-ink-muted mt-1">{c.sendResults.succeeded}/{c.sendResults.total} delivered</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-ink-soft">
                        <Users className="w-3.5 h-3.5 text-ink-muted" />
                        <span>{recipientLabel(c.recipients)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(c.sentAt || c.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/admin/emails/${c._id}`)} title={c.status === 'sent' ? 'View' : 'Edit'} className="w-8 h-8 rounded-[var(--radius-sm)] hover:bg-surface-hover text-ink-muted hover:text-ink flex items-center justify-center transition-colors">
                          {c.status === 'sent' ? <Send className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteTarget(c)} title="Delete" className="w-8 h-8 rounded-[var(--radius-sm)] hover:bg-error-soft text-ink-muted hover:text-error flex items-center justify-center transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete campaign"
        message="Delete this email campaign? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminEmails;

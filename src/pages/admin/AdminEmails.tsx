import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Mail,
  Plus,
  Trash2,
  Edit3,
  Send,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Heart,
  UserX,
  Newspaper,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import api from '../../utils/api';

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
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    recentBuyers: number;
    dormantUsers: number;
  };
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

const statusStyles: Record<Campaign['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
};

const statusIcon: Record<Campaign['status'], React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  sent: <CheckCircle2 className="w-3 h-3" />,
  failed: <XCircle className="w-3 h-3" />,
};

const recipientLabel = (r: Campaign['recipients']): string => {
  switch (r.type) {
    case 'all':
      return 'All active users';
    case 'segment':
      return `Segment${r.filters ? ` (${Object.keys(r.filters).length} filters)` : ''}`;
    case 'individual':
      return `${r.userIds?.length || 0} picked users`;
    case 'external':
      return `${r.externalEmails?.length || 0} external emails`;
    default:
      return 'Unknown';
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminEmails: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'failed'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error loading campaigns';
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
      const res = await api.post('/admin/emails/suggestions/act', {
        defaultKey: s.action.defaultKey,
      });
      const id = res.data?.data?.campaign?._id;
      toast.success(s.action.alreadyExists ? 'Opening existing draft' : 'Draft created — review it');
      if (id) navigate(`/admin/emails/${id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error acting on suggestion';
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error seeding defaults';
      toast.error(message);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this email campaign? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/emails/${id}`);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error deleting campaign';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: campaigns.length,
    drafts: campaigns.filter((c) => c.status === 'draft').length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Email Automation</h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm sm:ml-10">
              Draft, review, and send emails. AI-assisted or manual — you always approve before sending.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/emails/new')}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New email</span>
          </button>
        </div>

        {suggestions && (suggestions.suggestions.length > 0 || suggestions.aiInsight) && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-900 text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <h2 className="text-sm font-semibold">AI suggestions</h2>
              <span className="text-[10px] sm:text-[11px] text-gray-300 sm:ml-auto w-full sm:w-auto">
                Based on {suggestions.stats.totalUsers} users, {suggestions.stats.recentBuyers} recent buyers,{' '}
                {suggestions.stats.dormantUsers} dormant
              </span>
            </div>
            {suggestions.aiInsight && (
              <div className="px-4 sm:px-5 py-3 bg-yellow-50 border-b border-yellow-100 flex items-start gap-2">
                <Wand2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-yellow-900 leading-relaxed">{suggestions.aiInsight}</p>
              </div>
            )}
            {suggestions.suggestions.length > 0 && (
              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                        {iconMap[s.icon] || <Mail className="w-4 h-4" />}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-1">{s.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{s.reason}</p>
                    <button
                      onClick={() => handleActOnSuggestion(s)}
                      disabled={actingOn === s.id}
                      className="w-full text-xs font-medium py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {actingOn === s.id ? (
                        'Working…'
                      ) : (
                        <>
                          {s.action.alreadyExists ? 'Open draft' : 'Create draft'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="bg-gray-100 rounded-lg p-1.5 sm:p-2 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">Total campaigns</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="bg-yellow-50 rounded-lg p-1.5 sm:p-2 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.drafts}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">Drafts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="bg-green-50 rounded-lg p-1.5 sm:p-2 shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.sent}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">Sent</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'draft', 'sent', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
            Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first email — draft manually, let AI help, or load our starter templates.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => navigate('/admin/emails/new')}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New email</span>
              </button>
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{seeding ? 'Seeding…' : 'Load starter templates'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {campaigns.map((c) => (
                <div key={c._id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`/admin/emails/${c._id}`}
                      className="font-medium text-gray-900 hover:underline line-clamp-2 text-sm flex-1 min-w-0"
                    >
                      {c.subject}
                    </Link>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0 ${statusStyles[c.status]}`}
                    >
                      {statusIcon[c.status]}
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 capitalize mb-2">
                    {c.template} template
                    {c.status === 'sent' && c.sendResults && ` — ${c.sendResults.succeeded}/${c.sendResults.total} delivered`}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{recipientLabel(c.recipients)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{formatDate(c.sentAt || c.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/emails/${c._id}`)}
                      className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {c.status === 'sent' ? <Send className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                      {c.status === 'sent' ? 'View' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Subject</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Recipients</th>
                    <th className="text-left px-4 py-3 font-medium">Created</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/emails/${c._id}`}
                          className="font-medium text-gray-900 hover:underline line-clamp-1"
                        >
                          {c.subject}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">
                          {c.template} template
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${statusStyles[c.status]}`}
                        >
                          {statusIcon[c.status]}
                          {c.status}
                        </span>
                        {c.status === 'sent' && c.sendResults && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            {c.sendResults.succeeded}/{c.sendResults.total} delivered
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>{recipientLabel(c.recipients)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(c.sentAt || c.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {c.status !== 'sent' && (
                            <button
                              onClick={() => navigate(`/admin/emails/${c._id}`)}
                              title="Edit"
                              className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {c.status === 'sent' && (
                            <button
                              onClick={() => navigate(`/admin/emails/${c._id}`)}
                              title="View"
                              className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={deletingId === c._id}
                            title="Delete"
                            className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmails;

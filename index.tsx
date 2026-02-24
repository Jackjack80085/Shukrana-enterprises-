
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  Search, 
  Bell, 
  Activity, 
  RefreshCw,
  Key,
  Lock,
  History,
  Mail,
  ArrowRight,
  TrendingUp,
  Calendar,
  Users,
  Store,
  MoreVertical,
  Check,
  CheckCircle2,
  LogOut,
  User,
  DollarSign,
  AlertCircle,
  PauseCircle,
  Download,
  Upload,
  FileText,
  Terminal,
  Server,
  Plus,
  Cpu,
  ShieldAlert,
  Zap,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Code2
} from 'lucide-react';

// --- Types & Constants ---

type Role = 'Merchant' | 'Admin';
type TransactionStatus = 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
type TransactionType = 'PAYIN' | 'PAYOUT';
type TimePeriod = 'DAYS' | 'MONTHS' | 'YEARS';

interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  timestamp: string;
  category: string;
  bankRef: string;
}

interface Merchant {
  id: string;
  name: string;
  category: string;
  volume: string;
}

const STATUS_CONFIG: Record<TransactionStatus, { color: string; bg: string; border: string }> = {
  SUCCESS: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  FAILED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  INITIATED: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  REVERSED: { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
};

// --- Mock Data Store ---

const INITIAL_MERCHANTS: Merchant[] = [
  { id: 'M-ACME', name: 'Acme Corp', category: 'Hardware', volume: '₹1.2M' },
  { id: 'M-TECH', name: 'TechCloud', category: 'SaaS', volume: '₹840K' },
  { id: 'M-STAR', name: 'Starbucks', category: 'Dining', volume: '₹2.1M' },
  { id: 'M-APPLE', name: 'Apple Online', category: 'Electronics', volume: '₹45M' },
];

const ALL_TRANSACTIONS: Transaction[] = [
  { id: 'TX-1001', merchantId: 'M-ACME', merchantName: 'Acme Corp', userId: 'U-JOHN', amount: 1299.00, currency: 'INR', status: 'SUCCESS', type: 'PAYIN', timestamp: '2023-10-24 14:20', category: 'Hardware', bankRef: 'HDFC-49210' },
  { id: 'TX-1002', merchantId: 'M-ACME', merchantName: 'Acme Corp', userId: 'U-SARA', amount: 450.00, currency: 'INR', status: 'FAILED', type: 'PAYOUT', timestamp: '2023-10-24 12:15', category: 'Settlement', bankRef: 'ICICI-00219' },
  { id: 'TX-2001', merchantId: 'M-TECH', merchantName: 'TechCloud', userId: 'U-JOHN', amount: 599.99, currency: 'INR', status: 'SUCCESS', type: 'PAYIN', timestamp: '2023-10-24 10:00', category: 'Subscription', bankRef: 'AXIS-9821' },
  { id: 'TX-2002', merchantId: 'M-TECH', merchantName: 'TechCloud', userId: 'U-SARA', amount: 12000.00, currency: 'INR', status: 'PENDING', type: 'PAYIN', timestamp: '2023-10-23 18:45', category: 'Enterprise', bankRef: 'NEFT-8812' },
  { id: 'TX-3001', merchantId: 'M-STAR', merchantName: 'Starbucks', userId: 'U-JOHN', amount: 575.00, currency: 'INR', status: 'SUCCESS', type: 'PAYIN', timestamp: '2023-10-23 09:30', category: 'Dining', bankRef: 'VISA-4242' },
  { id: 'TX-3002', merchantId: 'M-STAR', merchantName: 'Starbucks', userId: 'U-JOHN', amount: 850.00, currency: 'INR', status: 'REVERSED', type: 'PAYOUT', timestamp: '2023-10-22 16:10', category: 'Refund', bankRef: 'UPI-4242' },
  { id: 'TX-4001', merchantId: 'M-APPLE', merchantName: 'Apple Online', userId: 'U-TECH', amount: 50000.00, currency: 'INR', status: 'INITIATED', type: 'PAYOUT', timestamp: '2023-10-24 15:00', category: 'Settlement', bankRef: 'IMPS-001' },
];

// --- Shared Components ---

const StatusBadge = ({ status }: { status: TransactionStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase border ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border}`}>
    <span className={`w-1 h-1 rounded-full ${status === 'PENDING' ? 'animate-pulse' : ''} bg-current`}></span>
    {status}
  </span>
);

const Card = ({ title, children, className = "", subtitle, headerAction }: { title?: string, children?: React.ReactNode, className?: string, subtitle?: string, headerAction?: React.ReactNode }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
           {headerAction}
           <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={16} /></button>
        </div>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const OverviewCard = ({ title, subtitle, label, value, icon: Icon, colorClass, iconBgClass, isLight = false }: { title?: string, subtitle?: string, label: string, value: string, icon: any, colorClass: string, iconBgClass: string, isLight?: boolean }) => {
  const textColor = isLight ? 'text-slate-900' : 'text-white';
  const subTextColor = isLight ? 'text-slate-400' : 'text-white/40';
  const dividerColor = isLight ? 'bg-slate-100' : 'bg-white/10';
  const moreColor = isLight ? 'text-slate-300 hover:text-slate-600' : 'text-white/30 hover:text-white';
  const iconColor = isLight ? 'text-slate-600' : 'text-white';

  return (
    <div className={`${colorClass} rounded-[1.5rem] overflow-hidden shadow-xl transition-all hover:scale-[1.01] duration-300 flex flex-col border ${isLight ? 'border-slate-100' : 'border-transparent'}`}>
      <div className="px-7 py-4 flex justify-between items-start">
        <div className="min-h-[2rem]">
          {title && <h4 className={`${textColor} font-bold text-lg tracking-tight leading-tight`}>{title}</h4>}
          {subtitle && <p className={`${subTextColor} text-[11px] font-medium mt-0.5`}>{subtitle}</p>}
        </div>
        <button className={`${moreColor} mt-1`} aria-label="More Options"><MoreVertical size={18} /></button>
      </div>
      <div className={`h-px ${dividerColor} w-full`}></div>
      <div className="px-7 py-8 flex justify-between items-end">
        <div>
          <p className={`${subTextColor} text-[9px] font-black uppercase tracking-[0.2em] mb-2`}>{label}</p>
          <p className={`${textColor} text-5xl font-bold tracking-tighter tabular-nums leading-none`}>{value}</p>
        </div>
        <div className={`${iconBgClass} p-4 rounded-2xl flex items-center justify-center shadow-inner`}>
          <Icon size={28} className={iconColor} />
        </div>
      </div>
    </div>
  );
};

const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="flex items-center justify-center gap-10 py-4">
      <div className="relative w-48 h-48">
        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
          {data.map((item, index) => {
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += item.value / total;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = item.value / total > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');
            return <path key={index} d={pathData} fill={item.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
          })}
          <circle cx="0" cy="0" r="0.6" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</p>
           <p className="text-xl font-bold text-slate-900">+12%</p>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">{((item.value / total) * 100).toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PaymentStats = ({ payin, payout, processing, pending }: { payin: number, payout: number, processing: number, pending: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
        <Download size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payin</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums">₹{payin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
        <Upload size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payout</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums">₹{payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
        <RefreshCw size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums">{processing}</p>
      </div>
    </div>
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-lg transition-all">
      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
        <PauseCircle size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums">{pending}</p>
      </div>
    </div>
  </div>
);

// --- API Generation View ---

const APIGenerationView = () => {
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('A new pair of API keys has been generated successfully.');
    }, 1500);
  };

  const codeSnippet = `const nexus = require('@nexuspay/sdk');

const client = new nexus.Client({
  publicKey: 'pk_live_51M0x2bX9kL8zPq...',
  secretKey: 'sk_live_v9X2c7...'
});

// Initiate a secure payment
const session = await client.checkout.sessions.create({
  amount: 250000, // In paise
  currency: 'inr',
  success_url: 'https://acme.com/success',
  cancel_url: 'https://acme.com/cancel',
});`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="API Infrastructure" subtitle="Secure credentials for server-side integration">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Public Key</label>
                  <div className="relative group">
                    <input 
                      readOnly 
                      value="pk_live_51M0x2bX9kL8zPq9102X92jL0" 
                      className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs font-bold text-slate-700 focus:outline-none" 
                    />
                    <button 
                      onClick={() => handleCopy('pk_live_51M0x2bX9kL8zPq9102X92jL0', 'public')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      {copiedField === 'public' ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Secret Key</label>
                  <div className="relative group">
                    <input 
                      readOnly 
                      type={isSecretVisible ? 'text' : 'password'}
                      value="sk_live_v9X2c7k01L2zQp11M9jX02..." 
                      className="w-full pl-6 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs font-bold text-slate-700 focus:outline-none" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <button 
                        onClick={() => setIsSecretVisible(!isSecretVisible)}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {isSecretVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => handleCopy('sk_live_v9X2c7k01L2zQp11M9jX02...', 'secret')}
                        className="text-slate-300 hover:text-emerald-600 transition-colors"
                      >
                        {copiedField === 'secret' ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400 font-medium italic">* Do not share your secret key in public environments.</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full"></div>

              <div className="flex justify-between items-center bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Key Rotation Protocol</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Generate a new pair to invalidate existing ones immediately.</p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#0A0D14] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : 'Generate New Credentials'}
                </button>
              </div>
            </div>
          </Card>

          <Card title="Webhook Orchestration" subtitle="Receive real-time event notifications">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Endpoint URL</label>
                <div className="flex gap-4">
                  <input 
                    placeholder="https://api.acme.com/v1/webhooks" 
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs text-slate-700 focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                  <button className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                    Test Endpoint
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['payment.success', 'payment.failed', 'refund.created', 'dispute.opened'].map(event => (
                  <div key={event} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 rounded border-slate-300" />
                    <span className="text-xs font-bold text-slate-600">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Quick Integration" subtitle="SDK Snippet (Node.js)">
            <div className="space-y-6">
              <div className="bg-[#0A0D14] rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-slate-800/50 flex justify-between items-center border-b border-slate-700">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></div>
                   </div>
                   <Code2 size={14} className="text-slate-500" />
                </div>
                <div className="p-6 font-mono text-[11px] leading-relaxed text-emerald-400 overflow-x-auto whitespace-pre">
                  <code>{codeSnippet}</code>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                View Documentation <ArrowRight size={14} />
              </button>
            </div>
          </Card>

          <Card title="Ecosystem Status">
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 pulsing-bar"></div>
                    <span className="text-xs font-bold text-slate-700">Production API</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Operational</span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-700">Webhooks</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Operational</span>
               </div>
               <div className="h-px bg-slate-50"></div>
               <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg. Latency</p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">14ms</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components: Shared Modules ---

const ChartWithToggle = ({ timePeriod, setTimePeriod, data }: { timePeriod: TimePeriod, setTimePeriod: (t: TimePeriod) => void, data: any[] }) => (
  <Card title="Volume Distribution" subtitle={`Analysis by ${timePeriod.toLowerCase()}`} headerAction={
    <div className="flex bg-slate-100 p-1 rounded-xl">
      {(['DAYS', 'MONTHS', 'YEARS'] as TimePeriod[]).map(t => (
        <button key={t} onClick={() => setTimePeriod(t)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${timePeriod === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          {t[0]}
        </button>
      ))}
    </div>
  }>
    <PieChart data={data} />
  </Card>
);

// --- Sub-Components: Dashboard Views ---

const MerchantDashboard = ({ txns, activeTab }: { txns: Transaction[], activeTab: string }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('DAYS');
  const [isPayOpen, setIsPayOpen] = useState(false);
  const merchantTxns = txns.filter(t => t.merchantId === 'M-ACME');
  
  const filteredTxns = useMemo(() => {
    if (activeTab === 'payin') return merchantTxns.filter(t => t.type === 'PAYIN');
    if (activeTab === 'payout') return merchantTxns.filter(t => t.type === 'PAYOUT');
    return merchantTxns;
  }, [merchantTxns, activeTab]);

  const stats = useMemo(() => {
    const payinTotal = merchantTxns.filter(t => t.type === 'PAYIN' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
    const payoutTotal = merchantTxns.filter(t => t.type === 'PAYOUT' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
    const processing = merchantTxns.filter(t => t.status === 'INITIATED').length;
    const pending = merchantTxns.filter(t => t.status === 'PENDING').length;
    return { payinTotal, payoutTotal, processing, pending };
  }, [merchantTxns]);

  const pieData = [
    { label: 'Payin', value: stats.payinTotal, color: '#10b981' },
    { label: 'Payout', value: stats.payoutTotal, color: '#3b82f6' },
    { label: 'Reversed', value: 8500, color: '#8b5cf6' },
    { label: 'Failed', value: 12000, color: '#ef4444' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'api_gen' ? 'Developer API Gateway' : 'Merchant Hub'}
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">
            {activeTab === 'api_gen' ? 'Securely manage your integration endpoints' : 'Acme Corp • Digital Infrastructure'}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsPayOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all">
            <Plus size={20} /> New Payment
          </button>
          <button className="bg-[#0A0D14] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl">Withdraw Funds</button>
        </div>
      </div>

      {activeTab === 'api_gen' ? (
        <APIGenerationView />
      ) : (
        <>
          {(activeTab === 'analytics' || activeTab === 'ledger') && (
            <>
              <PaymentStats payin={stats.payinTotal} payout={stats.payoutTotal} processing={stats.processing} pending={stats.pending} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ChartWithToggle timePeriod={timePeriod} setTimePeriod={setTimePeriod} data={pieData} />
                </div>
                <Card title="Business Insight" subtitle="Real-time operations summary">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Links</p><span className="text-xl font-bold">14</span></div>
                    <div className="flex justify-between items-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversion</p><span className="text-xl font-bold text-emerald-600">88.4%</span></div>
                    <div className="p-5 bg-slate-900 rounded-[1.5rem] text-white">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">System Health</p>
                        <div className="flex justify-between items-center text-xs font-bold"><span>API Latency</span><span className="text-emerald-400">14ms</span></div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {(activeTab === 'ledger' || activeTab === 'payin' || activeTab === 'payout') && (
            <Card title="Global Ledger" subtitle={`Filter: ${activeTab.toUpperCase()}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] text-slate-400 uppercase tracking-widest border-b border-slate-50 font-bold">
                      <th className="pb-6 px-4">Identifier</th>
                      <th className="pb-6 px-4">Category</th>
                      <th className="pb-6 px-4">Type</th>
                      <th className="pb-6 px-4">Status</th>
                      <th className="pb-6 px-4 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTxns.map((t) => (
                      <tr key={t.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="py-6 px-4"><div className="font-bold text-slate-900">{t.id}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.timestamp}</div></td>
                        <td className="py-6 px-4 font-bold text-slate-600 text-xs">{t.category}</td>
                        <td className="py-6 px-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${t.type === 'PAYIN' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>{t.type}</span></td>
                        <td className="py-6 px-4"><StatusBadge status={t.status} /></td>
                        <td className="py-6 px-4 text-right font-bold text-slate-900 tabular-nums text-xl">₹{t.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
      <PaymentFlowModal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} />
    </div>
  );
};

const AdminDashboard = ({ txns, activeTab }: { txns: Transaction[], activeTab: string }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('DAYS');
  const stats = useMemo(() => {
    const payinTotal = txns.filter(t => t.type === 'PAYIN' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
    const payoutTotal = txns.filter(t => t.type === 'PAYOUT' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
    const processing = txns.filter(t => t.status === 'INITIATED').length;
    const pending = txns.filter(t => t.status === 'PENDING').length;
    return { payinTotal, payoutTotal, processing, pending };
  }, [txns]);

  const pieData = [
    { label: 'Payin Vol', value: stats.payinTotal, color: '#10b981' },
    { label: 'Payout Vol', value: stats.payoutTotal, color: '#3b82f6' },
    { label: 'Idle Liquidity', value: 1250000, color: '#f59e0b' },
    { label: 'Reconciliation', value: 450000, color: '#ef4444' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Nexus Core</h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">Global Orchestration & Compliance Monitoring</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-full border border-emerald-100">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
           <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Global Healthy</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <OverviewCard 
            title="Network Ecosystem" 
            subtitle="Global merchant distribution" 
            label="TOTAL MERCHANTS" 
            value="84,201" 
            icon={Store} 
            colorClass="bg-white" 
            iconBgClass="bg-slate-50"
            isLight={true} 
         />
         <OverviewCard 
            subtitle="System resource allocation" 
            label="ACTIVE NODES" 
            value="1,402" 
            icon={Cpu} 
            colorClass="bg-[#0F172A]" 
            iconBgClass="bg-[#1E293B]" 
         />
      </div>

      <PaymentStats payin={stats.payinTotal} payout={stats.payoutTotal} processing={stats.processing} pending={stats.pending} />
      
      {(activeTab === 'health' || activeTab === 'audit') && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3"><ChartWithToggle timePeriod={timePeriod} setTimePeriod={setTimePeriod} data={pieData} /></div>
          <Card title="Node Clusters">
             <div className="space-y-6">
                <div className="p-4 bg-slate-100 rounded-2xl text-slate-900 border border-slate-200">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Availability Zone</p>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[11px] font-bold"><span>AWS-MUM-1</span><span className="text-emerald-600">99.9%</span></div>
                      <div className="flex justify-between text-[11px] font-bold"><span>GCP-DEL-1</span><span className="text-emerald-600">100%</span></div>
                      <div className="flex justify-between text-[11px] font-bold"><span>AZ-HYD-1</span><span className="text-emerald-600">99.8%</span></div>
                   </div>
                </div>
                <button className="w-full py-4 border-2 border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Cluster Map</button>
             </div>
          </Card>
        </div>
      )}

      {(activeTab === 'payin' || activeTab === 'payout' || activeTab === 'merchants') && (
        <Card title="Managed Ecosystem" subtitle={`Focus: ${activeTab.toUpperCase()}`}>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {INITIAL_MERCHANTS.map(m => (
                 <div key={m.id} className="p-6 border border-slate-100 rounded-3xl hover:border-emerald-500 transition-all bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-emerald-600 shadow-sm">{m.name[0]}</div>
                       <div><p className="text-sm font-bold text-slate-900">{m.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{m.category}</p></div>
                    </div>
                    <div className="flex justify-between items-end"><div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vol</p><p className="text-sm font-bold text-slate-900">{m.volume}</p></div><ArrowRight size={16} className="text-slate-300" /></div>
                 </div>
              ))}
           </div>
        </Card>
      )}
    </div>
  );
};

// --- Main Application Shell ---

const PaymentFlowModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState('M-APPLE');

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('PROCESSING');
    setTimeout(() => setStep('SUCCESS'), 1800);
  };

  const activeMerchant = INITIAL_MERCHANTS.find(m => m.id === merchantId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0D14]/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95">
        {step === 'INPUT' && (
          <>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900">Initiate Transfer</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><XCircle size={24}/></button>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Recipient</label>
                <select value={merchantId} onChange={(e) => setMerchantId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 font-bold text-slate-900 text-sm appearance-none">
                  {INITIAL_MERCHANTS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-300">₹</span>
                  <input autoFocus type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-12 pr-6 py-8 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-emerald-500 text-4xl font-bold tabular-nums text-slate-900" />
                </div>
              </div>
              <button onClick={handlePay} disabled={!amount || parseFloat(amount) <= 0} className="w-full bg-[#0A0D14] text-white py-6 rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                Send Secure Payment
              </button>
            </div>
          </>
        )}
        {step === 'PROCESSING' && (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-10"></div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Authenticating...</h3>
            <p className="text-slate-500 font-medium">Communicating with Banking Layer v3</p>
          </div>
        )}
        {step === 'SUCCESS' && (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8"><Check size={48} /></div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Funds Delivered</h3>
            <p className="text-slate-400 text-sm font-mono mb-10 uppercase tracking-widest">ID: #TX-910232</p>
            <div className="w-full p-6 bg-slate-50 rounded-2xl mb-10 text-left space-y-3 border border-slate-100">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400"><span>Recipient</span><span className="text-slate-900">{activeMerchant?.name}</span></div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400"><span>Value</span><span className="text-slate-900 tabular-nums">₹{amount}</span></div>
            </div>
            <button onClick={onClose} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all text-lg">Close Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin }: { onLogin: (role: Role) => void }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      let role: Role = 'Admin';
      if (email.toLowerCase().includes('merchant')) role = 'Merchant';
      onLogin(role);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 font-poppins selection:bg-emerald-100">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex overflow-hidden border border-slate-200">
        <div className="hidden lg:flex w-[45%] bg-[#0A0D14] p-16 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-emerald-500 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600 blur-[100px]"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">NexusPay</span>
            </div>
            <h1 className="text-[3.5rem] font-bold leading-[1.05] tracking-tight mb-8">
              Seamless <br/>Financial <br/><span className="text-emerald-500">Infrastructure.</span>
            </h1>
          </div>
          <div className="relative z-10 flex items-center gap-6 text-[11px] font-bold text-slate-500 px-2 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Lock size={14} className="text-emerald-500"/> PCI-DSS LEVEL 1</span>
          </div>
        </div>
        <div className="flex-1 p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">{view === 'LOGIN' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-500 mb-12 font-medium">{view === 'LOGIN' ? 'Access your internal gateway.' : 'Join our financial ecosystem.'}</p>
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Gateway Access</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nexus.com or merchant@acme.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Security Passcode</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 font-semibold" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-[#0A0D14] text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : view === 'LOGIN' ? 'Authorize Protocol' : 'Join Platform'}
              </button>
            </form>
            <div className="mt-10 flex flex-col items-center gap-4">
              <button onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                {view === 'LOGIN' ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ role, activeTab, onTabChange, onLogout }: { role: Role, activeTab: string, onTabChange: (id: string) => void, onLogout: () => void }) => {
  const tabs = role === 'Merchant'
    ? [
        { id: 'analytics', icon: LayoutDashboard, label: 'Business' }, 
        { id: 'payin', icon: Download, label: 'Payin' }, 
        { id: 'payout', icon: Upload, label: 'Payout' }, 
        { id: 'ledger', icon: RefreshCw, label: 'Ledger' }, 
        { id: 'api_gen', icon: Key, label: 'API Gateway' }, 
        { id: 'settings', icon: Settings, label: 'Settings' }
      ]
    : [
        { id: 'health', icon: Activity, label: 'Control' }, 
        { id: 'payin', icon: Download, label: 'Payin' }, 
        { id: 'payout', icon: Upload, label: 'Payout' }, 
        { id: 'merchants', icon: Store, label: 'Merchants' }
      ];

  return (
    <div className="w-[18rem] bg-white border-r border-slate-200 h-screen sticky top-0 px-8 py-10 flex flex-col font-poppins">
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30"><ShieldCheck className="text-white" size={24} /></div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">NexusPay</span>
      </div>
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-5">Protocol Shell</p>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#0A0D14] text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <tab.icon size={20} />{tab.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-10 border-t border-slate-100 space-y-8">
        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0A0D14] flex items-center justify-center text-white font-bold text-xs">{role[0]}</div>
          <div><p className="text-sm font-bold text-slate-900">{role}</p><p className="text-[10px] text-slate-400 font-bold uppercase">System Active</p></div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"><LogOut size={20} /> Terminate Session</button>
      </div>
    </div>
  );
};

const Header = ({ title, role, onLogout }: { title: string, role: Role, onLogout: () => void }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifs = useMemo(() => {
    if (role === 'Admin') return [
      { id: 1, icon: ShieldAlert, title: 'Node Outage Warning', desc: 'Latency spike in Mumbai cluster AZ-04.', color: 'text-red-500' },
      { id: 2, icon: User, title: 'New Merchant Request', desc: 'Starbucks Inc. submitted for review.', color: 'text-blue-500' },
      { id: 3, icon: Globe, title: 'Compliance Refresh', desc: 'RBI regulatory lists updated.', color: 'text-emerald-500' },
    ];
    return [
      { id: 1, icon: Download, title: 'Payin Success', desc: '₹12,299.00 from U-JOHN settled.', color: 'text-emerald-500' },
      { id: 2, icon: History, title: 'Payout Processed', desc: 'Batch settlement delivered to HDFC.', color: 'text-blue-500' },
      { id: 4, icon: AlertCircle, title: 'Chargeback Filed', desc: 'U-SARA disputed TX-1002.', color: 'text-red-500' },
    ];
  }, [role]);

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-12">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <div className="flex items-center gap-8">
        <div className="relative group hidden md:block">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Command Interface (⌘K)" className="pl-12 pr-6 py-3 bg-slate-100 border-none rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all w-[20rem]" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all relative">
              <Bell size={24} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center"><h4 className="text-sm font-bold text-slate-900">Notifications</h4><button className="text-[10px] font-bold text-emerald-600 uppercase">Clear All</button></div>
                <div className="max-h-96 overflow-y-auto">
                   {notifs.map(n => (
                     <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer flex gap-4">
                        <div className={`p-2 rounded-xl bg-slate-50 ${n.color}`}><n.icon size={18} /></div>
                        <div><p className="text-xs font-bold text-slate-900">{n.title}</p><p className="text-[10px] text-slate-500 mt-0.5">{n.desc}</p></div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-12 w-12 rounded-2xl bg-[#0A0D14] border-4 border-slate-100 flex items-center justify-center text-white font-bold text-sm shadow-xl">{role[0]}</button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="p-6 bg-slate-50 border-b border-slate-100"><p className="text-xs font-bold text-slate-900">{role} Instance</p><p className="text-[10px] text-slate-500 font-medium">Internal Domain Auth</p></div>
                <div className="p-2">
                   <button className="w-full text-left px-5 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-xs font-bold text-slate-700"><User size={16} /> Identity Core</button>
                   <div className="h-px bg-slate-100 my-2 mx-4"></div>
                   <button onClick={onLogout} className="w-full text-left px-5 py-3 rounded-xl hover:bg-red-50 flex items-center gap-3 text-xs font-bold text-red-500"><LogOut size={16} /> Terminate</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const App = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (role === 'Merchant') setActiveTab('analytics');
    else if (role === 'Admin') setActiveTab('health');
  }, [role]);

  if (!role) {
    return <AuthScreen onLogin={setRole} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-poppins selection:bg-emerald-100 selection:text-emerald-900 antialiased">
      <Sidebar role={role} activeTab={activeTab} onTabChange={setActiveTab} onLogout={() => setRole(null)} />
      <div className="flex-1 flex flex-col">
        <Header title={role === 'Merchant' ? 'Merchant Ecosystem' : 'Infrastructure Control'} role={role} onLogout={() => setRole(null)} />
        <main className="p-12 flex-1 overflow-y-auto">
          {role === 'Merchant' && <MerchantDashboard txns={ALL_TRANSACTIONS} activeTab={activeTab} />}
          {role === 'Admin' && <AdminDashboard txns={ALL_TRANSACTIONS} activeTab={activeTab} />}
        </main>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, DollarSign, Briefcase, Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  monthRevenue: number
  jobsCompleted: number
  collectionRate: number
  avgInvoice: number
  activeCustomers: number
  weeklyRevenue: { label: string; amount: number }[]
  jobStatusCounts: { status: string; count: number; color: string }[]
  busiestDay: string
  avgDaysToPayment: number
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const STATUS_COLORS: Record<string, string> = {
  completed: '#10B981',
  in_progress: '#F59E0B',
  scheduled: '#3B82F6',
  confirmed: '#8B5CF6',
  paid: '#10B981',
  invoiced: '#A855F7',
  cancelled: '#6B7280',
}

type Period = '30' | '90' | 'all'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('30')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const periodStart = period === 'all'
        ? new Date(2020, 0, 1).toISOString()
        : new Date(now.getTime() - Number(period) * 24 * 60 * 60 * 1000).toISOString()

      const [{ data: invoices }, { data: jobs }, { data: customers }] = await Promise.all([
        supabase.from('invoices').select('amount, status, issued_at, paid_at').eq('pro_id', user.id).gte('issued_at', periodStart),
        supabase.from('jobs').select('status, scheduled_at, final_amount, quoted_amount').eq('pro_id', user.id).gte('scheduled_at', periodStart),
        supabase.from('customers').select('id, created_at').eq('pro_id', user.id).gte('created_at', periodStart),
      ])

      const paid = (invoices || []).filter(i => i.status === 'paid')
      const sent = (invoices || []).filter(i => i.status === 'sent' || i.status === 'paid')
      const totalRevenue = paid.reduce((s, i) => s + i.amount, 0)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthRevenue = paid.filter(i => i.paid_at && i.paid_at >= monthStart).reduce((s, i) => s + i.amount, 0)
      const jobsCompleted = (jobs || []).filter(j => j.status === 'completed' || j.status === 'paid').length
      const collectionRate = sent.length > 0 ? Math.round((paid.length / sent.length) * 100) : 0
      const avgInvoice = paid.length > 0 ? totalRevenue / paid.length : 0

      // Weekly revenue -- last 8 weeks
      const weeklyRevenue: { label: string; amount: number }[] = []
      for (let w = 7; w >= 0; w--) {
        const wStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000)
        const wEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000)
        const label = `W${8 - w}`
        const amount = paid
          .filter(i => i.paid_at && new Date(i.paid_at) >= wStart && new Date(i.paid_at) < wEnd)
          .reduce((s, i) => s + i.amount, 0)
        weeklyRevenue.push({ label, amount })
      }

      // Job status breakdown
      const statusMap: Record<string, number> = {}
      ;(jobs || []).forEach(j => { statusMap[j.status] = (statusMap[j.status] || 0) + 1 })
      const jobStatusCounts = Object.entries(statusMap).map(([status, count]) => ({
        status, count, color: STATUS_COLORS[status] || '#6B7280'
      })).sort((a, b) => b.count - a.count)

      // Busiest day of week
      const dayMap: Record<number, number> = {}
      ;(jobs || []).forEach(j => {
        const d = new Date(j.scheduled_at).getDay()
        dayMap[d] = (dayMap[d] || 0) + 1
      })
      const busiestDayNum = Object.entries(dayMap).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
      const busiestDay = busiestDayNum ? DAYS[Number(busiestDayNum[0])] : 'N/A'

      // Avg days to payment
      const paidWithDates = paid.filter(i => i.issued_at && i.paid_at)
      const avgDaysToPayment = paidWithDates.length > 0
        ? Math.round(paidWithDates.reduce((s, i) => {
            return s + (new Date(i.paid_at!).getTime() - new Date(i.issued_at).getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / paidWithDates.length)
        : 0

      setData({
        totalRevenue,
        monthRevenue,
        jobsCompleted,
        collectionRate,
        avgInvoice,
        activeCustomers: (customers || []).length,
        weeklyRevenue,
        jobStatusCounts,
        busiestDay,
        avgDaysToPayment,
      })
      setLoading(false)
    }
    load()
  }, [period])

  const maxWeekly = data ? Math.max(...data.weeklyRevenue.map(w => w.amount), 1) : 1
  const totalJobs = data ? data.jobStatusCounts.reduce((s, j) => s + j.count, 0) : 0

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">Business Intelligence</p>
          <h1 className="font-display text-4xl tracking-wider text-white">Analytics</h1>
        </div>
        <div className="flex gap-2">
          {(['30', '90', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-lg border transition-all
                ${period === p
                  ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                  : 'bg-[#0B0F17] border-white/6 text-white/40 hover:border-white/15 hover:text-white/60'}`}>
              {p === 'all' ? 'All Time' : `${p}d`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
        </div>
      ) : data && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/8' },
              { label: 'This Month', value: `$${data.monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/8' },
              { label: 'Jobs Completed', value: data.jobsCompleted.toString(), icon: CheckCircle2, color: 'text-yellow-400', bg: 'bg-yellow-400/8' },
              { label: 'Collection Rate', value: `${data.collectionRate}%`, icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-500/8' },
              { label: 'Avg Invoice', value: `$${data.avgInvoice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/8' },
              { label: 'Active Customers', value: data.activeCustomers.toString(), icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/8' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-[#0B0F17] border border-white/6 rounded-xl p-4">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={15} className={color}/>
                </div>
                <div className="font-display text-2xl tracking-wider text-white">{value}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Weekly Revenue Bar Chart */}
            <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-6">
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-6">Revenue by Week</p>
              <div className="flex items-end gap-2 h-40">
                {data.weeklyRevenue.map((w, i) => {
                  const heightPct = maxWeekly > 0 ? (w.amount / maxWeekly) * 100 : 0
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full flex flex-col justify-end" style={{ height: '128px' }}>
                        <div
                          className="w-full rounded-t-md bg-yellow-400/70 hover:bg-yellow-400 transition-colors"
                          style={{ height: `${Math.max(heightPct, w.amount > 0 ? 4 : 0)}%` }}
                          title={`$${w.amount.toFixed(2)}`}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-white/25 uppercase">{w.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Job Status Breakdown */}
            <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-6">
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-6">Jobs by Status</p>
              {totalJobs === 0 ? (
                <div className="flex items-center justify-center h-32 text-white/20 font-mono text-xs">No job data</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.jobStatusCounts.map(({ status, count, color }) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}/>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-xs text-white/50 capitalize">{status.replace('_', ' ')}</span>
                          <span className="font-mono text-xs text-white/70">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(count / totalJobs) * 100}%`, background: color }}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insights row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { icon: Clock, label: 'Busiest Day', value: data.busiestDay, color: 'text-yellow-400' },
              { icon: DollarSign, label: 'Avg Days to Payment', value: data.avgDaysToPayment > 0 ? `${data.avgDaysToPayment} days` : 'N/A', color: 'text-blue-400' },
              { icon: TrendingUp, label: 'Jobs This Period', value: totalJobs.toString(), color: 'text-green-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 flex items-center gap-4">
                <Icon size={20} className={color}/>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">{label}</div>
                  <div className="font-display text-xl tracking-wider text-white mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

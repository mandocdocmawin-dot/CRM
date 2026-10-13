import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar, Button, Footer, PageHeader } from '../components/ui'
import { Reminder } from '../components/layout'
import seed from '../data/seed.json'
import revenueGeometry from '../data/revenue-geometry.json'
import { money } from '../data/store'
import type { PageActions } from '../types'

const kpis = [['Total revenue', '₱8.45M', '18.6%'], ['Active deals', '320', '12.3%'], ['Win rate', '67.2%', '5.4 pts'], ['New leads', '246', '21.8%'], ['Avg deal size', '₱216,667', '8.2%']]
const funnel = [['Leads', 246], ['Qualified', 164], ['Proposal', 98], ['Won', 39]] as const
const stageValues = [['New', 128], ['Qualified', 84], ['Proposal', 62], ['Negotiation', 46], ['Won', 39], ['Lost', 19]] as const
const sources = [['Referral', 86, 35], ['Website', 62, 25], ['Events', 44, 18], ['Social media', 30, 12], ['Outbound', 15, 6], ['Other', 9, 4]] as const
function DashboardCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const element = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))
  useEffect(() => {
    if (!element.current) return
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [])
  return <section ref={element} className={`card dashboard-motion ${visible ? 'dashboard-visible' : ''} ${className}`}>{children}</section>
}
function RevenueChart() {
  return <DashboardCard className="revenue-card dashboard-chart"><h2>Revenue over time</h2><p className="caption">Monthly revenue · Oct 2025 – Sep 2026</p><div className="revenue-plot" role="img" aria-label="Revenue trend from October 2025 to September 2026; total ₱8,450,000. Monthly numeric values are unavailable."><div className="revenue-axis">{['₱1M', '₱750K', '₱500K', '₱250K', '₱0'].map(t => <span key={t}>{t}</span>)}</div><div className="revenue-vector">{(['desktop', 'mobile'] as const).map(size => <svg key={size} className={`revenue-svg revenue-svg-${size}`} viewBox={revenueGeometry[size].viewBox} preserveAspectRatio="none" aria-hidden="true">{revenueGeometry[size].grid.map(d => <path key={d} d={d} fill="none" stroke="var(--crm-color-border-subtle)" vectorEffect="non-scaling-stroke" />)}<g className="revenue-series"><path className="revenue-area" d={revenueGeometry[size].area} fill="var(--crm-color-chart-1)" opacity="0.14" /><path className="revenue-line" d={revenueGeometry[size].line} fill="none" stroke="var(--crm-color-chart-1)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></g></svg>)}</div></div><div className="month-axis desktop-months">{['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map(t => <span key={t}>{t}</span>)}</div><div className="month-axis mobile-months">{['Oct', 'Dec', 'Feb', 'Apr', 'Jun', 'Sep'].map(t => <span key={t}>{t}</span>)}</div><div className="chart-legend"><span className="color-dot color-1" />Revenue <strong>Total ₱8,450,000</strong></div></DashboardCard>
}
export function Dashboard({ open, navigate }: PageActions) {
  const [range, setRange] = useState('12m')
  const [sourceIndex, setSourceIndex] = useState<number | null>(null)
  return <>
    <button className="mobile-search-trigger" onClick={() => open({ type: 'search' })}>⌕ &nbsp; Search contacts, deals and follow-ups</button>
    <PageHeader title="Dashboard" description={'Good morning, Andrea.\nHere’s how your team is doing.'}><Button variant="primary" onClick={() => open({ type: 'deal' })}>+ Add deal</Button></PageHeader>
    <div className="date-range-row"><div className="segments" role="group" aria-label="Dashboard date range">{['7d', '30d', '12m'].map(r => <button key={r} className={range === r ? 'selected' : ''} aria-pressed={range === r} onClick={() => setRange(r)}>{r}</button>)}</div><span className="date-caption">{range === '12m' ? 'Oct 2025 – Sep 2026' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}<span className="mobile-inline"> · Updated just now</span></span><span className="update-status">Updated just now · Sample data</span></div>
    {range !== '12m' ? <DashboardCard className="period-empty"><h2>No sample data for this period</h2><p>Select 12 months to explore your team’s results.</p><Button variant="primary" onClick={() => setRange('12m')}>View 12 months</Button></DashboardCard> : <>
      <div className="kpi-grid">{kpis.map(([title, value, change]) => <DashboardCard key={title} className="kpi"><p>{title}</p><strong>{value}</strong><small>↗ {change} vs prior year</small></DashboardCard>)}</div>
      <div className="dashboard-revenue-grid"><RevenueChart /><DashboardCard className="funnel-card dashboard-chart"><h2>Sales funnel</h2><p className="caption">Lead-to-win conversion · 12 months</p><div className="funnel-bars">{funnel.map(([label, value], i) => <div key={label}><div className="bar-label"><span>{label}</span><strong>{value}</strong></div><div className="bar-track"><div className={`bar color-${i + 1}`} style={{ width: `${value / 246 * 100}%` }} /></div></div>)}</div><p className="conversion-caption">15.9% of new leads became won deals</p></DashboardCard></div>
      <div className="dashboard-pair"><DashboardCard className="stages-card dashboard-chart"><h2>Deals by stage</h2><p className="caption"><span className="desktop-copy">320 active deals · 58 closed deals</span><span className="mobile-copy">320 active · 58 closed deals</span></p><div className="stage-bars">{stageValues.map(([label, value], i) => <div className="stage-bar-row" key={label}><span>{label}</span><div className="bar-track"><div className={`bar color-${i + 1}`} style={{ width: `${value / 128 * 100}%` }} /></div><strong>{value}</strong></div>)}</div></DashboardCard><DashboardCard className="sources-card dashboard-chart"><h2>Lead sources</h2><p className="caption">246 new leads · where relationships begin</p><div className="sources-body"><div className="donut-wrap"><img className="chart-light" src="/assets/charts/lead-sources-donut.svg" width="192" height="192" alt="246 new leads by source: Referral 86, Website 62, Events 44, Social media 30, Outbound 15, Other 9" /><img className="chart-dark" src="/assets/charts/lead-sources-donut-dark.svg" width="192" height="192" alt="246 new leads by source: Referral 86, Website 62, Events 44, Social media 30, Outbound 15, Other 9" /></div><div className="source-legend">{sources.map(([label, count, percentage], i) => <button key={label} className={sourceIndex === i ? 'highlighted' : ''} aria-pressed={sourceIndex === i} onClick={() => setSourceIndex(sourceIndex === i ? null : i)}><span className={`color-dot color-${i + 1}`} /><span>{label}</span><strong>{count} · {percentage}%</strong></button>)}</div></div>{sourceIndex !== null && <span className="sr-only" role="status">{sources[sourceIndex][0]}: {sources[sourceIndex][1]} leads, {sources[sourceIndex][2]} percent</span>}</DashboardCard></div>
      <div className="dashboard-pair"><DashboardCard className="leaderboard-card"><div className="card-heading"><h2>Sales rep leaderboard</h2><small className="desktop-copy">12 months</small></div><p className="caption desktop-copy">Recognizing the people behind your wins</p><p className="caption mobile-copy">Revenue and wins · 12 months</p><div className="leaderboard-rows">{seed.leaderboard.map((rep, i) => <div className="leaderboard-row" key={rep.name}><span className="rank">{i + 1}</span><Avatar label={rep.initials} /><div><strong>{rep.name}</strong><small>{rep.won} deals won</small></div><strong className="rep-revenue">{money(rep.revenue)}</strong></div>)}</div><Button variant="ghost" onClick={() => open({ type: 'team' })}>View team performance →</Button></DashboardCard><DashboardCard className="activity-card"><div className="card-heading"><h2>Recent activity</h2><small className="desktop-copy">Today</small></div><p className="caption desktop-copy">Stay close to every customer conversation</p><p className="caption mobile-copy">Today · Your latest conversations</p><div className="activity-rows">{seed.activities.map(activity => <div className="activity-row" key={activity.title}><Avatar label={activity.initials} /><div><strong>{activity.title}</strong><small>{activity.detail}</small></div></div>)}</div><Button variant="ghost" onClick={() => open({ type: 'activity' })}>View all activity →</Button></DashboardCard></div>
    </>}
    <div className="mobile-only"><Reminder navigate={navigate} mobile /></div><Footer />
  </>
}





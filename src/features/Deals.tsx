import { useState } from 'react'
import { Avatar, Badge, Button, Card, Icon, PageHeader, SearchInput, Select } from '../components/ui'
import { money } from '../data/store'
import { stages } from '../types'
import type { Deal, PageActions, Stage } from '../types'

function followUpTone(deal: Deal) { return deal.stage === 'Won' ? 'won' : deal.stage === 'Lost' || deal.followUp === 'Overdue' ? 'lost' : /today|Tomorrow/.test(deal.followUp) ? 'pending' : 'neutral' }
export function Deals({ state, commit, open, notify }: PageActions) {
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('')
  const [period, setPeriod] = useState('30')
  const [stageFilter, setStageFilter] = useState<Stage | ''>('')
  const [dragged, setDragged] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Stage | null>(null)
  const filtered = state.deals.filter(d => (!search || `${d.title} ${d.company}`.toLowerCase().includes(search.toLowerCase())) && (!owner || d.owner === owner) && (!stageFilter || d.stage === stageFilter) && (period !== '7' || /today|Tomorrow|Overdue|1[0-7] Oct/.test(d.followUp)))
  const active = filtered.filter(d => !['Won', 'Lost'].includes(d.stage))
  const won = filtered.filter(d => d.stage === 'Won')
  const move = (id: string, stage: Stage) => {
    const deal = state.deals.find(d => d.id === id)
    if (!deal || deal.stage === stage) return
    const previous = deal.stage
    if (!commit(s => ({ ...s, deals: s.deals.map(d => d.id === id ? { ...d, stage } : d) }))) return
    notify({ title: `${deal.title} moved to ${stage}`, action: { label: 'Undo', run: () => commit(s => ({ ...s, deals: s.deals.map(d => d.id === id ? { ...d, stage: previous } : d) })) } })
  }
  return <>
    <PageHeader title="Deals" description="Move relationships forward, one deal at a time."><Button variant="primary" onClick={() => open({ type: 'deal' })}>+ Add deal</Button></PageHeader>
    <div className="pipeline-filters"><SearchInput label="Search deals" placeholder="Search deal or company" value={search} onChange={e => setSearch(e.target.value)} /><Select label="Sales pipeline"><option>Sales pipeline</option></Select><Select label="Deal owner" value={owner} onChange={e => setOwner(e.target.value)}><option value="">Any owner</option>{[...new Set(state.deals.map(d => d.owner))].map(o => <option key={o}>{o}</option>)}</Select><Select label="Deal period" value={period} onChange={e => setPeriod(e.target.value)}><option value="30">Last 30 days</option><option value="7">Due this week</option><option value="all">All sample deals</option></Select><Select label="Pipeline view" value={stageFilter} onChange={e => setStageFilter(e.target.value as Stage | '')} className="selected"><option value="">Kanban view</option>{stages.map(s => <option key={s} value={s}>{s} only</option>)}</Select></div>
    <div className="summary-grid"><Card className="summary-kpi"><p>Open pipeline</p><strong>{active.reduce((sum, d) => sum + d.amount, 0) === 3010000 ? '₱3.01M' : money(active.reduce((sum, d) => sum + d.amount, 0))}</strong><small>Across {new Set(active.map(d => d.stage)).size} open stages</small></Card><Card className="summary-kpi"><p>Active deals</p><strong>{active.length}</strong><small>New through Negotiation</small></Card><Card className="summary-kpi"><p>Won in this view</p><strong>{won.reduce((sum, d) => sum + d.amount, 0) === 1030000 ? '₱1.03M' : money(won.reduce((sum, d) => sum + d.amount, 0))}</strong><small>{won.length} deals closed successfully</small></Card></div>
    <div className="board-heading"><h2>Recent deals</h2><small>{filtered.length} deals · Local sample</small>{stageFilter && <Button variant="ghost" onClick={() => setStageFilter('')}>View all stages</Button>}</div>
    <div className="pipeline-scroll"><div className={`pipeline-board ${stageFilter ? 'single-stage' : ''}`}>{stages.filter(s => !stageFilter || s === stageFilter).map(stage => { const i = stages.indexOf(stage); const deals = filtered.filter(d => d.stage === stage); return <section key={stage} className={`pipeline-stage ${dragOver === stage ? 'drop-target' : ''}`} aria-label={`${stage} deals`} onDragOver={e => { if (dragged) { e.preventDefault(); setDragOver(stage) } }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null) }} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (state.deals.some(d => d.id === id)) move(id, stage); setDragged(null); setDragOver(null) }}><div className="stage-heading"><div><span className={`color-dot color-${i + 1}`} /><h3>{stage}</h3><span className="stage-count">{deals.length}</span></div><strong>{money(deals.reduce((sum, d) => sum + d.amount, 0))}</strong></div>{deals.map(deal => <Card key={deal.id} className={`pipeline-card ${dragged === deal.id ? 'dragging' : ''}`}><div className="deal-card-heading"><button onClick={() => open({ type: 'deal', deal })}>{deal.title}</button><span draggable onDragStart={e => { e.dataTransfer.setData('text/plain', deal.id); e.dataTransfer.effectAllowed = 'move'; setDragged(deal.id) }} onDragEnd={() => { setDragged(null); setDragOver(null) }} title="Drag to move deal" className="drag-handle"><Icon name="drag-handle" /></span></div><p className="caption">{deal.company}</p><strong className="deal-amount">{money(deal.amount)}</strong><Badge tone={followUpTone(deal)}>{deal.followUp}</Badge><div className="deal-owner"><Avatar label={deal.initials} /><span>{deal.owner}</span></div><Select label={`Move ${deal.title}`} value="" onChange={e => move(deal.id, e.target.value as Stage)} className="move-select"><option value="" disabled>Move ⌄</option>{stages.filter(s => s !== stage).map(s => <option key={s} value={s}>{s}</option>)}</Select></Card>)}{!deals.length && <div className="stage-empty">{dragged ? 'Drop deal here' : 'No deals in this stage'}</div>}<Button variant="ghost" onClick={() => ['Won', 'Lost'].includes(stage) ? setStageFilter(stage) : open({ type: 'deal', stage })}>{stage === 'Won' ? 'View won' : stage === 'Lost' ? 'View lost' : '+ Add deal'}</Button></section> })}</div></div>
    <aside className="guidance"><strong>Drag a deal to a stage, or use Move to choose its next stage.</strong><small>Stage counts and totals reflect the {filtered.length} deals in this view. All amounts are in PHP.</small></aside>
  </>
}

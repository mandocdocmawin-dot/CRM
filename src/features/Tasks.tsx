import { useState } from 'react'
import { Avatar, Badge, Button, Card, Check, EmptyState, PageHeader, SearchInput, Select } from '../components/ui'
import { owners } from '../data/store'
import type { PageActions, Task, TaskGroup } from '../types'

export function Tasks({ state, commit, open, notify }: PageActions) {
  const [view, setView] = useState('team')
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('')
  const [priority, setPriority] = useState('')
  const [collapsed, setCollapsed] = useState<string[]>([])
  const complete = (task: Task) => {
    const completed = !task.completed
    if (!commit(s => ({ ...s, tasks: s.tasks.map(t => t.id === task.id ? { ...t, completed } : t) }))) return
    notify({ title: completed ? 'Follow-up completed' : 'Follow-up reopened', message: task.title, action: { label: 'Undo', run: () => commit(s => ({ ...s, tasks: s.tasks.map(t => t.id === task.id ? { ...t, completed: !completed } : t) })) } })
  }
  const active = state.tasks.filter(t => !t.completed)
  const filtered = state.tasks.filter(t => (view === 'completed' ? t.completed : !t.completed) && (view !== 'mine' || t.owner === 'Andrea Reyes') && (!search || `${t.title} ${t.context}`.toLowerCase().includes(search.toLowerCase())) && (!owner || t.owner === owner) && (!priority || t.priority === priority))
  const groups: (TaskGroup | 'Completed')[] = view === 'completed' ? ['Completed'] : ['Overdue', 'Today', 'Upcoming']
  return <>
    <PageHeader title="Tasks" description="Keep promises and move customer conversations forward."><Button variant="primary" onClick={() => open({ type: 'task' })}>+ Add follow-up</Button></PageHeader>
    <div className="saved-views task-views"><Button variant="ghost" className={view === 'team' ? 'selected' : ''} aria-pressed={view === 'team'} onClick={() => setView('team')}>Team tasks · {active.length}</Button><Button variant="ghost" className={view === 'mine' ? 'selected' : ''} aria-pressed={view === 'mine'} onClick={() => setView('mine')}>Assigned to me · {active.filter(t => t.owner === 'Andrea Reyes').length}</Button><Button variant="ghost" className={view === 'completed' ? 'selected' : ''} aria-pressed={view === 'completed'} onClick={() => setView('completed')}>Completed · {18 + state.tasks.filter(t => t.completed).length}</Button><small>Tuesday, 13 October 2026</small></div>
    <div className="task-filters"><SearchInput label="Search tasks" placeholder="Search task, contact or company" value={search} onChange={e => setSearch(e.target.value)} /><Select label="Task owner" value={owner} onChange={e => setOwner(e.target.value)}><option value="">Any owner</option>{owners.map(o => <option key={o}>{o}</option>)}</Select><Select label="Task priority" value={priority} onChange={e => setPriority(e.target.value)}><option value="">All priorities</option>{['High priority', 'Normal priority', 'Low priority'].map(p => <option key={p}>{p}</option>)}</Select><small>Updated just now</small></div>
    <div className="summary-grid">{(['Overdue', 'Today', 'Upcoming'] as const).map(group => <Card key={group} className={`summary-kpi summary-${group.toLowerCase()}`}><p>{group}</p><strong>{active.filter(t => t.group === group).length}</strong><small>{group === 'Overdue' ? 'Reconnect with these customers' : group === 'Today' ? 'Your conversations for 13 October' : 'Plan ahead for the next few days'}</small></Card>)}</div>
    {filtered.length === 0 ? <Card><EmptyState title={view === 'completed' ? 'No completed follow-ups in this sample' : 'No follow-ups found'} message={view === 'completed' ? 'Complete a follow-up to see it here.' : 'Try another filter or add a new follow-up.'} action={view !== 'completed' ? <Button variant="primary" onClick={() => open({ type: 'task' })}>+ Add follow-up</Button> : undefined} /></Card> : groups.map(group => {
      const tasks = filtered.filter(t => group === 'Completed' || t.group === group)
      if (!tasks.length) return null
      const isCollapsed = collapsed.includes(group)
      return <Card key={group} className={`task-group group-${group.toLowerCase()}`}><button className="task-group-heading" aria-expanded={!isCollapsed} aria-controls={`tasks-${group}`} onClick={() => setCollapsed(isCollapsed ? collapsed.filter(c => c !== group) : [...collapsed, group])}><h2>{group} · {tasks.length}</h2><small>{group === 'Overdue' ? 'Start here to get conversations back on track.' : group === 'Today' ? 'Six follow-ups to keep your customers moving.' : group === 'Upcoming' ? 'Prepare for your next customer conversations.' : 'Follow-ups you have finished.'}</small><span aria-hidden="true">{isCollapsed ? '⌄' : '⌃'}</span></button><div id={`tasks-${group}`} hidden={isCollapsed}>{tasks.map(task => <div key={task.id} className={`task-row ${task.completed ? 'task-completed' : ''}`}><label className="task-check"><Check checked={task.completed} aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`} onChange={() => complete(task)} /></label><div className="task-details"><button className="task-title" onClick={() => open({ type: 'task', task })}>{task.title}</button><small>{task.context}</small><Badge tone={task.priority === 'High priority' ? 'lost' : 'neutral'}>{task.priority}</Badge></div><div className={`task-due ${task.group === 'Overdue' ? 'overdue' : task.group === 'Today' ? 'due-today' : ''}`}><span>{task.dueDate}</span><small>{task.dueStatus}</small></div><div className="owner-cell"><Avatar label={task.initials} /><span>{task.owner}</span></div><Button onClick={() => open({ type: 'task', task })}>Reschedule</Button><details className="dropdown task-more"><summary className="btn btn-ghost">More ⌄</summary><div className="dropdown-panel"><button onClick={() => open({ type: 'task', task })}>Edit follow-up</button><button onClick={() => complete(task)}>{task.completed ? 'Reopen task' : 'Mark complete'}</button></div></details></div>)}</div></Card>
    })}
    <aside className="guidance"><strong>Check a task to mark it complete. Use Undo if you finish one by mistake.</strong><small>Use Reschedule to choose a better time. All dates are shown in Singapore / Manila time.</small></aside>
  </>
}

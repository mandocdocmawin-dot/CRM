import { useState } from 'react'
import type { FormEvent } from 'react'
import { Avatar, Badge, Button, Field, Modal, SearchInput } from './ui'
import { initials, money, nowLabel, owners, taskDate } from '../data/store'
import { stages } from '../types'
import type { Contact, Deal, ModalState, PageActions, Stage } from '../types'
import seed from '../data/seed.json'

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim()
const inputDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function FormActions({ close, submit = 'Save changes', danger = false }: { close: () => void; submit?: string; danger?: boolean }) { return <div className="form-actions"><Button onClick={close}>Cancel</Button><Button type="submit" variant={danger ? 'danger' : 'primary'}>{submit}</Button></div> }

function ContactForm({ modal, close, state, commit, notify }: PageActions & { modal: Extract<ModalState, { type: 'contact' }>; close: () => void }) {
  const contact = modal.contact
  const [error, setError] = useState('')
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget)
    const name = text(data, 'name'), email = text(data, 'email'), company = text(data, 'company'), owner = text(data, 'owner')
    if (!name || !email || !company) { setError('Enter a name, email and company.'); return }
    if (state.contacts.some(c => c.email.toLowerCase() === email.toLowerCase() && c.id !== contact?.id)) { setError('A contact with this email already exists.'); return }
    const value: Contact = { id: contact?.id || crypto.randomUUID(), name, email, company, owner, status: text(data, 'status') as Contact['status'], initials: initials(owner), selected: contact?.selected ?? false, followUpDate: contact?.followUpDate || 'No follow-up', followUpNote: contact?.followUpNote || 'Add a follow-up' }
    if (!commit(s => ({ ...s, contacts: contact ? s.contacts.map(c => c.id === contact.id ? value : c) : [...s.contacts, value] }))) { setError('Couldn’t save your changes. Your entries are still here. Try again.'); return } notify({ title: contact ? 'Contact updated' : 'Contact added', message: name }); close()
  }
  return <Modal title={contact ? 'Edit contact' : 'Add contact'} close={close}><form onSubmit={submit}><div className="form-grid"><Field label="Full name"><input name="name" required maxLength={120} defaultValue={contact?.name} autoComplete="name" autoFocus /></Field><Field label="Email address"><input name="email" type="email" required defaultValue={contact?.email} autoComplete="email" /></Field><Field label="Company"><input name="company" required maxLength={120} defaultValue={contact?.company} autoComplete="organization" /></Field><Field label="Status"><select name="status" defaultValue={contact?.status || 'Lead'}>{['Lead', 'Active', 'Customer', 'Inactive'].map(s => <option key={s}>{s}</option>)}</select></Field><Field label="Contact owner"><select name="owner" defaultValue={contact?.owner || 'Andrea Reyes'}>{owners.map(o => <option key={o}>{o}</option>)}</select></Field></div>{error && <p role="alert" className="form-error">{error}</p>}<FormActions close={close} submit={contact ? 'Save contact' : 'Add contact'} /></form></Modal>
}
function DealForm({ modal, close, commit, notify }: PageActions & { modal: Extract<ModalState, { type: 'deal' }>; close: () => void }) {
  const deal = modal.deal
  const [error, setError] = useState('')
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget); const amount = Number(text(data, 'amount'))
    if (!text(data, 'title') || !text(data, 'company') || !Number.isFinite(amount) || amount <= 0) { setError('Enter a deal, company and a positive PHP amount.'); return }
    const owner = text(data, 'owner'); const ownerInitials: Record<string, string> = { 'Andrea R.': 'AR', 'Juan D.': 'JD', 'Maria S.': 'MS', 'Paolo M.': 'PM', 'Bea V.': 'BV' }
    const value: Deal = { id: deal?.id || crypto.randomUUID(), title: text(data, 'title'), company: text(data, 'company'), amount, owner, initials: ownerInitials[owner] || initials(owner), stage: text(data, 'stage') as Stage, followUp: text(data, 'follow-up') || 'No follow-up' }
    if (!commit(s => ({ ...s, deals: deal ? s.deals.map(d => d.id === deal.id ? value : d) : [...s.deals, value] }))) { setError('Couldn’t save your changes. Your entries are still here. Try again.'); return } notify({ title: deal ? 'Deal updated' : 'Deal added', message: value.title }); close()
  }
  return <Modal title={deal ? deal.title : 'Add deal'} close={close}><form onSubmit={submit}><div className="form-grid"><Field label="Deal title"><input name="title" required maxLength={120} defaultValue={deal?.title} autoFocus /></Field><Field label="Company"><input name="company" required maxLength={120} defaultValue={deal?.company} /></Field><Field label="Amount (PHP)"><input name="amount" type="number" min="1" max="100000000000" step="1" required defaultValue={deal?.amount} /></Field><Field label="Stage"><select name="stage" defaultValue={deal?.stage || modal.stage || 'New'}>{stages.map(s => <option key={s}>{s}</option>)}</select></Field><Field label="Deal owner"><select name="owner" defaultValue={deal?.owner || 'Andrea R.'}>{['Andrea R.', 'Juan D.', 'Maria S.', 'Paolo M.', 'Bea V.'].map(o => <option key={o}>{o}</option>)}</select></Field><Field label="Next follow-up"><input name="follow-up" maxLength={80} defaultValue={deal?.followUp} placeholder="e.g. 16 Oct" /></Field></div>{error && <p role="alert" className="form-error">{error}</p>}<FormActions close={close} submit={deal ? 'Save deal' : 'Add deal'} /></form></Modal>
}
function TaskForm({ modal, close, state, commit, notify }: PageActions & { modal: Extract<ModalState, { type: 'task' | 'bulk-task' }>; close: () => void }) {
  const task = modal.type === 'task' ? modal.task : undefined
  const contact = modal.type === 'task' ? modal.contact : undefined
  const bulk = modal.type === 'bulk-task' ? modal.ids : null
  const [error, setError] = useState('')
  const [reschedule, setReschedule] = useState(false)
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget); const title = text(data, 'title'); const owner = text(data, 'owner')
    if (!title) { setError('Enter a follow-up title.'); return }
    const date = text(data, 'date'), time = text(data, 'time')
    const due = task && !reschedule ? { dueDate: task.dueDate, dueStatus: task.dueStatus, group: task.group } : taskDate(date, time)
    const selected = bulk ? state.contacts.filter(c => bulk.includes(c.id)) : [state.contacts.find(c => c.id === text(data, 'contact'))]
    if (!selected.length) { setError('Choose at least one contact.'); return }
    const kind = text(data, 'kind')
    const tasks = selected.map(c => ({ id: task?.id || crypto.randomUUID(), title, context: c ? `${kind} · ${c.company} · ${c.name}` : task?.context || kind, ...due, owner, initials: initials(owner), priority: text(data, 'priority'), completed: task?.completed || false }))
    const dateLabel = nowLabel()
    const saved = commit(s => ({ ...s, tasks: task ? s.tasks.map(t => t.id === task.id ? tasks[0] : t) : [...s.tasks, ...tasks], timeline: [...selected.filter((c): c is Contact => Boolean(c)).map(c => ({ id: crypto.randomUUID(), contactId: c.id, title: task ? 'Follow-up rescheduled' : 'Follow-up scheduled', when: `${dateLabel} · Andrea Reyes`, details: `${title} · ${due.dueDate}`, initials: 'AR' })), ...s.timeline] }))
    if (!saved) { setError('Couldn’t save your changes. Your entries are still here. Try again.'); return }
    notify({ title: task ? 'Follow-up updated' : `${tasks.length === 1 ? 'Follow-up' : `${tasks.length} follow-ups`} added` }); close()
  }
  const existingName = task?.context.split(' · ').at(-1)
  const existingContact = state.contacts.find(c => c.name === existingName)
  return <Modal title={task ? 'Edit & reschedule follow-up' : bulk ? 'Add follow-ups in bulk' : 'Add follow-up'} close={close}><form onSubmit={submit}><div className="form-grid"><Field label="Follow-up title"><input name="title" required maxLength={160} defaultValue={task?.title} autoFocus /></Field>{bulk ? <p className="caption">This follow-up will be added to {bulk.length} selected contacts.</p> : <Field label="Contact"><select name="contact" defaultValue={contact?.id || existingContact?.id || ''}><option value="">No linked contact</option>{state.contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}</select></Field>}<Field label="Type"><select name="kind" defaultValue={task?.context.split(' · ')[0] || 'Call'}>{['Call', 'Email', 'Meeting', 'Demo', 'Quote'].map(k => <option key={k}>{k}</option>)}</select></Field><Field label="Owner"><select name="owner" defaultValue={task?.owner || 'Andrea Reyes'}>{owners.map(o => <option key={o}>{o}</option>)}</select></Field><Field label="Priority"><select name="priority" defaultValue={task?.priority || 'Normal priority'}>{['High priority', 'Normal priority', 'Low priority'].map(p => <option key={p}>{p}</option>)}</select></Field>{task && <div className="reschedule-toggle"><p>Current due date: <strong>{task.dueDate}</strong></p><label><input type="checkbox" checked={reschedule} onChange={e => setReschedule(e.target.checked)} /> Choose a new date and time</label></div>}{(!task || reschedule) && <><Field label="Date"><input name="date" type="date" required defaultValue={inputDate()} min="2020-01-01" max="2100-12-31" /></Field><Field label="Time (Singapore / Manila)"><input name="time" type="time" required defaultValue="10:00" /></Field></>}</div>{error && <p role="alert" className="form-error">{error}</p>}<FormActions close={close} submit={task ? 'Save follow-up' : 'Add follow-up'} /></form></Modal>
}
function SearchDialog({ close, state, navigate, open }: PageActions & { close: () => void }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const contacts = q ? state.contacts.filter(c => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q)) : []
  const deals = q ? state.deals.filter(d => `${d.title} ${d.company}`.toLowerCase().includes(q)) : []
  const tasks = q ? state.tasks.filter(t => `${t.title} ${t.context}`.toLowerCase().includes(q)) : []
  return <Modal title="Search your workspace" close={close} className="search-modal"><SearchInput label="Search your workspace" placeholder="Search contacts, deals and follow-ups" value={query} onChange={e => setQuery(e.target.value)} autoFocus /><div className="search-results">{!q && <p className="caption">Find a person, company, deal or follow-up.</p>}{contacts.length > 0 && <><h3>Contacts</h3>{contacts.map(c => <button key={c.id} onClick={() => { navigate(`/contacts/${encodeURIComponent(c.id)}`); close() }}><Avatar name={c.name} /><span><strong>{c.name}</strong><small>{c.company} · {c.email}</small></span><span>→</span></button>)}</>}{deals.length > 0 && <><h3>Deals</h3>{deals.map(d => <button key={d.id} onClick={() => open({ type: 'deal', deal: d })}><span><strong>{d.title}</strong><small>{d.company} · {money(d.amount)}</small></span><Badge tone={d.stage === 'Won' ? 'won' : 'lead'}>{d.stage}</Badge></button>)}</>}{tasks.length > 0 && <><h3>Follow-ups</h3>{tasks.map(t => <button key={t.id} onClick={() => open({ type: 'task', task: t })}><span><strong>{t.title}</strong><small>{t.context} · {t.dueDate}</small></span><span>→</span></button>)}</>}{q && !contacts.length && !deals.length && !tasks.length && <p>No results for “{query}”. Try another name or company.</p>}</div></Modal>
}
export function Forms({ modal, close, ...actions }: PageActions & { modal: ModalState; close: () => void }) {
  if (!modal) return null
  if (modal.type === 'contact') return <ContactForm key={modal.contact?.id || 'new'} modal={modal} close={close} {...actions} />
  if (modal.type === 'deal') return <DealForm key={modal.deal?.id || 'new'} modal={modal} close={close} {...actions} />
  if (modal.type === 'task' || modal.type === 'bulk-task') return <TaskForm key={modal.type === 'task' ? modal.task?.id || modal.contact?.id || 'new' : 'bulk'} modal={modal} close={close} {...actions} />
  if (modal.type === 'search') return <SearchDialog close={close} {...actions} />
  if (modal.type === 'assign') return <Modal title={`Assign owner · ${modal.ids.length} contacts`} close={close}><form onSubmit={e => { e.preventDefault(); const owner = text(new FormData(e.currentTarget), 'owner'); if (!actions.commit(s => ({ ...s, contacts: s.contacts.map(c => modal.ids.includes(c.id) ? { ...c, owner, initials: initials(owner) } : c) }))) return; actions.notify({ title: 'Contact owners updated' }); close() }}><Field label="New owner"><select name="owner">{owners.map(o => <option key={o}>{o}</option>)}</select></Field><FormActions close={close} submit="Assign owner" /></form></Modal>
  if (modal.type === 'delete') return <Modal title={`Delete ${modal.contact.name}?`} close={close}><p>{modal.contact.name.split(' ')[0]} will be removed from your contacts. You can undo this action from the confirmation message.</p><p className="deletion-warning">Related deals stay in your pipeline.</p><div className="form-actions"><Button onClick={close}>Cancel</Button><Button variant="danger" onClick={() => { const contact = modal.contact; const index = actions.state.contacts.findIndex(c => c.id === contact.id); if (!actions.commit(s => ({ ...s, contacts: s.contacts.filter(c => c.id !== contact.id) }))) return; actions.navigate('/contacts'); actions.notify({ title: 'Contact deleted', message: `${contact.name} was removed. Undo to restore ${contact.name.split(' ')[0]}'s contact.`, action: { label: 'Undo', run: () => actions.commit(s => { if (s.contacts.some(c => c.id === contact.id)) return s; const contacts = [...s.contacts]; contacts.splice(Math.min(index, contacts.length), 0, contact); return { ...s, contacts } }) } }); close() }}>Delete contact</Button></div></Modal>
  if (modal.type === 'help') return <Modal title="Help & shortcuts" close={close}><div className="help-content"><p>Keep your customer conversations moving in Bayanihan Sales.</p><dl><dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt><dd>Search contacts, deals and follow-ups</dd><dt><kbd>Esc</kbd></dt><dd>Close a dialog</dd></dl><p>Changes are saved in this browser. Export contacts to download a CSV. Complete follow-ups with the checkbox, move deals between stages, and use Undo to recover your latest action.</p><Button onClick={() => { actions.navigate('/states'); close() }}>View states & recovery</Button></div></Modal>
  if (modal.type === 'team') return <Modal title="Sales rep leaderboard" close={close}><p className="caption">Revenue and wins · 12 months</p>{seed.leaderboard.map((r, i) => <div className="leaderboard-row" key={r.name}><span className="rank">{i + 1}</span><Avatar label={r.initials} /><div><strong>{r.name}</strong><small>{r.won} deals won</small></div><strong className="rep-revenue">{money(r.revenue)}</strong></div>)}</Modal>
  return <Modal title="Recent activity" close={close}><p className="caption">Today · Your latest conversations</p>{seed.activities.map(a => <div className="activity-row" key={a.title}><Avatar label={a.initials} /><div><strong>{a.title}</strong><small>{a.detail}</small></div></div>)}</Modal>
}

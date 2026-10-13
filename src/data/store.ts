import { useCallback, useEffect, useRef, useState } from 'react'
import seed from './seed.json'
import type { CRMState, Notify } from '../types'

export const owners = ['Andrea Reyes', 'Juan Dela Cruz', 'Maria Santos', 'Paolo Mendoza', 'Bea Villanueva']
export const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
export const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase()
export const nowLabel = () => new Intl.DateTimeFormat('en-SG', { timeZone: 'Asia/Singapore', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()).replace(',', ' ·')
export const key = 'sulong-crm-v1'
export function initialState(): CRMState {
  return structuredClone({ contacts: seed.contacts, deals: seed.deals, tasks: seed.tasks, notes: seed.notes, timeline: seed.timeline }) as CRMState
}
function read(): CRMState {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!raw || typeof raw !== 'object') return initialState()
    const saved = raw as CRMState
    const lists = [saved.contacts, saved.deals, saved.tasks, saved.notes, saved.timeline]
    if (!lists.every(list => Array.isArray(list) && list.every(item => item && typeof item.id === 'string'))) return initialState()
    if (!saved.contacts.every(c => typeof c.name === 'string' && typeof c.company === 'string' && typeof c.email === 'string')) return initialState()
    if (!saved.deals.every(d => typeof d.title === 'string' && Number.isFinite(d.amount))) return initialState()
    if (!saved.tasks.every(t => typeof t.title === 'string' && typeof t.context === 'string')) return initialState()
    return saved
  } catch { return initialState() }
}
export function useCRM(notify: Notify) {
  const [state, setState] = useState(read)
  const latest = useRef(state)
  const commit = useCallback((update: (state: CRMState) => CRMState) => {
    const next = update(latest.current)
    try { localStorage.setItem(key, JSON.stringify(next)) }
    catch { notify({ title: 'Couldn’t save your changes', message: 'Browser storage is unavailable. Your form is still here; try again when storage is available.', tone: 'error' }); return false }
    latest.current = next
    setState(next)
    return true
  }, [notify])
  return { state, commit }
}
export function useRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/dashboard')
  useEffect(() => {
    const update = () => { setRoute(location.hash.slice(1) || '/dashboard'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return { route, navigate: (path: string) => { location.hash = path } }
}
export function taskDate(date: string, time: string) {
  // User-entered local date/time is interpreted as Singapore / Manila time.
  const day = new Date(date + 'T12:00:00+08:00')
  const label = new Intl.DateTimeFormat('en-SG', { timeZone: 'Asia/Singapore', day: 'numeric', month: 'short' }).format(day)
  const [hours, minutes] = time.split(':').map(Number)
  const timeLabel = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const group = date < today ? 'Overdue' : date === today ? 'Today' : 'Upcoming'
  return { dueDate: `${label} · ${timeLabel}`, dueStatus: group === 'Today' ? 'Today' : group === 'Overdue' ? 'Overdue' : label, group } as const
}

import { useEffect, useId, useRef } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { ToastMessage } from '../types'
import { initials } from '../data/store'

export function Icon({ name }: { name: string }) {
  return <img src={`/assets/icons/${name}.svg`} width={name === 'drag-handle' ? 16 : 20} height={name === 'drag-handle' ? 16 : 20} className="icon" alt="" aria-hidden="true" />
}
export function Button({ variant = 'secondary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; children: ReactNode }) {
  return <button type="button" className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}
export function Avatar({ name, label, size = 32 }: { name?: string; label?: string; size?: number }) {
  return <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">{label || initials(name || '')}</span>
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone.toLowerCase()}`}>{children}</span>
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}
export function Check({ mixed = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { mixed?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed }, [mixed])
  return <input ref={ref} type="checkbox" className="check" {...props} />
}
export function SearchInput({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`search-input ${className}`}><Icon name="search" /><input type="search" aria-label={label} {...props} /></label>
}
export function Select({ label, className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <span className={`select-wrap ${className}`}><select aria-label={label} {...props}>{children}</select><span aria-hidden="true">⌄</span></span>
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
export function Modal({ title, children, close, className = '' }: { title: string; children: ReactNode; close: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    dialog?.querySelector<HTMLElement>('input, select, textarea')?.focus()
    return () => { dialog?.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} aria-labelledby={titleId} className={`modal ${className}`} onCancel={e => { e.preventDefault(); close() }} onClick={e => { if (e.target === e.currentTarget) { const bounds = e.currentTarget.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) close() } }}><div className="modal-header"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={close}>×</button></div>{children}</dialog>
}
export function Toast({ toast, close }: { toast: ToastMessage; close: () => void }) {
  return <div className={`toast toast-${toast.tone || 'success'}`} role={toast.tone === 'error' ? 'alert' : 'status'}><div className="flex justify-between items-start gap-4"><strong>{toast.title}</strong><button className="icon-button" aria-label="Dismiss message" onClick={close}>×</button></div>{toast.message && <p>{toast.message}</p>}{toast.action && <Button variant="ghost" onClick={() => { toast.action?.run(); close() }}>{toast.action.label}</Button>}</div>
}
export function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{description}</p></div><div className="page-actions">{children}</div></div>
}
export function Footer({ children }: { children?: ReactNode }) {
  return <footer className="page-footer"><span>{children || <><span className="desktop-copy">All amounts in Philippine pesos (PHP).</span><span className="mobile-copy">All amounts in PHP · Sample workspace</span></>}</span><span>Sample workspace · No live data</span></footer>
}
export function EmptyState({ title = 'No contacts yet', message = 'Add your first contact to start building relationships.', action }: { title?: string; message?: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name="contacts" /></div><h2>{title}</h2><p>{message}</p>{action}</div>
}

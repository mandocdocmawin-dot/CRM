import { useEffect, useState, type ReactNode } from 'react'
import { Avatar, Button, Icon } from './ui'
import type { ModalState } from '../types'

const links = [{ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' }, { name: 'Contacts', path: '/contacts', icon: 'contacts' }, { name: 'Deals', path: '/deals', icon: 'deals' }, { name: 'Tasks', path: '/tasks', icon: 'tasks' }]
function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try { localStorage.setItem('sulong-theme', dark ? 'dark' : 'light') } catch { /* The theme still works for this session. */ }
  }, [dark])
  return <button className="icon-button theme-toggle" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setDark(!dark)}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />}</svg>
  </button>
}
function Brand() { return <a href="#/dashboard" className="brand" aria-label="Sulong CRM home"><span className="brand-mark">S</span><span>sulong</span></a> }
function Navigation({ route, mobile = false }: { route: string; mobile?: boolean }) {
  return <nav className={mobile ? 'mobile-navigation' : 'main-navigation'} aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}>{!mobile && <span className="nav-label">WORKSPACE</span>}{links.map(link => <a key={link.path} href={`#${link.path}`} aria-label={link.name} title={link.name} className={`nav-item ${route.startsWith(link.path) ? 'active' : ''}`} aria-current={route.startsWith(link.path) ? 'page' : undefined}><Icon name={link.icon} /><span>{link.name}</span></a>)}</nav>
}
export function Reminder({ navigate, mobile = false }: { navigate: (path: string) => void; mobile?: boolean }) {
  return <section className={`reminder ${mobile ? 'mobile-reminder' : ''}`}>{!mobile && <strong>Keep conversations moving</strong>}<p>{mobile ? '8 follow-ups need your attention' : '8 follow-ups need your attention today.'}</p><Button variant="ghost" onClick={() => navigate('/tasks')}>View follow-ups →</Button></section>
}
export function Layout({ route, contactName, open, navigate, children }: { route: string; contactName?: string; open: (modal: ModalState) => void; navigate: (path: string) => void; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('sulong-sidebar-collapsed') === 'true' } catch { return false } })
  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sulong-sidebar-collapsed', String(next)) } catch { /* Keep the current session preference. */ }
  }
  const section = links.find(link => route.startsWith(link.path))?.name || 'States'
  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} aria-label="Workspace sidebar">
      <div className="sidebar-header"><Brand /><button className="icon-button sidebar-toggle" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="sidebar-navigation" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={toggleSidebar}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path d={collapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} /></svg></button></div>
      <details className="workspace-switcher"><summary><strong>Bayanihan Sales</strong><span>Team workspace ⌄</span></summary><div className="workspace-panel"><strong>Bayanihan Sales</strong><small>Your current workspace</small></div></details>
      <div id="sidebar-navigation"><Navigation route={route} /></div>
      <div className="sidebar-reminder"><Reminder navigate={navigate} /></div>
      <button className="icon-button sidebar-follow-ups" aria-label="View follow-ups" title="View follow-ups" onClick={() => navigate('/tasks')}><Icon name="notifications" /></button>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><button className="sidebar-help-button" aria-label="Help & shortcuts" title="Help & shortcuts" onClick={() => open({ type: 'help' })}><span className="help-symbol" aria-hidden="true">?</span><span className="sidebar-label">Help & shortcuts</span></button></div>
      <button className="signed-in" aria-label="Andrea Reyes — Sales manager" title="Andrea Reyes — Sales manager" onClick={() => open({ type: 'team' })}><Avatar label="AR" /><span className="sidebar-label"><strong>Andrea Reyes</strong><small>Sales manager</small></span></button>
    </aside>
    <div className="workspace-main"><header className="topbar"><div className="desktop-breadcrumb">{contactName ? `Contacts / ${contactName}` : `Workspace / ${section}`}</div><div className="mobile-brand"><Brand /></div><button className="command-search" onClick={() => open({ type: 'search' })}><Icon name="search" /><span>Search contacts, deals and follow-ups</span><kbd>Ctrl K</kbd></button><ThemeToggle /><button className="icon-button" aria-label="Open recent workspace activity" onClick={() => open({ type: 'activity' })}><Icon name="notifications" /></button><button className="icon-button" aria-label="View sales team" onClick={() => open({ type: 'team' })}><Avatar label="AR" /></button></header><main className={route === '/states' ? 'states-main' : 'page-content'}>{children}</main><Navigation route={route} mobile /></div>
  </div>
}


import type { ReactNode } from 'react'
import { Avatar, Button, Icon } from './ui'
import type { ModalState } from '../types'

const links = [{ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' }, { name: 'Contacts', path: '/contacts', icon: 'contacts' }, { name: 'Deals', path: '/deals', icon: 'deals' }, { name: 'Tasks', path: '/tasks', icon: 'tasks' }]
function Brand() { return <a href="#/dashboard" className="brand" aria-label="Sulong CRM home"><span className="brand-mark">S</span><span>sulong</span></a> }
function Navigation({ route, mobile = false }: { route: string; mobile?: boolean }) {
  return <nav className={mobile ? 'mobile-navigation' : 'main-navigation'} aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}>{!mobile && <span className="nav-label">WORKSPACE</span>}{links.map(link => <a key={link.path} href={`#${link.path}`} className={`nav-item ${route.startsWith(link.path) ? 'active' : ''}`} aria-current={route.startsWith(link.path) ? 'page' : undefined}><Icon name={link.icon} /><span>{link.name}</span></a>)}</nav>
}
export function Reminder({ navigate, mobile = false }: { navigate: (path: string) => void; mobile?: boolean }) {
  return <section className={`reminder ${mobile ? 'mobile-reminder' : ''}`}>{!mobile && <strong>Keep conversations moving</strong>}<p>{mobile ? '8 follow-ups need your attention' : '8 follow-ups need your attention today.'}</p><Button variant="ghost" onClick={() => navigate('/tasks')}>View follow-ups →</Button></section>
}
export function Layout({ route, contactName, open, navigate, children }: { route: string; contactName?: string; open: (modal: ModalState) => void; navigate: (path: string) => void; children: ReactNode }) {
  const section = links.find(link => route.startsWith(link.path))?.name || 'States'
  return <div className="app-shell">
    <aside className="sidebar"><Brand /><details className="workspace-switcher"><summary><strong>Bayanihan Sales</strong><span>Team workspace ⌄</span></summary><div className="workspace-panel"><strong>Bayanihan Sales</strong><small>Your current workspace</small></div></details><Navigation route={route} /><Reminder navigate={navigate} /><div className="sidebar-spacer" /><div className="sidebar-help"><span>◉ Light mode</span><button onClick={() => open({ type: 'help' })}>? Help & shortcuts</button></div><button className="signed-in" onClick={() => open({ type: 'team' })}><Avatar label="AR" /><span><strong>Andrea Reyes</strong><small>Sales manager</small></span></button></aside>
    <div className="workspace-main"><header className="topbar"><div className="desktop-breadcrumb">{contactName ? `Contacts / ${contactName}` : `Workspace / ${section}`}</div><div className="mobile-brand"><Brand /></div><button className="command-search" onClick={() => open({ type: 'search' })}><Icon name="search" /><span>Search contacts, deals and follow-ups</span><kbd>Ctrl K</kbd></button><button className="icon-button" aria-label="Open recent workspace activity" onClick={() => open({ type: 'activity' })}><Icon name="notifications" /></button><button className="icon-button" aria-label="View sales team" onClick={() => open({ type: 'team' })}><Avatar label="AR" /></button></header><main className={route === '/states' ? 'states-main' : 'page-content'}>{children}</main><Navigation route={route} mobile /></div>
  </div>
}

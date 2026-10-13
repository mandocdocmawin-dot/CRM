import { useCallback, useEffect, useState } from 'react'
import { Layout } from './components/layout'
import { Forms } from './components/Forms'
import { Button, EmptyState, Toast } from './components/ui'
import { Dashboard } from './features/Dashboard'
import { Contacts } from './features/Contacts'
import { ContactDetail } from './features/ContactDetail'
import { Deals } from './features/Deals'
import { Tasks } from './features/Tasks'
import { States } from './features/States'
import { useCRM, useRoute } from './data/store'
import type { ModalState, ToastMessage } from './types'

export default function App() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const notify = useCallback((message: ToastMessage) => setToast(message), [])
  const { state, commit } = useCRM(notify)
  const { route, navigate } = useRoute()
  const open = useCallback((value: ModalState) => setModal(value), [])
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setModal({ type: 'search' }) } }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  useEffect(() => {
    if (!toast || toast.action || toast.tone === 'error') return
    const timer = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timer)
  }, [toast])
  const id = route.startsWith('/contacts/') ? route.slice('/contacts/'.length) : null
  let contactId = id
  try { if (id) contactId = decodeURIComponent(id) } catch { /* Invalid URL goes to the not-found state. */ }
  const contact = state.contacts.find(c => c.id === contactId)
  const actions = { state, commit, notify, open, navigate }
  const content = route === '/dashboard' || route === '/' ? <Dashboard {...actions} /> : route === '/contacts' ? <Contacts {...actions} /> : contact ? <ContactDetail key={contact.id} contact={contact} {...actions} /> : route === '/deals' ? <Deals {...actions} /> : route === '/tasks' ? <Tasks {...actions} /> : <EmptyState title={id ? 'Contact not found' : 'Page not found'} message={id ? 'This contact may have been removed.' : 'Return to your workspace to continue.'} action={<Button variant="primary" onClick={() => navigate(id ? '/contacts' : '/dashboard')}>Back to {id ? 'contacts' : 'Dashboard'}</Button>} />
  return <>{route === '/states' ? <main className="states-main"><States {...actions} /></main> : <Layout route={route} contactName={contact?.name} open={open} navigate={navigate}>{content}</Layout>}{modal && <Forms modal={modal} close={() => setModal(null)} {...actions} />}{toast && <Toast toast={toast} close={() => setToast(null)} />}</>
}

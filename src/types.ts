export const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const
export type Stage = typeof stages[number]
export type ContactStatus = 'Lead' | 'Active' | 'Customer' | 'Inactive'
export type TaskGroup = 'Overdue' | 'Today' | 'Upcoming'
export interface Contact {
  id: string; name: string; email: string; company: string; status: ContactStatus;
  owner: string; initials: string; followUpDate: string; followUpNote: string; selected: boolean;
}
export interface Deal {
  id: string; title: string; company: string; amount: number; owner: string;
  initials: string; stage: Stage; followUp: string;
}
export interface Task {
  id: string; title: string; context: string; dueDate: string; dueStatus: string;
  owner: string; initials: string; priority: string; group: TaskGroup; completed: boolean;
}
export interface Note {
  id: string; contactId: string; author: string; initials: string; date: string; text: string; pinned: boolean;
}
export interface TimelineEvent {
  id: string; contactId: string; title: string; when: string; details: string; initials: string;
}
export interface CRMState {
  contacts: Contact[]; deals: Deal[]; tasks: Task[]; notes: Note[]; timeline: TimelineEvent[];
}
export interface ToastMessage { title: string; message?: string; tone?: 'success' | 'error' | 'info'; action?: { label: string; run: () => void } }
export type Notify = (message: ToastMessage) => void
export type Commit = (update: (state: CRMState) => CRMState) => boolean
export type ModalState = { type: 'contact'; contact?: Contact } | { type: 'deal'; deal?: Deal; stage?: Stage } | { type: 'task'; task?: Task; contact?: Contact } | { type: 'delete'; contact: Contact } | { type: 'assign'; ids: string[] } | { type: 'bulk-task'; ids: string[] } | { type: 'search' } | { type: 'help' } | { type: 'activity' } | { type: 'team' } | null
export interface PageActions {
  state: CRMState; commit: Commit; notify: Notify; open: (modal: ModalState) => void;
  navigate: (path: string) => void;
}

# Sulong CRM

Responsive light CRM built from the extracted Figma design using React, Vite, TypeScript and Tailwind CSS. Application files live in this nested `CRM` folder.

## Run

```powershell
cd C:\Users\Marwin\Documents\marwin\CRM\CRM
npm install
npm run dev
```

Open the URL printed by Vite. `npm run build` checks TypeScript and creates `dist`; `npm run lint` runs ESLint; `npm run preview` serves the production build locally.

## Screens and behavior

- `#/dashboard`: source KPIs, revenue artwork, funnel, stages, lead sources, leaderboard and activity. The 7d/30d choices show missing-data states because those datasets were not extracted.
- `#/contacts`: search, filters, sorting, selection, owner assignment, add/edit, CSV export, pagination and saved views.
- `#/deals`: six-stage board, filters, add/edit, stage selection and desktop drag handles, with Undo.
- `#/tasks`: owner/priority filters, completion with Undo, editing and rescheduling, and collapsible groups.
- `#/contacts/28%3A1102`: Maria Santos's extracted profile, notes, explicitly related deals and activity. Task updates also update her next follow-ups.
- `#/states`: interactive examples of the extracted empty, loading, error, validation and confirmation designs.

Global search, help, team and activity dialogs are available from the workspace chrome. The desktop sidebar collapses to icons using the button beside the logo, stays within the viewport, and remembers the preference under `sulong-sidebar-collapsed`. Forms validate input; dialogs support keyboard focus and Escape. Changes persist in this browser's localStorage under `sulong-crm-v1`; note drafts have separate `sulong-draft-<contact-id>` keys. Storage failures retain form input and show an error.

## Source and limits

The source is [the CRM Figma file](https://www.figma.com/design/4qu6ubxjuJMPJhA13IgVsL/Untitled). The parent folder contains `crm-design-spec.md`, `design-tokens.json`, `mock-data.json`, exported assets and extraction references.

The seed contains the visible 10 contacts, 12 deals and 11 tasks, with source IDs preserved. Figma's aggregate figures (including 1,248 contacts, dashboard KPIs and 18 completed tasks) describe the source snapshot; unseen records have not been invented. Empty sample pages explain the missing records. Dashboard aggregates are historical design content, not recomputed analytics for the local records.

The revenue chart uses exported vector plot geometry. Its monthly numeric series was unavailable in the layers, so there are no invented monthly values or tooltips. Only Dashboard had a supplied mobile frame; mobile layouts for the other screens are implementation adaptations. Additional dialogs and CRUD behavior are programmed interactions, not extracted Figma prototype interactions. The States screen includes isolated demonstrations.

This is a local frontend demo. There is no backend, authentication, actual team sharing, cloud synchronization, email sending or live data integration. PHP formatting and newly entered dates use Singapore / Manila time. The source's historical dates remain visible. The header theme toggle switches between light and dark using the extracted Figma color tokens. The selected theme persists locally under `sulong-theme`. Dark layouts follow the existing screens; they are not separately extracted dark frames.

## Structure

```text
src/
  components/   reusable UI, workspace layout and forms
  data/         extracted seed and local state persistence
  features/     Dashboard, Contacts, Deals, Tasks, Detail and States
  styles/       extracted light design tokens
  App.tsx       route and dialog coordination
  types.ts      shared TypeScript definitions
  index.css     component and responsive styling
public/assets/  individual exported icons and chart vectors
verification/  browser screenshots and verification notes
```

See `verification/checks.md` for the checks performed. Full-screen screenshots are reference evidence and are not implementation assets.



Dashboard charts animate on desktop and mobile on entry and when scrolled into view. The revenue vector uses the original exported path coordinates in src/data/revenue-geometry.json. Dashboard motion is explicitly enabled as requested, including in browsers reporting reduced motion; other interface animations follow that preference.




# Personal Notes

A personal productivity app combining a notes board with a Pomodoro timer and daily focus tracking.

## Features

- **Notes Board** — Create, organize, and drag-and-drop notes in a responsive grid
- **Note Types** — Task lists with checkboxes or free-text notes
- **Note Colors** — 4 color themes per note (amber, green, blue, gray)
- **Pomodoro Timer** — Persistent timer in the header with work/break modes and preset durations (25min, 30min, 1hr / 5min, 15min)
- **Today's Focus** — Independent daily task panel with add, edit, toggle, and delete support
- **Inline Editing** — Double-click any task to edit it in place

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router v7](https://reactrouter.com/)
- [@dnd-kit](https://dndkit.com/) — drag and drop
- [Material Symbols Outlined](https://fonts.google.com/icons) — icons
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) + [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) — typography

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── TopAppBar.tsx     # Header with nav, timer pill, and timer panel
│   ├── FocusPanel.tsx    # Today's Focus sidebar panel
│   └── BottomNavBar.tsx  # Mobile bottom navigation
├── context/
│   ├── NotesContext.tsx  # Notes + focus tasks state
│   └── TimerContext.tsx  # Pomodoro timer state
├── data/
│   └── notes.ts          # Note types, color maps, and seed data
└── pages/
    ├── NotesBoard.tsx    # Main board with note grid
    └── NoteDetail.tsx    # Expanded note view with task editing
```

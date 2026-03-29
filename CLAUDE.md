# TDApp — Todo + Pomodoro

App de productividad personal con notas tipo tablero y timer Pomodoro integrado.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **Firebase** (Auth + Firestore) — datos en tiempo real con `onSnapshot`
- **@dnd-kit** — drag & drop para reordenar notas en el board
- **React Router v7**

## Estructura

```
src/
├── components/
│   ├── TopAppBar.tsx        — Header sticky con timer pill, botón FOCUS, avatar
│   ├── FocusPanel.tsx       — Panel "Today's Focus" con lista de tareas del día
│   └── NoteDetailContent.tsx — Editor de nota con bloques (texto + tareas mezclados)
├── pages/
│   ├── NotesBoard.tsx       — Board principal con grid de notas y FocusPanel
│   ├── ArchivePage.tsx      — Notas archivadas
│   ├── LoginPage.tsx        — Login con Google
│   └── NoteDetail.tsx
├── context/
│   ├── TimerContext.tsx      — Estado del Pomodoro (mode, seconds, running, focusMode)
│   ├── NotesContext.tsx      — CRUD de notas y focus tasks, sincronizado con Firestore
│   └── AuthContext.tsx       — Estado de autenticación Firebase
├── data/
│   └── notes.ts             — Tipos Note, NoteBlock, COLOR_MAP, DETAIL_COLORS
└── lib/
    └── firebase.ts          — Init Firebase (usa variables VITE_FIREBASE_*)
```

## Modelo de datos

### Note
```ts
{
  id: string
  title: string
  icon: string           // material symbol
  color: 'amber' | 'green' | 'blue' | 'gray' | 'rose' | 'lavender' | 'peach' | 'mint'
  blocks: NoteBlock[]    // editor de bloques (campo principal)
  tags?: string[]
  archived?: boolean
  createdAt: string
  editedAt: string
  // legacy (migrados en initBlocks):
  content?: string
  contentBottom?: string
  tasks?: { id, text, done }[]
}
```

### NoteBlock
```ts
| { id: string; kind: 'text'; content: string }
| { id: string; kind: 'task'; text: string; done: boolean }
```

### FocusTask
```ts
{ id: string; text: string; done: boolean }
```

## Features clave

- **Block editor**: en una nota se mezclan bloques de texto y tareas libremente. Enter en una tarea crea otra tarea. Backspace en tarea vacía la convierte en texto. Backspace en texto vacío borra el bloque.
- **Timer Pomodoro**: pill siempre visible en el header con controles inline. Click en el tiempo abre panel con presets (25/30/60 min trabajo, 5/15 min descanso).
- **Focus Mode**: oscurece la página dejando visible solo el timer pill + botón focus + FocusPanel. Toggle con el ícono dentro del timer pill.
- **Drag & drop**: reordenamiento optimista de notas (actualiza UI antes de escribir a Firestore para evitar parpadeo).
- **TimerPanel**: se renderiza con `createPortal` en `document.body` para evitar quedar atrapado en el stacking context del header (que tiene `backdrop-filter`).

## Colores del timer
- Work: accent `#007257`, bg `rgba(137,240,203,0.18)`, pill `#89f0cb`
- Break: accent `#6b5ea8`, bg `rgba(230,230,250,0.18)`, pill `#e6e6fa`

## z-index hierarchy (focus mode)
| Elemento | z-index |
|---|---|
| Overlay oscuro | 55 |
| Header | 60 |
| FocusPanel wrapper | 60 |
| TimerPanel (portal) | 9999 |
| Modales (nota, crear) | 80–200 |

## Fuentes
- **Plus Jakarta Sans** — títulos y UI bold
- **Be Vietnam Pro** — texto de contenido

## Firebase
Variables de entorno necesarias: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

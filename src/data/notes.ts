export interface Task {
  id: string
  text: string
  done: boolean
}

export interface Note {
  id: string
  title: string
  icon: string
  color: 'green' | 'amber' | 'blue' | 'gray'
  type: 'tasks' | 'text'
  content?: string
  tasks?: Task[]
  tags?: string[]
  createdAt: string
  editedAt: string
}

export const NOTES: Note[] = [
  {
    id: '1',
    title: 'Lista de Compras',
    icon: 'shopping_basket',
    color: 'green',
    type: 'tasks',
    tasks: [
      { id: 't1', text: 'Pan integral', done: false },
      { id: 't2', text: 'Leche de avena', done: false },
      { id: 't3', text: 'Aguacates', done: true },
      { id: 't4', text: 'Café en grano', done: false },
    ],
    createdAt: 'Oct 20, 2023',
    editedAt: 'Hace 2 días',
  },
  {
    id: '2',
    title: "Today's Focus",
    icon: 'rocket_launch',
    color: 'amber',
    type: 'tasks',
    tasks: [
      { id: 't1', text: 'Review Q4 Design System Documentation', done: false },
      { id: 't2', text: 'Morning Coffee & News Catchup', done: true },
      { id: 't3', text: 'Prepare Mockups for Navigation Redesign', done: false },
      { id: 't4', text: 'Client Synchronisation Meeting @ 2PM', done: false },
    ],
    tags: ['Priority', 'Growth'],
    createdAt: 'Oct 24, 2023',
    editedAt: 'Hace 12 minutos',
  },
  {
    id: '3',
    title: 'Admin Mensual',
    icon: 'description',
    color: 'blue',
    type: 'tasks',
    tasks: [
      { id: 't1', text: 'Pagar renta y servicios', done: false },
      { id: 't2', text: 'Organizar recibos de impuestos', done: false },
      { id: 't3', text: 'Renovar membresía del gimnasio', done: false },
    ],
    createdAt: 'Oct 1, 2023',
    editedAt: 'Hace 3 días',
  },
  {
    id: '4',
    title: 'Ideas',
    icon: 'lightbulb',
    color: 'gray',
    type: 'text',
    content:
      '"Los detalles no son los detalles. Ellos hacen el diseño."\n— Charles Eames',
    createdAt: 'Sep 15, 2023',
    editedAt: 'Hace 1 semana',
  },
  {
    id: '5',
    title: 'Plan del Jardín',
    icon: 'yard',
    color: 'green',
    type: 'text',
    content:
      'Pedir semillas de tomate. Preparar las camas elevadas con compost fresco. Revisar el sistema de riego por goteo.',
    createdAt: 'Oct 10, 2023',
    editedAt: 'Hace 5 días',
  },
]

export const DETAIL_COLORS = {
  green: {
    bg: '#e8ffcc',
    title: '#4a6425',
    accent: '#526c2d',
    primary: '#546e2f',
    border: 'rgba(74,100,37,0.1)',
    checkBorder: '#526c2d',
    checkDone: '#526c2d',
  },
  amber: {
    bg: '#ffd98e',
    title: '#5c4100',
    accent: '#835e00',
    primary: '#835e00',
    border: 'rgba(131,94,0,0.1)',
    checkBorder: '#835e00',
    checkDone: '#526c2d',
  },
  blue: {
    bg: '#cce0ff',
    title: '#2a496d',
    accent: '#48668c',
    primary: '#345277',
    border: 'rgba(42,73,109,0.1)',
    checkBorder: '#48668c',
    checkDone: '#48668c',
  },
  gray: {
    bg: '#eae8e2',
    title: '#383835',
    accent: '#82807c',
    primary: '#656461',
    border: 'rgba(56,56,53,0.1)',
    checkBorder: '#82807c',
    checkDone: '#82807c',
  },
} as const

export const COLOR_MAP = {
  green: {
    bg: 'bg-[#e8ffcc]',
    title: 'text-[#4a6425]',
    icon: 'text-[#4a6425]/40',
    text: 'text-[#4a6425]/80',
    check: 'border-[#546e2f]/40',
    checkDone: 'bg-[#526c2d]',
  },
  amber: {
    bg: 'bg-[#ffd98e]',
    title: 'text-[#5c4100]',
    icon: 'text-[#5c4100]/40',
    text: 'text-[#5c4100]/80',
    check: 'border-[#5c4100]/30',
    checkDone: 'bg-[#526c2d]',
  },
  blue: {
    bg: 'bg-[#cce0ff]',
    title: 'text-[#2a496d]',
    icon: 'text-[#2a496d]/40',
    text: 'text-[#2a496d]/80',
    check: 'border-[#2a496d]/30',
    checkDone: 'bg-[#48668c]',
  },
  gray: {
    bg: 'bg-[#eae8e2]',
    title: 'text-[#383835]',
    icon: 'text-[#656461]',
    text: 'text-[#656461]',
    check: 'border-[#82807c]/40',
    checkDone: 'bg-[#82807c]',
  },
} as const

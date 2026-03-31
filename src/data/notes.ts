export interface Task {
  id: string
  text: string
  done: boolean
}

export type NoteBlock =
  | { id: string; kind: 'text'; content: string }
  | { id: string; kind: 'task'; text: string; done: boolean }

export interface Note {
  id: string
  title: string
  icon: string
  color: 'green' | 'amber' | 'blue' | 'gray' | 'rose' | 'lavender' | 'peach' | 'mint'
  blocks: NoteBlock[]
  // legacy fields for migration
  content?: string
  contentBottom?: string
  tasks?: Task[]
  tags?: string[]
  createdAt: string
  editedAt: string
  archived?: boolean
}


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
  rose: {
    bg: '#ffd6e0',
    title: '#7a2035',
    accent: '#9e3050',
    primary: '#9e3050',
    border: 'rgba(158,48,80,0.1)',
    checkBorder: '#9e3050',
    checkDone: '#9e3050',
  },
  lavender: {
    bg: '#e6e0ff',
    title: '#3b2d7a',
    accent: '#5648a8',
    primary: '#5648a8',
    border: 'rgba(86,72,168,0.1)',
    checkBorder: '#5648a8',
    checkDone: '#5648a8',
  },
  peach: {
    bg: '#ffe4cc',
    title: '#7a3a00',
    accent: '#a85200',
    primary: '#a85200',
    border: 'rgba(168,82,0,0.1)',
    checkBorder: '#a85200',
    checkDone: '#a85200',
  },
  mint: {
    bg: '#ccf5ee',
    title: '#0f5449',
    accent: '#1a7a6a',
    primary: '#1a7a6a',
    border: 'rgba(26,122,106,0.1)',
    checkBorder: '#1a7a6a',
    checkDone: '#1a7a6a',
  },
} as const

export const COLOR_MAP = {
  green: {
    bg: 'bg-[#defab6]',
    title: 'text-[#425b1f]',
    icon: 'text-[#425b1f]/40',
    text: 'text-[#425b1f]/80',
    check: 'border-[#546e2f]/40',
    checkDone: 'bg-[#526c2d]',
  },
  amber: {
    bg: 'bg-[#ffd16e]',
    title: 'text-[#533900]',
    icon: 'text-[#533900]/40',
    text: 'text-[#533900]/80',
    check: 'border-[#5c4100]/30',
    checkDone: 'bg-[#526c2d]',
  },
  blue: {
    bg: 'bg-[#bdd7fa]',
    title: 'text-[#244165]',
    icon: 'text-[#244165]/40',
    text: 'text-[#244165]/80',
    check: 'border-[#2a496d]/30',
    checkDone: 'bg-[#48668c]',
  },
  gray: {
    bg: 'bg-[#e1ded7]',
    title: 'text-[#33322f]',
    icon: 'text-[#5a5856]',
    text: 'text-[#5a5856]',
    check: 'border-[#82807c]/40',
    checkDone: 'bg-[#82807c]',
  },
  rose: {
    bg: 'bg-[#ffc4d3]',
    title: 'text-[#721a2e]',
    icon: 'text-[#9e3050]/40',
    text: 'text-[#9e3050]/80',
    check: 'border-[#9e3050]/30',
    checkDone: 'bg-[#9e3050]',
  },
  lavender: {
    bg: 'bg-[#d9d2ff]',
    title: 'text-[#342770]',
    icon: 'text-[#5648a8]/40',
    text: 'text-[#5648a8]/80',
    check: 'border-[#5648a8]/30',
    checkDone: 'bg-[#5648a8]',
  },
  peach: {
    bg: 'bg-[#ffd9b6]',
    title: 'text-[#723400]',
    icon: 'text-[#a85200]/40',
    text: 'text-[#a85200]/80',
    check: 'border-[#a85200]/30',
    checkDone: 'bg-[#a85200]',
  },
  mint: {
    bg: 'bg-[#b5f1e5]',
    title: 'text-[#0c483e]',
    icon: 'text-[#1a7a6a]/40',
    text: 'text-[#1a7a6a]/80',
    check: 'border-[#1a7a6a]/30',
    checkDone: 'bg-[#1a7a6a]',
  },
} as const

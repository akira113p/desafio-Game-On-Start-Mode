// ========== TIPOS ==========
export interface Task {
  id: string;
  time: string;
  title: string;
  completed: boolean;
}

export interface Encouragement {
  id: string;
  name: string;
  initials: string;
  role: string;
  message: string;
  likes: number;
  liked: boolean;
  avatar?: string;
}

export interface Note {
  id: string;
  content: string;
  color: string;
  linkedMeetingId?: string;
  type: "note" | "checklist";
  checkItems?: { text: string; checked: boolean }[];
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

// ========== DADOS MOCKADOS ==========

export interface TasksByDate {
  [dateKey: string]: Task[];
}

export const dailyTasks: Task[] = [
  { id: "1", time: "9:00 AM", title: "HR Orientation", completed: false },
  { id: "2", time: "10:00 AM", title: "System Setup", completed: false },
  { id: "3", time: "2:00 PM", title: "Team Meeting", completed: false },
  { id: "4", time: "5:00 PM", title: "Wrap Up & Review", completed: false },
];

// Gera tarefas mock para cada dia da semana atual
export function getWeekTasks(): TasksByDate {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const weekTasks: TasksByDate = {};

  const taskTemplates = [
    [
      { time: "10:00 AM", title: "Weekly Planning" },
      { time: "3:00 PM", title: "Team Sync" },
    ],
    [
      { time: "9:00 AM", title: "Training Session" },
      { time: "11:00 AM", title: "1:1 with Manager" },
      { time: "2:00 PM", title: "Documentation Review" },
    ],
    [
      { time: "9:00 AM", title: "HR Orientation" },
      { time: "10:00 AM", title: "System Setup" },
      { time: "2:00 PM", title: "Team Meeting" },
      { time: "5:00 PM", title: "Wrap Up & Review" },
    ],
    [
      { time: "9:30 AM", title: "Stand-up Meeting" },
      { time: "11:00 AM", title: "Code Review" },
      { time: "3:00 PM", title: "Sprint Demo" },
    ],
    [
      { time: "10:00 AM", title: "Design Workshop" },
      { time: "1:00 PM", title: "Lunch & Learn" },
      { time: "4:00 PM", title: "Retrospective" },
    ],
    [
      { time: "9:00 AM", title: "Office Hours" },
      { time: "2:00 PM", title: "Knowledge Share" },
    ],
    [
      { time: "10:00 AM", title: "Self-study Time" },
    ],
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const key = date.toDateString();
    const todayKey = today.toDateString();

    if (key === todayKey) {
      weekTasks[key] = dailyTasks.map((t) => ({ ...t }));
    } else {
      const templates = taskTemplates[i] || taskTemplates[0];
      weekTasks[key] = templates.map((t, idx) => ({
        id: `${i}-${idx}`,
        time: t.time,
        title: t.title,
        completed: false,
      }));
    }
  }

  return weekTasks;
}

export const encouragements: Encouragement[] = [
  {
    id: "1",
    name: "Julia S.",
    initials: "JS",
    role: "Support",
    message:
      "Starting out can be overwhelming... but don't hesitate to ask questions. Everyone is here to help!",
    likes: 12,
    liked: false,
  },
  {
    id: "2",
    name: "Mark R.",
    initials: "MR",
    role: "IT",
    message:
      "It's okay to make mistakes. I learned the most, just by trying and asking for help.",
    likes: 8,
    liked: false,
  },
  {
    id: "3",
    name: "Sarah L.",
    initials: "SL",
    role: "Design",
    message:
      "Take your time to absorb everything. No one expects you to know it all on day one!",
    likes: 15,
    liked: false,
  },
  {
    id: "4",
    name: "Carlos M.",
    initials: "CM",
    role: "Engineering",
    message:
      "The first week is the hardest. After that, things start clicking. You've got this!",
    likes: 20,
    liked: false,
  },
  {
    id: "5",
    name: "Ana P.",
    initials: "AP",
    role: "HR",
    message:
      "Remember: every expert was once a beginner. We believe in you!",
    likes: 10,
    liked: false,
  },
];

export const notes: Note[] = [
  {
    id: "1",
    content: "To-Do List",
    color: "#FFF9C4",
    type: "checklist",
    checkItems: [
      { text: "Complete HR paperwork", checked: true },
      { text: "Set up email account", checked: false },
      { text: "Read company handbook", checked: false },
    ],
  },
  {
    id: "2",
    content: "Remember to submit the report by 5pm!",
    color: "#C8E6C9",
    type: "note",
  },
  {
    id: "3",
    content: "Prepare for the presentation",
    color: "#BBDEFB",
    type: "note",
  },
  {
    id: "4",
    content: "Meet with the design team - Adrien Fem!",
    color: "#F8BBD0",
    type: "note",
    linkedMeetingId: "3",
  },
  {
    id: "5",
    content: "Ask Pedro about client system",
    color: "#E1BEE7",
    type: "note",
  },
];

export const chatSuggestions = [
  "How do I set up my company email?",
  "Can you explain how our project management tool works?",
  "What's the company's dress code?",
  "How do I request time off?",
  "Who should I talk to about IT issues?",
];

export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

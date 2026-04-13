export type Locale = "pt" | "en";

const translations = {
  pt: {
    // Header & Nav
    appName: "Game On",
    agenda: "Agenda",
    postItsNotes: "Post-Its & Notas",
    notes: "Notas",
    home: "Inicio",
    chat: "Chat",
    // Drawer
    profile: "Perfil",
    settings: "Configuracoes",
    help: "Ajuda",
    logout: "Sair",
    // Landing
    dailyRoutine: "Sugestoes de Rotina Diaria",
    encouragement: "Incentivo da Equipe",
    generateComment: "Gerar Novo Comentario",
    like: "Curtir",
    // Agenda
    todaysSchedule: "Agenda de Hoje",
    addTask: "+ Adicionar Tarefa",
    taskTitle: "Titulo da tarefa",
    timePlaceholder: "Horario (ex: 11:00)",
    add: "Adicionar",
    cancel: "Cancelar",
    save: "Salvar",
    // Notes
    addNote: "Adicionar Nota",
    writeNote: "Escreva sua nota...",
    textNote: "Texto",
    checklist: "Checklist",
    listTitle: "Titulo da lista",
    addItem: "+ Adicionar item",
    itemPlaceholder: "Novo item...",
    // Chat
    chatWelcome: "Oi! Bem-vindo(a) ao time! Como posso te ajudar hoje?",
    chatPlaceholder: "Digite sua mensagem...",
    chatResponse: "Otima pergunta! Deixa eu pensar na melhor forma de te guiar. Em vez de te dar a resposta pronta, vou te ajudar a descobrir passo a passo. O que voce ja sabe sobre esse assunto?",
    chatSuggestions: [
      "Como configuro meu email corporativo?",
      "Pode explicar como funciona nossa ferramenta de projetos?",
      "Qual e o dress code da empresa?",
      "Como solicito folga?",
      "Com quem falo sobre problemas de TI?",
    ],
    // Calendar / Auth
    connectCalendar: "Conectar Agenda Google",
    calendarEmpty: "Nenhum evento para este dia",
    calendarConnect: "Conecte sua conta Google para ver sua agenda real e receber sugestoes personalizadas de rotina.",
    loadingCalendar: "Carregando sua agenda...",
    allDay: "Dia inteiro",
    signInGoogle: "Entrar com Google",
    calendarSynced: "Agenda conectada",
    // Onboarding engine
    generateOnboarding: "Gerar Trilha de Onboarding",
    jobDescPlaceholder: "Cole aqui a descricao da vaga (Job Description) do LinkedIn ou documento interno...",
    analyzeWithAI: "Analisar com IA",
    analyzingRoutine: "Analisando agenda e criando rotina personalizada...",
    onboardingGenerated: "Trilha de Onboarding Gerada pela IA",
    priorityHigh: "Alta",
    priorityMedium: "Media",
    priorityLow: "Baixa",
    loginRequired: "Faca login com Google para a IA analisar sua agenda e criar uma trilha personalizada.",
    noFreeSlots: "Nenhum horario livre encontrado nos proximos 5 dias uteis.",
    // Language
    language: "Idioma",
  },
  en: {
    appName: "Game On",
    agenda: "Agenda",
    postItsNotes: "Post-Its & Notes",
    notes: "Notes",
    home: "Home",
    chat: "Chat",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    logout: "Logout",
    dailyRoutine: "Daily Routine Suggestions",
    encouragement: "Encouragement from the Team",
    generateComment: "Generate New Comment",
    like: "Like",
    todaysSchedule: "Today's Schedule",
    addTask: "+ Add Task",
    taskTitle: "Task title",
    timePlaceholder: "Time (e.g., 11:00 AM)",
    add: "Add",
    cancel: "Cancel",
    save: "Save",
    addNote: "Add Note",
    writeNote: "Write your note...",
    textNote: "Text",
    checklist: "Checklist",
    listTitle: "List title",
    addItem: "+ Add item",
    itemPlaceholder: "New item...",
    chatWelcome: "Hi there! Welcome to the team! What can I help you with today?",
    chatPlaceholder: "Type your message...",
    chatResponse: "Great question! Let me think about the best way to guide you through this. Instead of giving you the answer directly, let me help you figure it out step by step. What do you already know about this topic?",
    chatSuggestions: [
      "How do I set up my company email?",
      "Can you explain how our project management tool works?",
      "What's the company's dress code?",
      "How do I request time off?",
      "Who should I talk to about IT issues?",
    ],
    connectCalendar: "Connect Google Calendar",
    calendarEmpty: "No events for this day",
    calendarConnect: "Connect your Google account to see your real calendar and get personalized routine suggestions.",
    loadingCalendar: "Loading your calendar...",
    allDay: "All day",
    signInGoogle: "Sign in with Google",
    calendarSynced: "Calendar synced",
    generateOnboarding: "Generate Onboarding Track",
    jobDescPlaceholder: "Paste the job description (from LinkedIn or internal document) here...",
    analyzeWithAI: "Analyze with AI",
    analyzingRoutine: "Analyzing calendar and creating personalized routine...",
    onboardingGenerated: "AI-Generated Onboarding Track",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    loginRequired: "Sign in with Google so the AI can analyze your calendar and create a personalized track.",
    noFreeSlots: "No free time slots found in the next 5 business days.",
    language: "Language",
  },
} as const;

export interface Translations {
  appName: string;
  agenda: string;
  postItsNotes: string;
  notes: string;
  home: string;
  chat: string;
  profile: string;
  settings: string;
  help: string;
  logout: string;
  dailyRoutine: string;
  encouragement: string;
  generateComment: string;
  like: string;
  todaysSchedule: string;
  addTask: string;
  taskTitle: string;
  timePlaceholder: string;
  add: string;
  cancel: string;
  save: string;
  addNote: string;
  writeNote: string;
  textNote: string;
  checklist: string;
  listTitle: string;
  addItem: string;
  itemPlaceholder: string;
  chatWelcome: string;
  chatPlaceholder: string;
  chatResponse: string;
  chatSuggestions: readonly string[];
  connectCalendar: string;
  calendarEmpty: string;
  calendarConnect: string;
  loadingCalendar: string;
  allDay: string;
  signInGoogle: string;
  calendarSynced: string;
  generateOnboarding: string;
  jobDescPlaceholder: string;
  analyzeWithAI: string;
  analyzingRoutine: string;
  onboardingGenerated: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  loginRequired: string;
  noFreeSlots: string;
  language: string;
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

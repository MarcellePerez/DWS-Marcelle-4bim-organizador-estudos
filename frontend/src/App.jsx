import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import { auth, tasks as taskApi } from "./services/api";

const DEFAULT_DISCIPLINES = [
  "Matemática",
  "Geografia",
  "Gramática",
  "Literatura",
  "História",
  "Física",
  "Química",
  "Biologia"
];

const emptyForm = { title: '', discipline: '', deadline: '', priority: 'MEDIA', parentId: '' };

const priorityStyle = {
  ALTA: 'bg-pink text-pink-deep',
  MEDIA: 'bg-amber-light text-ink',
  BAIXA: 'bg-sage-light text-sage-deep',
};

function AuthScreen({ onAuthenticated, notice }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await (mode === 'login' ? auth.login(form) : auth.register(form));
      if (mode === 'register') {
        setMode('login');
        setForm({ name: '', email: form.email, password: '' });
        setSuccess('Cadastro realizado com sucesso. Agora entre com seu e-mail e senha.');
        return;
      }
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <main className="flex min-h-screen items-center justify-center bg-beige px-6 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-terracotta-deep">FOCO</p>
        <h1 className="text-3xl font-black text-ink">Organize seu próximo passo.</h1>
        <p className="mt-2 text-muted">Seu espaço simples para estudar com constância.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {mode === 'register' && <input className="field" placeholder="Seu nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input className="field" type="email" placeholder="E-mail" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" type="password" placeholder="Senha (mínimo 6 caracteres)" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {notice && <p className="rounded-xl bg-amber-light p-3 text-sm text-ink" role="status">{notice}</p>}
          {error && <p className="rounded-xl bg-pink-light p-3 text-sm text-pink-deep">{error}</p>}
          {success && <p className="rounded-xl bg-sage-light p-3 text-sm text-sage-deep">{success}</p>}
          <button className="w-full rounded-xl bg-terracotta px-4 py-3 font-bold text-ink transition hover:bg-terracotta-deep hover:text-surface disabled:opacity-50" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        <button className="mt-5 w-full text-sm font-semibold text-muted hover:text-terracotta-deep" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}>
          {mode === 'login' ? 'Ainda não tenho uma conta' : 'Já tenho uma conta'}
        </button>
      </section>
    </main>
  );
}

function TaskForm({ form, setForm, onSubmit, editing, onCancel, disciplines, setDisciplines, formRef }) {
  const [showNewDisciplineInput, setShowNewDisciplineInput] = useState(false);
  const [customDiscipline, setCustomDiscipline] = useState('');

  const handleAddCustomDiscipline = () => {
    if (customDiscipline.trim() && !disciplines.includes(customDiscipline.trim())) {
      const updated = [...disciplines, customDiscipline.trim()];
      setDisciplines(updated);
      setForm({ ...form, discipline: customDiscipline.trim() });
      setCustomDiscipline('');
      setShowNewDisciplineInput(false);
    }
  };

  return (
    <form ref={formRef} id="task-form" className="rounded-2xl border border-border bg-surface p-5 shadow-sm" onSubmit={onSubmit}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        {editing && <button type="button" className="text-sm text-muted" onClick={onCancel}>Cancelar</button>}
      </div>
      <div className="grid gap-3">
        <input className="field" placeholder="O que você precisa fazer?" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        
        {!showNewDisciplineInput ? (
          <select
            className="field"
            required
            value={form.discipline}
            onChange={(e) => {
              if (e.target.value === 'NEW_DISCIPLINE') {
                setShowNewDisciplineInput(true);
                setForm({ ...form, discipline: '' });
              } else {
                setForm({ ...form, discipline: e.target.value });
              }
            }}
          >
            <option value="">Selecione a disciplina</option>
            {disciplines.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="NEW_DISCIPLINE" className="font-bold text-lavender-deep">
              + Adicionar nova matéria...
            </option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="Digite o nome da nova matéria..."
              value={customDiscipline}
              onChange={(e) => setCustomDiscipline(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCustomDiscipline}
              className="rounded-xl bg-lavender px-3 py-2 text-sm font-bold text-ink hover:bg-lavender-deep hover:text-surface"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewDisciplineInput(false);
                setCustomDiscipline('');
              }}
              className="rounded-xl bg-beige-deep px-3 py-2 text-sm font-semibold text-ink hover:bg-beige"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input className="field" type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>
        </div>
        <select className="field" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
          <option value="">Sem tarefa principal</option>
          {form.availableParents?.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
        </select>
        <button className="mt-2 rounded-xl bg-terracotta px-4 py-3 font-bold text-ink hover:bg-terracotta-deep hover:text-surface">{editing ? 'Salvar alterações' : 'Adicionar tarefa'}</button>
      </div>
    </form>
  );
}

function StudySidebar({ tasks, filter, onFilterChange, searchTerm, onSearchChange, onCreateTask, onLogout }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false);
  }, [secondsLeft]);

  const activeTasks = tasks.filter((task) => !task.deletedAt);
  const completedTasks = activeTasks.filter((task) => task.completed).length;
  const pendingTasks = activeTasks.filter((task) => !task.completed);
  const progress = activeTasks.length ? Math.round((completedTasks / activeTasks.length) * 100) : 0;
  const nextTask = [...pendingTasks].sort(
    (first, second) => new Date(first.deadline) - new Date(second.deadline),
  )[0];
  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const menuItems = [
    { id: 'todas', label: 'Todas as tarefas', Icon: LayoutDashboard },
    { id: 'pendentes', label: 'Pendentes', Icon: ListTodo },
    { id: 'concluidas', label: 'Concluídas', Icon: CheckCircle2 },
    { id: 'vencidas', label: 'Vencidas', Icon: Clock3 },
    { id: 'lixeira', label: 'Lixeira', Icon: Trash2 },
  ];

  return (
    <aside aria-label="Navegação de estudos" className="w-full shrink-0 border-b border-lavender/70 bg-beige-light text-ink lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-6rem)] lg:w-72 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-5 p-4 sm:p-6 lg:min-h-full lg:flex-1">
        <label className="flex items-center gap-3 rounded-xl border border-lavender bg-gradient-to-r from-lavender/35 to-pink/35 px-3">
          <Search aria-hidden="true" className="shrink-0 text-muted" size={20} />
          <input
            aria-label="Buscar tarefas"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar tarefas"
            type="search"
            value={searchTerm}
          />
        </label>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-terracotta via-pink to-sunshine px-4 py-3 font-bold text-ink shadow-lg shadow-lavender/30 transition hover:brightness-105"
          onClick={onCreateTask}
          type="button"
        >
          <Plus aria-hidden="true" size={20} />
          Criar nova tarefa
        </button>

        <nav aria-label="Filtros de tarefas" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {menuItems.map(({ id, label, Icon }) => (
            <button
              aria-current={filter === id ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                filter === id
                  ? 'bg-lavender text-ink ring-1 ring-lavender-deep/30'
                  : 'text-muted hover:bg-beige-deep hover:text-ink'
              }`}
              key={id}
              onClick={() => onFilterChange(id)}
              type="button"
            >
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Timer aria-hidden="true" className="text-terracotta-deep" size={18} />
            <h2>Foco de 25 minutos</h2>
          </div>
          <p aria-live="polite" className="my-4 text-center text-3xl font-black tabular-nums text-ink">{formattedTime}</p>
          <div className="flex gap-2">
            <button
              aria-label={isRunning ? 'Pausar foco' : secondsLeft === 0 ? 'Iniciar novo foco' : 'Iniciar foco'}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-lavender px-3 py-2 text-sm font-bold text-ink transition hover:bg-lavender-deep hover:text-surface"
              onClick={() => {
                if (secondsLeft === 0) setSecondsLeft(25 * 60);
                setIsRunning((running) => !running);
              }}
              type="button"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pausar' : secondsLeft === 0 ? 'Novo foco' : 'Iniciar'}
            </button>
            <button
              aria-label="Reiniciar timer"
              className="rounded-lg border border-border px-3 py-2 text-muted transition hover:bg-beige hover:text-ink"
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(25 * 60);
              }}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={17} />
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <h2 className="font-semibold text-ink">Seu progresso</h2>
            <span className="text-muted">{completedTasks}/{activeTasks.length}</span>
          </div>
          <div
            aria-label={`${progress}% das tarefas concluídas`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="mt-3 h-2 overflow-hidden rounded-full bg-beige-deep"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-sage to-sunshine transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {nextTask ? `Próximo prazo: ${new Date(nextTask.deadline).toLocaleDateString('pt-BR')}` : 'Tudo em dia!'}
          </p>
        </section>

        <button
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lavender via-pink to-sunshine px-4 py-4 font-bold text-ink shadow-lg shadow-lavender/30 transition hover:brightness-105 lg:mt-auto"
          onClick={onLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={20} />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem('foco-session') || 'null');
      return savedSession?.user?.name && savedSession?.token ? savedSession : null;
    } catch {
      localStorage.removeItem('foco-session');
      return null;
    }
  });

  const [taskList, setTaskList] = useState([]);
  const [disciplines, setDisciplines] = useState(DEFAULT_DISCIPLINES);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [today, setToday] = useState(() => new Date());
  const taskFormRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentDate = new Date();
      setToday((previousDate) => (
        previousDate.toDateString() === currentDate.toDateString() ? previousDate : currentDate
      ));
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!success) return undefined;
    const timeoutId = window.setTimeout(() => setSuccess(''), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  useEffect(() => {
    function handleSessionExpired() {
      setSession(null);
      setTaskList([]);
      setAuthNotice('Sua sessão expirou. Entre novamente para continuar.');
      setError('');
      setSuccess('');
    }

    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const dayKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const dueTasks = taskList.filter((task) => {
      if (task.completed || task.deletedAt) return false;
      const deadline = new Date(task.deadline);
      return !Number.isNaN(deadline.getTime())
        && deadline.getFullYear() === tomorrow.getFullYear()
        && deadline.getMonth() === tomorrow.getMonth()
        && deadline.getDate() === tomorrow.getDate();
    });
    const dueNotificationIds = new Set(dueTasks.map((task) => `due-${task.id}-${dayKey}`));
    const newDueTasks = dueTasks.filter((task) => !notifications.some(
      (notification) => notification.id === `due-${task.id}-${dayKey}`,
    ));
    const hasStaleDueNotification = notifications.some(
      (notification) => notification.type === 'due' && !dueNotificationIds.has(notification.id),
    );

    if (newDueTasks.length || hasStaleDueNotification) {
      const newDueNotifications = newDueTasks.map((task) => ({
        id: `due-${task.id}-${dayKey}`,
        taskId: task.id,
        type: 'due',
        title: 'Prazo se aproximando',
        message: `A tarefa "${task.title}" vence amanhã.`,
        createdAt: new Date().toISOString(),
        read: false,
      }));

      setNotifications((current) => {
        const activeDueIds = new Set(dueTasks.map((task) => `due-${task.id}-${dayKey}`));
        const retained = current.filter(
          (notification) => notification.type !== 'due' || activeDueIds.has(notification.id),
        );
        const existingIds = new Set(retained.map((notification) => notification.id));
        return [
          ...newDueNotifications.filter((notification) => !existingIds.has(notification.id)),
          ...retained,
        ];
      });

      if (newDueNotifications.length) setToast(newDueNotifications[0]);
    }
  }, [taskList, today, notifications]);

  useEffect(() => {
    if (!showLogoutConfirmation) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') setShowLogoutConfirmation(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirmation]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    taskApi.list(session.token).then(setTaskList).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [session]);

  const visibleTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return taskList.filter((task) => {
      const isDeleted = Boolean(task.deletedAt);
      const taskDeadline = new Date(task.deadline);
      const isExpired = !task.completed && taskDeadline < today;

      if (filter === 'lixeira' && !isDeleted) return false;
      if (filter !== 'lixeira' && isDeleted) return false;
      if (filter === 'pendentes' && task.completed) return false;
      if (filter === 'concluidas' && !task.completed) return false;
      if (filter === 'vencidas' && !isExpired) return false;

      const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');
      if (!normalizedSearch) return true;

      return task.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
        || (task.discipline || '').toLocaleLowerCase('pt-BR').includes(normalizedSearch);
    });
  }, [taskList, filter, searchTerm]);

  const pendingCount = taskList.filter((task) => !task.completed && !task.deletedAt).length;

  if (!session) return <AuthScreen notice={authNotice} onAuthenticated={(value) => {
    localStorage.setItem('foco-session', JSON.stringify(value));
    localStorage.setItem('@Organizador:token', value.token);
    setAuthNotice('');
    setSession(value);
  }} />;

  async function saveTask(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      const body = { ...form, deadline: new Date(`${form.deadline}T23:59:59`).toISOString(), parentId: form.parentId || null };
      if (editing) {
        const updated = await taskApi.update(session.token, editing, body);
        setTaskList(taskList.map((task) => task.id === editing ? { ...task, ...updated } : task));
      } else {
        const created = await taskApi.create(session.token, body);
        setTaskList([created, ...taskList]);
      }
      setSuccess(editing ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.');
      setEditing(null); 
      setForm(emptyForm);
    } catch (e) { setError(e.message); }
  }

  async function toggleTask(task) {
    setError('');
    setSuccess('');
    try {
      const updated = await taskApi.update(session.token, task.id, { ...task, completed: !task.completed });
      setTaskList(taskList.map((item) => item.id === task.id ? { ...item, ...updated } : item));
      if (!task.completed) {
        publishNotification({
          id: `completed-${task.id}-${Date.now()}`,
          taskId: task.id,
          type: 'completed',
          title: 'Tarefa concluída',
          message: `Você concluiu "${task.title}".`,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    } catch (e) { setError(e.message); }
  }

  async function removeTask(task) {
    const isPermanent = Boolean(task.deletedAt);
    const confirmMessage = isPermanent 
      ? 'Excluir esta tarefa permanentemente do banco de dados?' 
      : 'Mover esta tarefa para a Lixeira?';

    if (!window.confirm(confirmMessage)) return;

    setError('');
    setSuccess('');
    try { 
      await (taskApi.remove || taskApi.delete)(session.token, task.id, isPermanent); 
      if (isPermanent) {
        setTaskList(taskList.filter((item) => item.id !== task.id)); 
      } else {
        setTaskList(taskList.map((item) => item.id === task.id ? { ...item, deletedAt: new Date().toISOString() } : item));
      }
      setSuccess(isPermanent ? 'Tarefa excluída definitivamente.' : 'Tarefa movida para a lixeira.');
    } catch (e) { setError(e.message); }
  }

  async function restoreTask(task) {
    setError('');
    setSuccess('');
    try {
      const updated = await taskApi.update(session.token, task.id, { ...task, deletedAt: null });
      setTaskList(taskList.map((item) => item.id === task.id ? { ...item, ...updated, deletedAt: null } : item));
      setSuccess('Tarefa restaurada com sucesso.');
    } catch (e) { setError(e.message); }
  }

  function editTask(task) {
    setEditing(task.id);
    if (task.discipline && !disciplines.includes(task.discipline)) {
      setDisciplines((prev) => [...prev, task.discipline]);
    }
    setForm({ 
      title: task.title, 
      discipline: task.discipline, 
      deadline: task.deadline.slice(0, 10), 
      priority: task.priority, 
      parentId: task.parentId || '', 
      availableParents: taskList.filter((item) => item.id !== task.id && !item.parentId && !item.deletedAt) 
    });
  }

  function focusTaskForm() {
    taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    taskFormRef.current?.querySelector('input')?.focus({ preventScroll: true });
  }

  function logout() {
    localStorage.removeItem('foco-session');
    localStorage.removeItem('@Organizador:token');
    setTaskList([]);
    setNotifications([]);
    setShowNotifications(false);
    setToast(null);
    setError('');
    setSuccess('');
    setSession(null);
  }

  function publishNotification(notification) {
    setNotifications((current) => [notification, ...current]);
    setToast(notification);
  }

  function toggleNotifications() {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);
    if (isOpening) {
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    }
  }

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="min-h-screen bg-beige">
      <header className="border-b border-terracotta/30 bg-beige-light">
        <div className="relative mx-auto flex w-full max-w-6xl items-center px-4 py-5 sm:max-w-none sm:px-20">
          <div className="shrink-0"><p className="text-sm font-bold tracking-[0.2em] text-terracotta-deep">FOCO</p><p className="text-xs text-muted sm:text-sm">Organizador de estudos</p></div>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:absolute sm:right-6 sm:ml-0 sm:gap-4">
            <div className="relative">
              <button
                aria-expanded={showNotifications}
                aria-haspopup="true"
                aria-label={unreadNotificationCount ? `Notificações, ${unreadNotificationCount} não lidas` : 'Notificações'}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:bg-beige sm:h-11 sm:w-11"
                onClick={toggleNotifications}
                type="button"
              >
                <Bell aria-hidden="true" size={20} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-ink">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <section
                  aria-label="Notificações"
                  className="absolute right-0 top-full z-50 mt-3 max-h-[70vh] w-80 max-w-[90vw] overflow-y-auto rounded-2xl border border-lavender bg-surface p-4 text-ink shadow-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-bold">Notificações</h2>
                    <button
                      aria-label="Fechar notificações"
                      className="rounded-lg p-1 text-muted transition hover:bg-beige hover:text-ink"
                      onClick={() => setShowNotifications(false)}
                      type="button"
                    >
                      <X aria-hidden="true" size={18} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="rounded-xl bg-beige-light p-4 text-sm text-muted">Você não tem notificações no momento.</p>
                  ) : (
                    <ul className="space-y-2">
                      {notifications.map((notification) => {
                        const isDue = notification.type === 'due';
                        const NotificationIcon = isDue ? Clock3 : CheckCircle2;

                        return (
                          <li
                            className={`rounded-xl border p-3 ${isDue ? 'border-amber bg-amber-light/60' : 'border-sage bg-sage-light'}`}
                            key={notification.id}
                          >
                            <div className="flex items-start gap-3">
                              <NotificationIcon aria-hidden="true" className={isDue ? 'mt-0.5 text-terracotta-deep' : 'mt-0.5 text-sage-deep'} size={18} />
                              <div>
                                <p className="text-sm font-bold">{notification.title}</p>
                                <p className="mt-1 text-sm text-muted">{notification.message}</p>
                                <time className="mt-2 block text-xs text-muted" dateTime={notification.createdAt}>
                                  {new Date(notification.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                </time>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}
            </div>
            <span aria-label={`Perfil de ${session.user.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink via-lavender to-sunshine text-lg font-bold text-ink shadow-[0_0_18px_rgba(182,172,228,0.35)] sm:h-14 sm:w-14">
              {session.user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-40 truncate text-sm font-bold text-ink sm:block sm:max-w-56">{session.user.name}</span>
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-6rem)] flex-col lg:flex-row">
        <StudySidebar
          tasks={taskList}
          filter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateTask={focusTaskForm}
          onLogout={() => setShowLogoutConfirmation(true)}
        />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8"><p className="text-sm font-semibold text-terracotta-deep">DASHBOARD</p><h1 className="mt-1 text-3xl font-black text-ink">Olá, {session.user.name.split(' ')[0]}.</h1><p className="mt-2 text-muted">Você tem <strong>{pendingCount} tarefa(s)</strong> para organizar.</p></div>
            {error && <div className="mb-5 flex justify-between rounded-xl bg-pink-light p-4 text-sm text-pink-deep" role="alert"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
            {success && <p className="mb-5 rounded-xl bg-sage-light p-4 text-sm text-sage-deep" role="status">{success}</p>}
            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <TaskForm
                formRef={taskFormRef}
                form={{ ...form, availableParents: taskList.filter((task) => !task.parentId && task.id !== editing && !task.deletedAt) }}
                setForm={setForm}
                onSubmit={saveTask}
                editing={editing}
                onCancel={() => { setEditing(null); setForm(emptyForm); }}
                disciplines={disciplines}
                setDisciplines={setDisciplines}
              />
              <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Minhas tarefas</h2>
            </div>

            {loading ? (
              <p className="py-12 text-center text-muted">Carregando tarefas...</p>
            ) : visibleTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
                {searchTerm ? 'Nenhuma tarefa encontrada para essa busca.' : filter === 'lixeira' ? 'Sua lixeira está vazia.' : filter === 'vencidas' ? 'Nenhuma tarefa vencida.' : 'Nenhuma tarefa por aqui ainda.'}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const isExpired = !task.completed && !task.deletedAt && new Date(task.deadline) < new Date().setHours(0,0,0,0);
                  
                  return (
                    <article key={task.id} className={`rounded-2xl border bg-surface p-4 shadow-sm ${task.deletedAt ? 'border-amber bg-amber-light/50' : isExpired ? 'border-terracotta/50 bg-pink-light/50' : task.completed ? 'border-sage' : 'border-border'}`}>
                      <div className="flex items-start gap-3">
                        {!task.deletedAt && (
                          <button 
                            aria-label={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'} 
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${task.completed ? 'border-sage bg-sage' : 'border-border'}`}
                            onClick={() => toggleTask(task)}
                          >
                            {task.completed && <span className="text-xs text-surface">✓</span>}
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold ${task.deletedAt ? 'text-muted line-through' : task.completed ? 'text-muted line-through' : 'text-ink'}`}>
                            {task.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>{task.discipline}</span>
                            <span>•</span>
                            <span className={isExpired ? 'font-bold text-terracotta-deep' : ''}>
                              Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')} {isExpired && '(Vencida)'}
                            </span>
                            <span className={`rounded-full px-2 py-1 font-bold ${priorityStyle[task.priority]}`}>{task.priority}</span>
                            {task.subTasks?.length > 0 && <span>{task.subTasks.filter((item) => !item.completed && !item.deletedAt).length} pendência(s)</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 text-sm">
                          {task.deletedAt ? (
                            <>
                              <button className="font-semibold text-sage-deep hover:text-ink" onClick={() => restoreTask(task)}>Restaurar</button>
                              <button className="font-semibold text-terracotta-deep hover:text-ink" onClick={() => removeTask(task)}>Excluir Definitivamente</button>
                            </>
                          ) : (
                            <>
                              <button className="text-muted hover:text-lavender-deep" onClick={() => editTask(task)}>Editar</button>
                              <button className="text-muted hover:text-terracotta-deep" onClick={() => removeTask(task)}>Excluir</button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
              </section>
            </div>
          </div>
        </main>
      </div>
      {toast && (
        <div
          aria-live="polite"
          className={`fixed right-4 top-24 z-40 flex w-80 max-w-[90vw] items-start gap-3 rounded-2xl border p-4 shadow-xl ${
            toast.type === 'due' ? 'border-amber bg-amber-light text-ink' : 'border-sage bg-sage-light text-ink'
          }`}
          role="status"
        >
          {toast.type === 'due'
            ? <Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-terracotta-deep" size={20} />
            : <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-sage-deep" size={20} />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{toast.title}</p>
            <p className="mt-1 text-sm">{toast.message}</p>
          </div>
          <button
            aria-label="Fechar aviso"
            className="shrink-0 rounded-lg p-1 text-muted transition hover:bg-surface/70 hover:text-ink"
            onClick={() => setToast(null)}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      )}
      {showLogoutConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLogoutConfirmation(false);
          }}
          role="presentation"
        >
          <section
            aria-describedby="logout-description"
            aria-labelledby="logout-title"
            aria-modal="true"
            className="w-full max-w-2xl rounded-3xl border border-lavender/60 bg-surface p-6 shadow-[0_20px_70px_rgba(63,51,45,0.28)] sm:p-8"
            role="dialog"
          >
            <h2 className="text-2xl font-bold text-ink" id="logout-title">Tem certeza que deseja sair?</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted" id="logout-description">
              Você será desconectado da sua conta e poderá entrar novamente quando quiser.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                autoFocus
                className="rounded-xl border border-border px-5 py-3 font-semibold text-ink transition hover:bg-beige"
                onClick={() => setShowLogoutConfirmation(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-terracotta px-6 py-3 font-bold text-ink shadow-lg shadow-terracotta/20 transition hover:bg-terracotta-deep hover:text-surface"
                onClick={logout}
                type="button"
              >
                Sair
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
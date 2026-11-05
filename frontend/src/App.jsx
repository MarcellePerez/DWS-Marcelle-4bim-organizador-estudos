import { useEffect, useMemo, useState } from 'react';
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
  ALTA: 'bg-rose-100 text-rose-700',
  MEDIA: 'bg-amber-100 text-amber-700',
  BAIXA: 'bg-emerald-100 text-emerald-700',
};

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await (mode === 'login' ? auth.login(form) : auth.register(form));
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">FOCO</p>
        <h1 className="text-3xl font-black text-slate-900">Organize seu próximo passo.</h1>
        <p className="mt-2 text-slate-500">Seu espaço simples para estudar com constância.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {mode === 'register' && <input className="field" placeholder="Seu nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input className="field" type="email" placeholder="E-mail" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" type="password" placeholder="Senha (mínimo 6 caracteres)" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        <button className="mt-5 w-full text-sm font-semibold text-slate-500 hover:text-indigo-600" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Ainda não tenho uma conta' : 'Já tenho uma conta'}
        </button>
      </section>
    </main>
  );
}

function TaskForm({ form, setForm, onSubmit, editing, onCancel, disciplines, setDisciplines }) {
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
    <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        {editing && <button type="button" className="text-sm text-slate-400" onClick={onCancel}>Cancelar</button>}
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
            <option value="NEW_DISCIPLINE" className="font-bold text-indigo-600">
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
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewDisciplineInput(false);
                setCustomDiscipline('');
              }}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
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
        <button className="mt-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-indigo-700">{editing ? 'Salvar alterações' : 'Adicionar tarefa'}</button>
      </div>
    </form>
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (filter === 'lixeira') return isDeleted;
      if (isDeleted) return false;

      if (filter === 'todas') return true;
      if (filter === 'pendentes') return !task.completed;
      if (filter === 'concluidas') return task.completed;
      if (filter === 'vencidas') return isExpired;

      return true;
    });
  }, [taskList, filter]);

  const pendingCount = taskList.filter((task) => !task.completed && !task.deletedAt).length;

  if (!session) return <AuthScreen onAuthenticated={(value) => {
    localStorage.setItem('foco-session', JSON.stringify(value));
    localStorage.setItem('@Organizador:token', value.token);
    setSession(value);
  }} />;

  async function saveTask(event) {
    event.preventDefault();
    setError('');
    try {
      const body = { ...form, deadline: new Date(`${form.deadline}T23:59:59`).toISOString(), parentId: form.parentId || null };
      if (editing) {
        const updated = await taskApi.update(session.token, editing, body);
        setTaskList(taskList.map((task) => task.id === editing ? { ...task, ...updated } : task));
      } else {
        const created = await taskApi.create(session.token, body);
        setTaskList([created, ...taskList]);
      }
      setEditing(null); 
      setForm(emptyForm);
    } catch (e) { setError(e.message); }
  }

  async function toggleTask(task) {
    try {
      const updated = await taskApi.update(session.token, task.id, { ...task, completed: !task.completed });
      setTaskList(taskList.map((item) => item.id === task.id ? { ...item, ...updated } : item));
    } catch (e) { setError(e.message); }
  }

  async function removeTask(task) {
    const isPermanent = Boolean(task.deletedAt);
    const confirmMessage = isPermanent 
      ? 'Excluir esta tarefa permanentemente do banco de dados?' 
      : 'Mover esta tarefa para a Lixeira?';

    if (!window.confirm(confirmMessage)) return;

    try { 
      await (taskApi.remove || taskApi.delete)(session.token, task.id, isPermanent); 
      if (isPermanent) {
        setTaskList(taskList.filter((item) => item.id !== task.id)); 
      } else {
        setTaskList(taskList.map((item) => item.id === task.id ? { ...item, deletedAt: new Date().toISOString() } : item));
      }
    } catch (e) { setError(e.message); }
  }

  async function restoreTask(task) {
    try {
      const updated = await taskApi.update(session.token, task.id, { ...task, deletedAt: null });
      setTaskList(taskList.map((item) => item.id === task.id ? { ...item, ...updated, deletedAt: null } : item));
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div><p className="text-sm font-bold tracking-[0.2em] text-indigo-600">FOCO</p><p className="text-sm text-slate-500">Organizador de estudos</p></div>
          <div className="flex items-center gap-4"><span className="hidden text-sm font-semibold text-slate-600 sm:block">{session.user.name}</span><button className="text-sm font-bold text-slate-400 hover:text-rose-600" onClick={() => { localStorage.removeItem('foco-session'); localStorage.removeItem('@Organizador:token'); setSession(null); }}>Sair</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8"><p className="text-sm font-semibold text-indigo-600">DASHBOARD</p><h1 className="mt-1 text-3xl font-black text-slate-900">Olá, {session.user.name.split(' ')[0]}.</h1><p className="mt-2 text-slate-500">Você tem <strong>{pendingCount} tarefa(s)</strong> para organizar.</p></div>
        {error && <div className="mb-5 flex justify-between rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <TaskForm 
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
              <h2 className="text-xl font-bold text-slate-900">Minhas tarefas</h2>
              <div className="flex flex-wrap rounded-xl bg-slate-200 p-1 text-xs font-semibold sm:text-sm">
                {[
                  ['todas', 'Todas'], 
                  ['pendentes', 'Pendentes'], 
                  ['concluidas', 'Concluídas'],
                  ['vencidas', 'Vencidas'],
                  ['lixeira', 'Lixeira']
                ].map(([value, label]) => (
                  <button 
                    key={value} 
                    className={`rounded-lg px-3 py-2 ${filter === value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} 
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="py-12 text-center text-slate-500">Carregando tarefas...</p>
            ) : visibleTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
                {filter === 'lixeira' ? 'Sua lixeira está vazia.' : filter === 'vencidas' ? 'Nenhuma tarefa vencida.' : 'Nenhuma tarefa por aqui ainda.'}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const isExpired = !task.completed && !task.deletedAt && new Date(task.deadline) < new Date().setHours(0,0,0,0);
                  
                  return (
                    <article key={task.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${task.deletedAt ? 'border-amber-200 bg-amber-50/30' : isExpired ? 'border-rose-300 bg-rose-50/20' : task.completed ? 'border-emerald-200' : 'border-slate-200'}`}>
                      <div className="flex items-start gap-3">
                        {!task.deletedAt && (
                          <button 
                            aria-label={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'} 
                            className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${task.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`} 
                            onClick={() => toggleTask(task)}
                          >
                            {task.completed && <span className="text-xs text-white">✓</span>}
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold ${task.deletedAt ? 'text-slate-400 line-through' : task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {task.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{task.discipline}</span>
                            <span>•</span>
                            <span className={isExpired ? 'font-bold text-rose-600' : ''}>
                              Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')} {isExpired && '(Vencida)'}
                            </span>
                            <span className={`rounded-full px-2 py-1 font-bold ${priorityStyle[task.priority]}`}>{task.priority}</span>
                            {task.subTasks?.length > 0 && <span>{task.subTasks.filter((item) => !item.completed && !item.deletedAt).length} pendência(s)</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 text-sm">
                          {task.deletedAt ? (
                            <>
                              <button className="font-semibold text-emerald-600 hover:text-emerald-700" onClick={() => restoreTask(task)}>Restaurar</button>
                              <button className="font-semibold text-rose-600 hover:text-rose-700" onClick={() => removeTask(task)}>Excluir Definitivamente</button>
                            </>
                          ) : (
                            <>
                              <button className="text-slate-400 hover:text-indigo-600" onClick={() => editTask(task)}>Editar</button>
                              <button className="text-slate-400 hover:text-rose-600" onClick={() => removeTask(task)}>Excluir</button>
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
      </main>
    </div>
  );
}

export default App;
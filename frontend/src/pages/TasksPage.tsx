import { useState, useCallback } from 'react'
import { useTaskStore } from '../store'
import { Sheet } from '../components/Sheet'
import { tasksApi } from '../api'
import type { Priority } from '../types'

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'Без приоритета' },
  { value: 'high', label: '🔴 Высокий' },
  { value: 'medium', label: '🟡 Средний' },
  { value: 'low', label: '🟢 Низкий' },
]

function PriorityBadge({ p }: { p?: string | null }) {
  if (!p) return null
  const map: Record<string, { label: string; cls: string }> = {
    high:   { label: 'Высокий', cls: 'badge badge-high' },
    medium: { label: 'Средний', cls: 'badge badge-medium' },
    low:    { label: 'Низкий',  cls: 'badge badge-low' },
  }
  const m = map[p]
  if (!m) return null
  return <span className={m.cls}>{m.label}</span>
}

function DeadlineBadge({ d }: { d?: string | null }) {
  if (!d) return null
  const date = new Date(d)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86400000)
  const label = diff === 0 ? 'Сегодня' : diff === 1 ? 'Завтра' : diff < 0 ? `${Math.abs(diff)}д назад` : `${diff}д`
  const overdue = diff < 0
  return (
    <span className="badge badge-date" style={overdue ? { color: 'var(--rose)', background: 'rgba(244,63,94,.12)' } : {}}>
      📅 {label}
    </span>
  )
}

export function TasksPage() {
  const { tasks, toggle, remove, add } = useTaskStore()
  const [tab, setTab] = useState<'all' | 'active' | 'done'>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const showNotif = (msg: string) => {
    setNotif(msg)
    setTimeout(() => setNotif(''), 2200)
  }

  const filtered = tasks.filter((t) =>
    tab === 'all' ? true : tab === 'active' ? !t.is_completed : t.is_completed
  )

  const handleToggle = useCallback((uid: string, done: boolean) => {
    toggle(uid)
    if (!done) showNotif('✅ Задача выполнена!')
  }, [toggle])

  const handleDelete = (uid: string) => {
    setDeleting(uid)
    setTimeout(() => {
      remove(uid)
      setDeleting(null)
      showNotif('🗑 Задача удалена')
    }, 300)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const t = await tasksApi.create({
        title: title.trim(),
        description: desc.trim() || undefined,
        priority: priority || undefined,
        deadline: deadline || undefined,
      })
      add(t)
    } catch {
      add({
        uid: crypto.randomUUID(),
        title: title.trim(),
        description: desc.trim() || undefined,
        priority: priority || undefined,
        deadline: deadline || undefined,
        is_completed: false,
        created_at: new Date().toISOString(),
      })
    } finally {
      setSaving(false)
      setSheetOpen(false)
      setTitle(''); setDesc(''); setPriority(''); setDeadline('')
      showNotif('✨ Задача добавлена')
    }
  }

  const now = new Date()
  const greet = now.getHours() < 12 ? 'Доброе утро' : now.getHours() < 18 ? 'Добрый день' : 'Добрый вечер'
  const doneCount = tasks.filter((t) => t.is_completed).length
  const totalCount = tasks.length

  return (
    <div className="page">
      {notif && <div className="notif">{notif}</div>}

      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>{greet} 👋</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            Задачи
            {totalCount > 0 && (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginLeft: 8 }}>
                {doneCount}/{totalCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="scroll">
        <div className="tab-row">
          {(['all', 'active', 'done'] as const).map((t) => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'Все' : t === 'active' ? 'Активные' : 'Готово'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{tab === 'done' ? '🎉' : '📋'}</div>
            <div className="empty-text">
              {tab === 'done' ? 'Ещё ничего не выполнено' : 'Список задач пуст'}
            </div>
            <div className="empty-sub">
              {tab !== 'done' ? 'Нажми + чтобы добавить задачу' : 'Выполняй задачи — они будут здесь'}
            </div>
          </div>
        ) : (
          filtered.map((task, i) => (
            <div
              key={task.uid}
              className={`task-item${task.is_completed ? ' done' : ''}${deleting === task.uid ? ' done' : ''}`}
              data-p={task.priority ?? undefined}
              style={{ animationDelay: `${i * 40}ms`, opacity: deleting === task.uid ? 0 : undefined, transform: deleting === task.uid ? 'translateX(20px)' : undefined }}
            >
              <div
                className={`task-cb${task.is_completed ? ' checked' : ''}`}
                onClick={() => handleToggle(task.uid, task.is_completed)}
              >
                {task.is_completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`task-title${task.is_completed ? ' done' : ''}`}>{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{task.description}</div>
                )}
                <div className="task-meta">
                  <PriorityBadge p={task.priority} />
                  <DeadlineBadge d={task.deadline} />
                </div>
              </div>
              <button
                className="btn-icon"
                style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0 }}
                onClick={() => handleDelete(task.uid)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <button className="fab" style={{ bottom: 'calc(var(--nav-h) + 16px)' }} onClick={() => setSheetOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Новая задача">
        <div className="input-wrap">
          <label className="input-label">Название</label>
          <input className="input-field" placeholder="Что нужно сделать?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="input-wrap">
          <label className="input-label">Описание</label>
          <textarea className="input-field" placeholder="Детали (необязательно)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb16">
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <label className="input-label">Приоритет</label>
            <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')} style={{ WebkitAppearance: 'none' }}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="input-wrap" style={{ marginBottom: 0 }}>
            <label className="input-label">Дедлайн</label>
            <input className="input-field" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? 'Сохранение...' : 'Добавить задачу'}
        </button>
      </Sheet>
    </div>
  )
}

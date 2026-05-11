import React, { useState, useRef, useEffect } from 'react'
import { C, DAYS_SHORT, MONTHS_RU, fmtDate, fmtDateDisplay, NOW } from '../tokens'
import { GlassCard, SheetHandle, SectionLabel, AddBtn, Pill } from '../components/ui'
import type { Task } from '../types'

export function AddTaskSheet({ onClose, onAdd, onSave, onArchive, onDelete, onToggleDone, initialTask }: {
  onClose: () => void
  onAdd?: (t: Task) => void
  onSave?: (t: Task) => void
  onArchive?: () => void
  onDelete?: () => void
  onToggleDone?: () => void
  initialTask?: Task
}) {
  const isEdit = !!initialTask
  const [title, setTitle] = useState(initialTask?.title || '')
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority || 'medium')
  const [tags, setTags] = useState<string[]>(initialTask?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [showCal, setShowCal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialTask?.dueDate ? new Date(initialTask.dueDate + 'T00:00') : (!isEdit ? new Date() : null))
  const [viewMonth, setViewMonth] = useState(new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!isEdit) setTimeout(() => inputRef.current?.focus(), 350) }, [])

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags(ts => [...ts, t])
    setTagInput('')
  }

  const submit = () => {
    if (!title.trim()) return
    const dueDate = selectedDate ? fmtDate(selectedDate) : null
    if (isEdit) {
      onSave?.({ ...initialTask!, title, priority, dueDate, tags })
    } else {
      onAdd?.({ id: Date.now(), title, done: false, priority, dueDate, tags, archivedAt: null, doneAt: null })
    }
    onClose()
  }

  const y = viewMonth.getFullYear(), mo = viewMonth.getMonth()
  const calDays = new Date(y, mo + 1, 0).getDate()
  const blank = new Date(y, mo, 1).getDay()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, animation: 'fadeIn 0.2s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto', width: '100%', maxWidth: 430,
        background: 'var(--c-sheet)', borderTop: `1px solid ${C.borderHi}`,
        borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 101,
        animation: 'slideUp 0.4s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 'max(env(safe-area-inset-bottom,0px),20px)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <SheetHandle />
        <div style={{ padding: '12px 20px 24px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 18 }}>{isEdit ? 'Редактировать' : 'Новая задача'}</div>

          <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
            <input ref={inputRef} type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Название задачи…" onKeyDown={e => e.key === 'Enter' && submit()} style={{ fontSize: 16, color: C.text }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.textSub, marginBottom: 8 }}>Приоритет</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['high', 'Высокий', '#ef6060'], ['medium', 'Средний', '#f0a040'], ['low', 'Низкий', '#60a8ef']] as const).map(([v, l, clr]) => (
                <button key={v} onClick={() => setPriority(v)} style={{
                  flex: 1, padding: '8px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: priority === v ? clr + '22' : C.s1, border: `1px solid ${priority === v ? clr + '66' : C.border}`,
                  color: priority === v ? clr : C.textSub, transition: 'all 0.2s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: C.textSub }}>Дата</div>
              <button onClick={() => setShowCal(v => !v)} style={{ fontSize: 12, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {selectedDate ? fmtDateDisplay(fmtDate(selectedDate)) : showCal ? 'Скрыть' : 'Выбрать'}
              </button>
            </div>
            {showCal && (
              <GlassCard style={{ padding: '14px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, fontSize: 18, padding: '4px 8px' }}>‹</button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{MONTHS_RU[mo]} {y}</span>
                  <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSub, fontSize: 18, padding: '4px 8px' }}>›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
                  {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: C.textMute, padding: '4px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                  {Array(blank).fill(null).map((_, i) => <div key={'b' + i} />)}
                  {Array(calDays).fill(null).map((_, i) => {
                    const d = new Date(y, mo, i + 1)
                    const isSel = selectedDate && d.toDateString() === selectedDate.toDateString()
                    const isToday = d.toDateString() === today.toDateString()
                    return (
                      <button key={i} onClick={() => { setSelectedDate(d); setShowCal(false) }} style={{
                        aspectRatio: '1', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: isSel || isToday ? 700 : 400,
                        background: isSel ? C.gold : isToday ? 'rgba(196,154,90,0.15)' : 'transparent',
                        color: isSel ? 'white' : isToday ? C.gold : C.text, transition: 'all 0.15s',
                      }}>{i + 1}</button>
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.textSub, marginBottom: 8 }}>Теги</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags.map(tag => (
                <span key={tag} onClick={() => setTags(ts => ts.filter(t => t !== tag))} style={{
                  fontSize: 12, color: C.gold, background: C.goldDim, border: `1px solid rgba(196,154,90,0.3)`,
                  padding: '4px 10px', borderRadius: 10, cursor: 'pointer',
                }}>#{tag} ×</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px' }}>
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  placeholder="Название тега…" style={{ fontSize: 14, width: '100%', color: C.text }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                />
              </div>
              <button onClick={addTag} style={{
                padding: '11px 16px', borderRadius: 12, border: `1px solid rgba(196,154,90,0.4)`,
                background: 'rgba(196,154,90,0.13)', cursor: 'pointer', color: C.gold,
                fontSize: 14, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
              }}>+</button>
            </div>
          </div>

          <button onClick={submit} style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: title.trim() ? 'pointer' : 'default',
            background: title.trim() ? 'linear-gradient(135deg,#c49a5a,#a07040)' : C.s1,
            outline: title.trim() ? '1px solid rgba(196,154,90,0.4)' : `1px solid ${C.border}`,
            color: title.trim() ? 'white' : C.textMute, fontSize: 16, fontWeight: 700,
            boxShadow: title.trim() ? '0 4px 20px rgba(196,154,90,0.25)' : 'none', transition: 'all 0.3s',
          }}>{isEdit ? 'Сохранить' : 'Добавить задачу'}</button>

          {isEdit && (
            <>
              <button onClick={() => { onToggleDone?.(); onClose() }} style={{
                width: '100%', marginTop: 10, padding: '14px', borderRadius: 14, border: `1px solid ${C.border}`, cursor: 'pointer',
                background: initialTask!.done ? C.s2 : 'rgba(74,184,160,0.10)',
                color: initialTask!.done ? C.text : '#5fc4a8', fontSize: 15, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {initialTask!.done ? 'Отметить невыполненной' : 'Отметить выполненной'}
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => { onArchive?.(); onClose() }} style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: `1px solid ${C.border}`, cursor: 'pointer',
                  background: C.s1, color: C.textSub, fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
                  В архив
                </button>
                <button onClick={() => { onDelete?.(); onClose() }} style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: '1px solid rgba(239,96,96,0.2)', cursor: 'pointer',
                  background: 'rgba(239,96,96,0.08)', color: '#ef6060', fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                  Удалить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function TasksPage({
  tasks, setTasks, onAdd, onEdit,
}: {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  onAdd: () => void
  onEdit: (t: Task) => void
}) {
  const [filter, setFilter] = useState<'today' | 'all' | 'important'>('today')
  const today = new Date()
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }).toUpperCase()

  const live = tasks.filter(t => !t.archivedAt)
  const visible = live.filter(t =>
    filter === 'today' ? !t.dueDate || t.dueDate === fmtDate(today) :
    filter === 'important' ? t.priority === 'high' : true
  )
  const active = visible.filter(t => !t.done)
  const done = visible.filter(t => t.done)
  const toggle = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? NOW() : null } : t))
  const prColor = (p: string) => p === 'high' ? '#ef6060' : p === 'medium' ? '#f0a040' : '#60a8ef'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: C.textMute, letterSpacing: '0.1em' }}>{dateStr}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>Задачи</h1>
          {live.length > 0 && <AddBtn onPress={onAdd} />}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {([['today', 'Сегодня'], ['all', 'Все'], ['important', 'Важные']] as const).map(([v, l]) => (
            <Pill key={v} active={filter === v} onClick={() => setFilter(v)}>{l}</Pill>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        {live.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMute }}>
            <div style={{ fontSize: 52, marginBottom: 16, animation: 'floaty 4s ease-in-out infinite' }}>✦</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.textSub, marginBottom: 8 }}>Нет задач</div>
            <div style={{ fontSize: 14, color: C.textMute, lineHeight: 1.6 }}>Нажми кнопку ниже<br/>чтобы добавить первую задачу</div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {active.map(task => (
            <GlassCard key={task.id} onClick={() => onEdit(task)} style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div onClick={e => { e.stopPropagation(); toggle(task.id) }} style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${C.borderHi}`, flexShrink: 0, cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{task.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: prColor(task.priority) }} />
                      <span style={{ fontSize: 12, color: C.textSub }}>{task.dueDate ? fmtDateDisplay(task.dueDate) : 'Сегодня'}</span>
                    </div>
                    {task.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: C.textSub, background: C.s2, padding: '2px 8px', borderRadius: 8, border: `1px solid ${C.border}` }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {done.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <SectionLabel>Выполнено · {done.length}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map(task => (
                <GlassCard key={task.id} onClick={() => onEdit(task)} style={{ padding: '14px 16px', cursor: 'pointer', opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div onClick={e => { e.stopPropagation(); toggle(task.id) }} style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: `1.5px solid rgba(255,255,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ fontSize: 15, color: C.textSub, textDecoration: 'line-through' }}>{task.title}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

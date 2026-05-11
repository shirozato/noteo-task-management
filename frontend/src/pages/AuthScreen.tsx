import React, { useState } from 'react'
import { C } from '../tokens'
import type { User } from '../types'
import { apiLogin, apiRegister } from '../api'

export default function AuthScreen({
  onLogin,
}: {
  onLogin: (u: User, waterGoal: number, waterUnit: string) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  // Basic email format check on client side
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

  const submit = async () => {
    setErr('')
    if (!email || !pass) { setErr('Заполните все поля'); return }
    if (mode === 'register' && !name) { setErr('Введите имя'); return }
    if (!isValidEmail(email)) { setErr('Введите корректный email (например: user@gmail.com)'); return }
    if (pass.length < 8) { setErr('Пароль минимум 8 символов'); return }

    setLoading(true)
    try {
      let result: { user: User; waterGoal: number; waterUnit: string }
      if (mode === 'register') {
        result = await apiRegister(name.trim(), email.trim(), pass)
      } else {
        result = await apiLogin(email.trim(), pass)
      }
      onLogin(result.user, result.waterGoal, result.waterUnit)
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Ошибка сервера'
      // Translate server errors to Russian
      if (raw.includes('Email already')) setErr('Email уже зарегистрирован')
      else if (raw.includes('Invalid email or password')) setErr('Неверный email или пароль')
      else if (raw.includes('valid email') || raw.includes('@-sign') || raw.includes('value_error')) setErr('Введите корректный email')
      else if (raw.includes('422') || raw.startsWith('[{')) setErr('Проверь правильность введённых данных')
      else setErr('Ошибка сервера, попробуй ещё раз')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    background: C.s2, border: `1px solid ${C.border}`, borderTop: `1px solid ${C.borderHi}`,
    fontSize: 15, color: C.text, outline: 'none',
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 28px',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,154,90,0.1) 0%, transparent 60%), var(--c-bg)',
      animation: 'authIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {[[10,12,'2.5s'],[22,38,'1.8s'],[72,20,'3.1s'],[85,55,'2.2s'],[8,70,'1.5s'],[60,8,'2.8s']].map(([x,y,d],i) => (
        <div key={i} style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: 3, height: 3, borderRadius: '50%',
          background: 'rgba(196,154,90,0.6)',
          animation: `twinkle ${d} ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ fontSize: 52, marginBottom: 8, color: C.gold, lineHeight: '1', animation: 'floaty 4s ease-in-out infinite' }}>✦</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', marginBottom: 4 }}>Noteo</div>
      <div style={{ fontSize: 14, color: C.textSub, marginBottom: 40 }}>трекер привычек и задач</div>

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'register' && (
          <div style={inputStyle} key="name-wrap">
            <input
              type="text" placeholder="Ваше имя" value={name}
              onChange={e => setName(e.target.value)}
              style={{ fontSize: 15, color: C.text, background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
            />
          </div>
        )}
        <div style={inputStyle}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ fontSize: 15, color: C.text, background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
          />
        </div>
        <div style={inputStyle}>
          <input
            type="password" placeholder="Пароль (мин. 8 символов)" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ fontSize: 15, color: C.text, background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
          />
        </div>

        {err && <div style={{ fontSize: 13, color: '#ef7060', textAlign: 'center' }}>{err}</div>}

        <button
          className="ui-btn"
          onClick={submit}
          disabled={loading}
          style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}
        >
          <span>{loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 13, color: C.textSub }}>
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          </span>
          <span
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr('') }}
            style={{ fontSize: 13, color: C.gold, cursor: 'pointer', fontWeight: 600 }}
          >
            {mode === 'login' ? 'Регистрация' : 'Войти'}
          </span>
        </div>
      </div>
    </div>
  )
}

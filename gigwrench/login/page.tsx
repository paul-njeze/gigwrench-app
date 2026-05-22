'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const LANGS = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
]

const UI: Record<string, Record<string, string>> = {
  en: { title: 'Welcome back.', sub: 'Sign in to your GigWrench account', email: 'Email address', password: 'Password', signin: 'Sign In', no_account: "Don't have an account?", signup: 'Create account', forgot: 'Forgot password?', error: 'Invalid email or password' },
  es: { title: 'Bienvenido de nuevo.', sub: 'Inicia sesión en tu cuenta GigWrench', email: 'Correo electrónico', password: 'Contraseña', signin: 'Iniciar sesión', no_account: '¿No tienes cuenta?', signup: 'Crear cuenta', forgot: '¿Olvidaste tu contraseña?', error: 'Correo o contraseña incorrectos' },
  pt: { title: 'Bem-vindo de volta.', sub: 'Entre na sua conta GigWrench', email: 'E-mail', password: 'Senha', signin: 'Entrar', no_account: 'Não tem conta?', signup: 'Criar conta', forgot: 'Esqueceu a senha?', error: 'Email ou senha inválidos' },
  fr: { title: 'Bon retour.', sub: 'Connectez-vous à votre compte GigWrench', email: 'Adresse e-mail', password: 'Mot de passe', signin: 'Se connecter', no_account: "Pas de compte?", signup: 'Créer un compte', forgot: 'Mot de passe oublié?', error: 'Email ou mot de passe invalide' },
  pl: { title: 'Witaj z powrotem.', sub: 'Zaloguj się do swojego konta GigWrench', email: 'Adres e-mail', password: 'Hasło', signin: 'Zaloguj się', no_account: 'Nie masz konta?', signup: 'Utwórz konto', forgot: 'Zapomniałeś hasła?', error: 'Nieprawidłowy e-mail lub hasło' },
  ar: { title: 'مرحباً بعودتك.', sub: 'سجل الدخول إلى حساب GigWrench', email: 'البريد الإلكتروني', password: 'كلمة المرور', signin: 'تسجيل الدخول', no_account: 'ليس لديك حساب؟', signup: 'إنشاء حساب', forgot: 'نسيت كلمة المرور؟', error: 'بريد إلكتروني أو كلمة مرور غير صحيحة' },
}

export default function LoginPage() {
  const [lang, setLang] = useState('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const ui = UI[lang] || UI.en

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(ui.error); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/></svg>
          </div>
          <span className="font-display text-xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </Link>
        {/* Language selector */}
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${lang === l.code ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25' : 'text-white/30 hover:text-white/60'}`}
              title={l.label}>{l.flag}</button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-5xl tracking-wider text-white mb-2">{ui.title}</h1>
            <p className="text-white/50 font-mono text-sm">{ui.sub}</p>
          </div>

          {/* Google SSO */}
          <button type="button" onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } }
            })
          }}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                placeholder="you@email.com"/>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.password}</label>
                <Link href="/forgot-password" className="font-mono text-[10px] text-yellow-400/60 hover:text-yellow-400 transition-colors">{ui.forgot}</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors"
                placeholder="••••••••"/>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">{error}</div>}

            <button type="submit" disabled={loading}
              className="bg-yellow-400 text-black font-display text-xl tracking-widest py-3 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? '...' : ui.signin}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6 font-mono">
            {ui.no_account}{' '}
            <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.signup}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

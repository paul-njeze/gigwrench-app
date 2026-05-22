'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, X, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'

// ── LANGUAGES ──
const LANGS = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
]

const UI: Record<string, Record<string, string>> = {
  en: {
    title: 'Create Your Account.', sub: 'Join GigWrench — free to start',
    role_q: 'I am joining as a...', role_pro: 'Pro — I offer services', role_cust: 'Customer — I need services',
    first: 'First Name', last: 'Last Name', email: 'Email Address', password: 'Password', confirm: 'Confirm Password',
    show: 'Show', hide: 'Hide', creating: 'Creating account...', create: 'Create Account',
    or: 'or continue with', google: 'Continue with Google',
    have_account: 'Already have an account?', signin: 'Sign in',
    terms_pre: 'By creating an account you agree to our', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy',
    pw_title: 'Password Requirements (NIST SP 800-63B)',
    pw_length: 'Minimum 12 characters', pw_upper: 'At least one uppercase letter (A–Z)',
    pw_lower: 'At least one lowercase letter (a–z)', pw_number: 'At least one number (0–9)',
    pw_special: 'At least one special character (!@#$...)', pw_no_common: 'Not a commonly used password',
    pw_no_spaces: 'No leading or trailing spaces', pw_match: 'Passwords match',
    pw_strength: 'Password strength', weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong',
    err_match: 'Passwords do not match', err_weak: 'Password does not meet requirements',
    err_email: 'Please enter a valid email address', err_generic: 'Something went wrong. Please try again.',
    err_exists: 'An account with this email already exists. Sign in instead.',
    nist_note: 'We follow NIST SP 800-63B guidelines to keep your account secure.',
  },
  es: {
    title: 'Crea Tu Cuenta.', sub: 'Únete a GigWrench — gratis para empezar',
    role_q: 'Me uno como...', role_pro: 'Profesional — ofrezco servicios', role_cust: 'Cliente — necesito servicios',
    first: 'Nombre', last: 'Apellido', email: 'Correo electrónico', password: 'Contraseña', confirm: 'Confirmar contraseña',
    show: 'Mostrar', hide: 'Ocultar', creating: 'Creando cuenta...', create: 'Crear Cuenta',
    or: 'o continuar con', google: 'Continuar con Google',
    have_account: '¿Ya tienes cuenta?', signin: 'Iniciar sesión',
    terms_pre: 'Al crear una cuenta aceptas nuestros', terms: 'Términos de servicio', and: 'y', privacy: 'Política de privacidad',
    pw_title: 'Requisitos de contraseña (NIST SP 800-63B)',
    pw_length: 'Mínimo 12 caracteres', pw_upper: 'Al menos una letra mayúscula (A–Z)',
    pw_lower: 'Al menos una letra minúscula (a–z)', pw_number: 'Al menos un número (0–9)',
    pw_special: 'Al menos un carácter especial (!@#$...)', pw_no_common: 'No es una contraseña común',
    pw_no_spaces: 'Sin espacios al inicio o al final', pw_match: 'Las contraseñas coinciden',
    pw_strength: 'Fortaleza de contraseña', weak: 'Débil', fair: 'Regular', good: 'Buena', strong: 'Fuerte',
    err_match: 'Las contraseñas no coinciden', err_weak: 'La contraseña no cumple los requisitos',
    err_email: 'Por favor ingresa un correo válido', err_generic: 'Algo salió mal. Por favor intenta de nuevo.',
    err_exists: 'Ya existe una cuenta con este correo. Inicia sesión.',
    nist_note: 'Seguimos las pautas NIST SP 800-63B para mantener tu cuenta segura.',
  },
  pt: {
    title: 'Crie Sua Conta.', sub: 'Entre no GigWrench — grátis para começar',
    role_q: 'Estou entrando como...', role_pro: 'Profissional — ofereço serviços', role_cust: 'Cliente — preciso de serviços',
    first: 'Nome', last: 'Sobrenome', email: 'E-mail', password: 'Senha', confirm: 'Confirmar senha',
    show: 'Mostrar', hide: 'Ocultar', creating: 'Criando conta...', create: 'Criar Conta',
    or: 'ou continuar com', google: 'Continuar com Google',
    have_account: 'Já tem conta?', signin: 'Entrar',
    terms_pre: 'Ao criar uma conta você concorda com nossos', terms: 'Termos de serviço', and: 'e', privacy: 'Política de privacidade',
    pw_title: 'Requisitos de senha (NIST SP 800-63B)',
    pw_length: 'Mínimo 12 caracteres', pw_upper: 'Pelo menos uma letra maiúscula (A–Z)',
    pw_lower: 'Pelo menos uma letra minúscula (a–z)', pw_number: 'Pelo menos um número (0–9)',
    pw_special: 'Pelo menos um caractere especial (!@#$...)', pw_no_common: 'Não é uma senha comum',
    pw_no_spaces: 'Sem espaços no início ou no final', pw_match: 'As senhas coincidem',
    pw_strength: 'Força da senha', weak: 'Fraca', fair: 'Regular', good: 'Boa', strong: 'Forte',
    err_match: 'As senhas não coincidem', err_weak: 'A senha não atende aos requisitos',
    err_email: 'Por favor insira um e-mail válido', err_generic: 'Algo deu errado. Tente novamente.',
    err_exists: 'Já existe uma conta com este e-mail. Faça login.',
    nist_note: 'Seguimos as diretrizes NIST SP 800-63B para manter sua conta segura.',
  },
  fr: {
    title: 'Créez Votre Compte.', sub: 'Rejoignez GigWrench — gratuit pour commencer',
    role_q: 'Je rejoins en tant que...', role_pro: 'Professionnel — je propose des services', role_cust: 'Client — j\'ai besoin de services',
    first: 'Prénom', last: 'Nom', email: 'Adresse e-mail', password: 'Mot de passe', confirm: 'Confirmer le mot de passe',
    show: 'Afficher', hide: 'Masquer', creating: 'Création du compte...', create: 'Créer un Compte',
    or: 'ou continuer avec', google: 'Continuer avec Google',
    have_account: 'Déjà un compte?', signin: 'Se connecter',
    terms_pre: 'En créant un compte vous acceptez nos', terms: 'Conditions d\'utilisation', and: 'et', privacy: 'Politique de confidentialité',
    pw_title: 'Exigences du mot de passe (NIST SP 800-63B)',
    pw_length: 'Minimum 12 caractères', pw_upper: 'Au moins une lettre majuscule (A–Z)',
    pw_lower: 'Au moins une lettre minuscule (a–z)', pw_number: 'Au moins un chiffre (0–9)',
    pw_special: 'Au moins un caractère spécial (!@#$...)', pw_no_common: 'Pas un mot de passe courant',
    pw_no_spaces: 'Pas d\'espaces au début ou à la fin', pw_match: 'Les mots de passe correspondent',
    pw_strength: 'Force du mot de passe', weak: 'Faible', fair: 'Moyen', good: 'Bon', strong: 'Fort',
    err_match: 'Les mots de passe ne correspondent pas', err_weak: 'Le mot de passe ne répond pas aux exigences',
    err_email: 'Veuillez entrer une adresse e-mail valide', err_generic: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
    err_exists: 'Un compte avec cet e-mail existe déjà. Connectez-vous.',
    nist_note: 'Nous suivons les directives NIST SP 800-63B pour sécuriser votre compte.',
  },
  pl: {
    title: 'Utwórz Konto.', sub: 'Dołącz do GigWrench — bezpłatnie na start',
    role_q: 'Dołączam jako...', role_pro: 'Specjalista — oferuję usługi', role_cust: 'Klient — potrzebuję usług',
    first: 'Imię', last: 'Nazwisko', email: 'Adres e-mail', password: 'Hasło', confirm: 'Potwierdź hasło',
    show: 'Pokaż', hide: 'Ukryj', creating: 'Tworzenie konta...', create: 'Utwórz Konto',
    or: 'lub kontynuuj z', google: 'Kontynuuj z Google',
    have_account: 'Masz już konto?', signin: 'Zaloguj się',
    terms_pre: 'Tworząc konto akceptujesz nasze', terms: 'Warunki usługi', and: 'i', privacy: 'Politykę prywatności',
    pw_title: 'Wymagania hasła (NIST SP 800-63B)',
    pw_length: 'Minimum 12 znaków', pw_upper: 'Co najmniej jedna wielka litera (A–Z)',
    pw_lower: 'Co najmniej jedna mała litera (a–z)', pw_number: 'Co najmniej jedna cyfra (0–9)',
    pw_special: 'Co najmniej jeden znak specjalny (!@#$...)', pw_no_common: 'Nie jest powszechnym hasłem',
    pw_no_spaces: 'Bez spacji na początku lub końcu', pw_match: 'Hasła są zgodne',
    pw_strength: 'Siła hasła', weak: 'Słabe', fair: 'Średnie', good: 'Dobre', strong: 'Silne',
    err_match: 'Hasła nie są zgodne', err_weak: 'Hasło nie spełnia wymagań',
    err_email: 'Wprowadź prawidłowy adres e-mail', err_generic: 'Coś poszło nie tak. Spróbuj ponownie.',
    err_exists: 'Konto z tym adresem e-mail już istnieje. Zaloguj się.',
    nist_note: 'Stosujemy wytyczne NIST SP 800-63B dla bezpieczeństwa konta.',
  },
  ar: {
    title: 'أنشئ حسابك.', sub: 'انضم إلى GigWrench — مجاناً للبدء',
    role_q: 'أنضم بصفتي...', role_pro: 'محترف — أقدم خدمات', role_cust: 'عميل — أحتاج خدمات',
    first: 'الاسم الأول', last: 'اسم العائلة', email: 'البريد الإلكتروني', password: 'كلمة المرور', confirm: 'تأكيد كلمة المرور',
    show: 'إظهار', hide: 'إخفاء', creating: 'جارٍ إنشاء الحساب...', create: 'إنشاء الحساب',
    or: 'أو المتابعة مع', google: 'المتابعة مع Google',
    have_account: 'هل لديك حساب بالفعل؟', signin: 'تسجيل الدخول',
    terms_pre: 'بإنشاء حساب توافق على', terms: 'شروط الخدمة', and: 'و', privacy: 'سياسة الخصوصية',
    pw_title: 'متطلبات كلمة المرور (NIST SP 800-63B)',
    pw_length: '12 حرفًا على الأقل', pw_upper: 'حرف كبير واحد على الأقل (A–Z)',
    pw_lower: 'حرف صغير واحد على الأقل (a–z)', pw_number: 'رقم واحد على الأقل (0–9)',
    pw_special: 'رمز خاص واحد على الأقل (!@#$...)', pw_no_common: 'ليست كلمة مرور شائعة',
    pw_no_spaces: 'بدون مسافات في البداية أو النهاية', pw_match: 'كلمتا المرور متطابقتان',
    pw_strength: 'قوة كلمة المرور', weak: 'ضعيفة', fair: 'متوسطة', good: 'جيدة', strong: 'قوية',
    err_match: 'كلمتا المرور غير متطابقتين', err_weak: 'كلمة المرور لا تستوفي المتطلبات',
    err_email: 'الرجاء إدخال بريد إلكتروني صالح', err_generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    err_exists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل. سجّل الدخول.',
    nist_note: 'نتبع إرشادات NIST SP 800-63B للحفاظ على أمان حسابك.',
  },
}

// ── NIST SP 800-63B COMPLIANT PASSWORD RULES ──
// Reference: https://pages.nist.gov/800-63-3/sp800-63b.html
// AC-2, AC-7, IA-5 control families
const COMMON_PASSWORDS = new Set([
  'password','password1','password123','123456789','12345678','qwerty123',
  'iloveyou','admin123','letmein1','welcome1','monkey123','dragon123',
  'master123','hello123','shadow123','sunshine','princess','football',
  'baseball','superman','batman123','trustno1','passw0rd','gigwrench',
])

interface PwCheck {
  key: string
  labelKey: string
  test: (pw: string, confirm?: string) => boolean
}

const PW_CHECKS: PwCheck[] = [
  { key: 'length',   labelKey: 'pw_length',   test: pw => pw.length >= 12 },
  { key: 'upper',    labelKey: 'pw_upper',    test: pw => /[A-Z]/.test(pw) },
  { key: 'lower',    labelKey: 'pw_lower',    test: pw => /[a-z]/.test(pw) },
  { key: 'number',   labelKey: 'pw_number',   test: pw => /[0-9]/.test(pw) },
  { key: 'special',  labelKey: 'pw_special',  test: pw => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
  { key: 'common',   labelKey: 'pw_no_common',test: pw => !COMMON_PASSWORDS.has(pw.toLowerCase()) },
  { key: 'spaces',   labelKey: 'pw_no_spaces',test: pw => pw === pw.trim() },
]

function getStrength(pw: string): number {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) score++
  if (!COMMON_PASSWORDS.has(pw.toLowerCase())) score++
  return Math.min(4, Math.floor(score / 1.75))
}

const STRENGTH_CONFIG = [
  { color: 'bg-red-500',    textKey: 'weak' },
  { color: 'bg-orange-400', textKey: 'fair' },
  { color: 'bg-yellow-400', textKey: 'good' },
  { color: 'bg-green-400',  textKey: 'strong' },
]

export default function SignupPage() {
  const [lang, setLang] = useState('en')
  const [role, setRole] = useState<'pro' | 'customer'>('pro')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const router = useRouter()
  const ui = UI[lang] || UI.en

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('gw_lang')
    if (saved && UI[saved]) setLang(saved)
  }, [])

  // ── PASSWORD VALIDATION ──
  const pwResults = PW_CHECKS.map(c => ({ ...c, passed: c.test(password) }))
  const confirmPassed = confirm.length > 0 && password === confirm
  const allPwPassed = pwResults.every(r => r.passed)
  const strength = getStrength(password)
  const strengthConfig = STRENGTH_CONFIG[strength - 1]

  // ── EMAIL VALIDATION ──
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // ── GOOGLE SSO ──
  // NIST AU-2, AU-3: OAuth 2.0 via trusted identity provider
  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: {
          // Force account selection — NIST AC-7 equivalent for SSO
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    })
    if (err) { setError(ui.err_generic); setGoogleLoading(false) }
    // Google redirects — no further action needed here
  }

  // ── EMAIL/PASSWORD SIGNUP ──
  // NIST IA-5: Authenticator management
  // NIST AC-2: Account management
  // NIST AU-2: Audit events (Supabase logs all auth events)
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!emailValid) { setError(ui.err_email); return }
    if (!allPwPassed) { setError(ui.err_weak); return }
    if (!confirmPassed) { setError(ui.err_match); return }
    if (!agreedTerms) { setError('Please agree to the Terms of Service and Privacy Policy.'); return }

    setLoading(true)
    const supabase = createClient()

    // Create auth user — Supabase sends verification email automatically
    // NIST IA-5(1): Email verification before account activation
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // NIST IA-5: normalize email
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          language: lang,
          // NIST AU-3: Record signup context
          signup_method: 'email',
          signup_at: new Date().toISOString(),
        },
      },
    })

    if (signUpError) {
      setLoading(false)
      if (signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already exists')) {
        setError(ui.err_exists)
      } else {
        setError(ui.err_generic)
      }
      return
    }

    // If user already confirmed (e.g. from Google), go to dashboard
    if (data.user?.confirmed_at) {
      router.push('/dashboard')
      return
    }

    // Redirect to email verification page
    // NIST IA-5(1): Verify identity before granting access
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </Link>
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem('gw_lang', l.code) }}
              className={`px-2 py-1 rounded text-xs transition-all ${lang === l.code ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25' : 'text-white/30 hover:text-white/60'}`}
              title={l.label}>{l.flag}</button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-5xl tracking-wider text-white mb-2">{ui.title}</h1>
            <p className="text-white/50 font-mono text-sm">{ui.sub}</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">{ui.role_q}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['pro', 'customer'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                    ${role === r
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                      : 'bg-[#131C28] border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${role === r ? 'border-yellow-400 bg-yellow-400' : 'border-white/25'}`}>
                    {role === r && <div className="w-1.5 h-1.5 rounded-full bg-black"/>}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{r === 'pro' ? '🔧' : '🏠'}</div>
                    <div className="text-xs font-mono mt-0.5">{r === 'pro' ? ui.role_pro : ui.role_cust}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google SSO */}
          {/* NIST AC-2: Federated identity via approved provider */}
          <button type="button" onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-60 mb-4">
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"/>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
              </svg>
            )}
            {googleLoading ? '...' : ui.google}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">{ui.or}</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4" autoComplete="on">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.first} <span className="text-yellow-400">*</span></label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                  autoComplete="given-name"
                  className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                  placeholder="John"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.last} <span className="text-yellow-400">*</span></label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                  autoComplete="family-name"
                  className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                  placeholder="Smith"/>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.email} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  autoComplete="email"
                  className={`w-full bg-[#131C28] border rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20
                    ${email.length > 0
                      ? emailValid ? 'border-green-500/40 focus:border-green-500/60' : 'border-red-500/40 focus:border-red-500/60'
                      : 'border-white/8 focus:border-yellow-400/40'}`}
                  placeholder="you@email.com"/>
                {email.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid
                      ? <Check size={14} className="text-green-400"/>
                      : <X size={14} className="text-red-400"/>}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.password} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPwFocused(true)}
                  required
                  autoComplete="new-password"
                  // NIST IA-5: Allow pasting — do not block clipboard
                  className="w-full bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 pr-20 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors"
                  placeholder="Min. 12 characters"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 font-mono text-[9px]">
                  {showPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${strength >= i && strengthConfig ? strengthConfig.color : 'bg-white/10'}`}/>
                    ))}
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${strengthConfig?.color.replace('bg-', 'text-') || 'text-white/30'}`}>
                    {ui[strengthConfig?.textKey as keyof typeof ui] || ''}
                  </span>
                </div>
              )}
            </div>

            {/* NIST Password Requirements Panel */}
            {/* NIST SP 800-63B Section 5.1.1 — Memorized Secret Authenticators */}
            {(pwFocused || password.length > 0) && (
              <div className="bg-[#0C1520] border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={13} className="text-yellow-400"/>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-yellow-400/80">{ui.pw_title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {pwResults.map(({ key, labelKey, passed }) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${passed ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5 border border-white/15'}`}>
                        {passed
                          ? <Check size={9} className="text-green-400"/>
                          : <div className="w-1 h-1 rounded-full bg-white/20"/>}
                      </div>
                      <span className={`font-mono text-[11px] transition-colors duration-200 ${passed ? 'text-green-400' : 'text-white/40'}`}>
                        {ui[labelKey as keyof typeof ui]}
                      </span>
                    </div>
                  ))}
                  {/* Confirm match shown when confirm has input */}
                  {confirm.length > 0 && (
                    <div className="flex items-center gap-2.5 mt-1 pt-1 border-t border-white/6">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${confirmPassed ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/10 border border-red-500/20'}`}>
                        {confirmPassed ? <Check size={9} className="text-green-400"/> : <X size={9} className="text-red-400"/>}
                      </div>
                      <span className={`font-mono text-[11px] ${confirmPassed ? 'text-green-400' : 'text-red-400'}`}>
                        {ui.pw_match}
                      </span>
                    </div>
                  )}
                </div>
                {/* NIST citation */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/6">
                  <AlertCircle size={10} className="text-white/20 flex-shrink-0"/>
                  <span className="font-mono text-[9px] text-white/20">{ui.nist_note}</span>
                </div>
              </div>
            )}

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.confirm} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`w-full bg-[#131C28] border rounded-lg px-4 py-3 pr-12 text-white text-sm outline-none transition-colors
                    ${confirm.length > 0
                      ? confirmPassed ? 'border-green-500/40' : 'border-red-500/40'
                      : 'border-white/8 focus:border-yellow-400/40'}`}
                  placeholder="••••••••••••"/>
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showConfirm ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>
            </div>

            {/* Terms agreement */}
            <div className="flex items-start gap-3 mt-1">
              <button type="button" onClick={() => setAgreedTerms(!agreedTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                  ${agreedTerms ? 'bg-yellow-400 border-yellow-400' : 'border-white/25 bg-transparent hover:border-white/50'}`}>
                {agreedTerms && <Check size={11} className="text-black"/>}
              </button>
              <p className="text-white/35 text-xs font-mono leading-relaxed">
                {ui.terms_pre}{' '}
                <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.terms}</Link>
                {' '}{ui.and}{' '}
                <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.privacy}</Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0"/>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit"
              disabled={loading || !allPwPassed || !confirmPassed || !emailValid || !agreedTerms}
              className="bg-yellow-400 text-black font-display text-xl tracking-widest py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1">
              {loading ? ui.creating : ui.create}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-white/30 text-sm mt-6 font-mono">
            {ui.have_account}{' '}
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.signin}</Link>
          </p>

        </div>
      </div>
    </div>
  )
}

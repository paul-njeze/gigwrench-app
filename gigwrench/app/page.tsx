'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGES, type Language } from '@/lib/lang'
import { useRouter } from 'next/navigation'

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const LT: Record<Language, {
  eyebrow: string; h1: string[]; sub: string; cta: string; navCta: string;
  feat1: string; feat2: string; feat3: string; feat4: string;
  pricing: string; faq: string; appStore: string;
}> = {
  en: {
    eyebrow: 'Built for every tradesperson on the planet',
    h1: ['Schedule.', 'Invoice.', 'Track. Get Paid.'],
    sub: 'GigWrench is the all-in-one AI business platform built for every tradesperson — plumbers, electricians, HVAC techs, carpenters, roofers, and more. No language barriers. No paperwork. No chasing payments. Just you, your tools, and your business running itself.',
    cta: 'Get Started Free', navCta: 'Sign Up',
    feat1: 'Smart Dispatch', feat2: 'Instant Invoicing', feat3: 'Customer Tracking', feat4: 'Find-A-Pro',
    pricing: 'Simple. Honest. Pricing.', faq: 'Frequently Asked Questions', appStore: 'Get the App',
  },
  es: {
    eyebrow: 'Hecho para cada profesional del planeta',
    h1: ['Agenda.', 'Factura.', 'Rastrea. Cobra.'],
    sub: 'GigWrench es la plataforma de negocios con IA todo en uno para profesionales del oficio — plomeros, electricistas, técnicos de HVAC, carpinteros, techadores y más.',
    cta: 'Comenzar Gratis', navCta: 'Registrarse',
    feat1: 'Despacho Inteligente', feat2: 'Facturación Instantánea', feat3: 'Seguimiento de Clientes', feat4: 'Encuentra un Pro',
    pricing: 'Precios Simples y Honestos', faq: 'Preguntas Frecuentes', appStore: 'Obtener la App',
  },
  pt: {
    eyebrow: 'Construído para cada profissional no planeta',
    h1: ['Agende.', 'Fature.', 'Rastreie. Receba.'],
    sub: 'GigWrench é a plataforma de negócios com IA tudo-em-um para profissionais de ofício — encanadores, eletricistas, técnicos de HVAC, carpinteiros, telhadores e mais.',
    cta: 'Começar Grátis', navCta: 'Cadastre-se',
    feat1: 'Despacho Inteligente', feat2: 'Faturação Instantânea', feat3: 'Rastreio de Clientes', feat4: 'Encontrar um Pro',
    pricing: 'Preços Simples e Honestos', faq: 'Perguntas Frequentes', appStore: 'Obter o App',
  },
  fr: {
    eyebrow: 'Conçu pour chaque artisan sur la planète',
    h1: ['Planifiez.', 'Facturez.', 'Suivez. Soyez payé.'],
    sub: 'GigWrench est la plateforme tout-en-un avec IA pour les artisans — plombiers, électriciens, techniciens CVC, charpentiers, couvreurs et plus encore.',
    cta: 'Commencer Gratuitement', navCta: "S'inscrire",
    feat1: 'Dispatch Intelligent', feat2: 'Facturation Instantanée', feat3: 'Suivi Client', feat4: 'Trouver un Pro',
    pricing: 'Prix Simples et Honnêtes', faq: 'Questions Fréquentes', appStore: "Obtenir l'App",
  },
  pl: {
    eyebrow: 'Zbudowane dla każdego rzemieślnika na świecie',
    h1: ['Zaplanuj.', 'Fakturuj.', 'Śledź. Zarabiaj.'],
    sub: 'GigWrench to kompleksowa platforma AI dla rzemieślników — hydraulicy, elektrycy, technicy HVAC, cieśle, dekarze i nie tylko.',
    cta: 'Zacznij za Darmo', navCta: 'Zarejestruj się',
    feat1: 'Inteligentna Dyspozytornia', feat2: 'Natychmiastowe Fakturowanie', feat3: 'Śledzenie Klientów', feat4: 'Znajdź Pro',
    pricing: 'Proste i Uczciwe Ceny', faq: 'Często Zadawane Pytania', appStore: 'Pobierz Aplikację',
  },
  tl: {
    eyebrow: 'Ginawa para sa bawat manggagawa sa buong mundo',
    h1: ['Mag-iskedyul.', 'Mag-invoice.', 'Subaybayan. Kumita.'],
    sub: 'Ang GigWrench ay all-in-one AI business platform para sa mga manggagawa — mga plomero, electrician, HVAC tech, karpintero, roofer at marami pa.',
    cta: 'Magsimula nang Libre', navCta: 'Mag-sign Up',
    feat1: 'Matalinong Dispatch', feat2: 'Instant na Invoice', feat3: 'Pagsubaybay sa Customer', feat4: 'Hanapin ang Pro',
    pricing: 'Simple at Tapat na Presyo', faq: 'Mga Madalas na Tanong', appStore: 'I-download ang App',
  },
  ar: {
    eyebrow: 'مبني لكل حرفي على هذا الكوكب',
    h1: ['جدولة.', 'فوترة.', 'تتبع. احصل على المال.'],
    sub: 'GigWrench هو منصة الأعمال الشاملة بالذكاء الاصطناعي للحرفيين — السباكين وعمال الكهرباء وتقنيي HVAC والنجارين وعمال الأسقف وغيرهم.',
    cta: 'ابدأ مجاناً', navCta: 'إنشاء حساب',
    feat1: 'التوزيع الذكي', feat2: 'الفوترة الفورية', feat3: 'تتبع العملاء', feat4: 'ابحث عن محترف',
    pricing: 'أسعار بسيطة وصادقة', faq: 'الأسئلة الشائعة', appStore: 'احصل على التطبيق',
  },
  ru: {
    eyebrow: 'Создано для каждого мастера на планете',
    h1: ['Планируй.', 'Выставляй счета.', 'Отслеживай. Зарабатывай.'],
    sub: 'GigWrench — это комплексная AI-платформа для мастеров — сантехников, электриков, HVAC-техников, плотников, кровельщиков и других.',
    cta: 'Начать бесплатно', navCta: 'Зарегистрироваться',
    feat1: 'Умная диспетчеризация', feat2: 'Мгновенное выставление счетов', feat3: 'Отслеживание клиентов', feat4: 'Найти мастера',
    pricing: 'Простые и честные цены', faq: 'Часто задаваемые вопросы', appStore: 'Получить приложение',
  },
  zh: {
    eyebrow: '专为全球每位技工打造',
    h1: ['排程。', '开票。', '追踪。收款。'],
    sub: 'GigWrench 是专为技工打造的全能 AI 商业平台 — 水管工、电工、暖通技术员、木工、屋顶工等，无需语言障碍。',
    cta: '免费开始', navCta: '注册',
    feat1: '智能调度', feat2: '即时开票', feat3: '客户追踪', feat4: '找专业人员',
    pricing: '简单透明的定价', faq: '常见问题', appStore: '下载应用',
  },
  hi: {
    eyebrow: 'दुनिया के हर कारीगर के लिए बनाया गया',
    h1: ['शेड्यूल करें।', 'इनवॉइस करें।', 'ट्रैक करें। भुगतान पाएं।'],
    sub: 'GigWrench प्रत्येक कारीगर के लिए ऑल-इन-वन AI बिजनेस प्लेटफॉर्म है — प्लंबर, इलेक्ट्रीशियन, HVAC तकनीशियन, बढ़ई, छत वाले और बहुत कुछ।',
    cta: 'मुफ्त शुरू करें', navCta: 'साइन अप करें',
    feat1: 'स्मार्ट डिस्पैच', feat2: 'तत्काल इनवॉइसिंग', feat3: 'ग्राहक ट्रैकिंग', feat4: 'प्रो खोजें',
    pricing: 'सरल और ईमानदार मूल्य निर्धारण', faq: 'अक्सर पूछे जाने वाले प्रश्न', appStore: 'ऐप प्राप्त करें',
  },
}

// ── LANGUAGE PICKER ────────────────────────────────────────────────────────────
function LangPicker({ onSelect }: { onSelect: (lang: Language) => void }) {
  const [pct, setPct] = useState(100)
  const startRef = useRef<number | null>(null)
  const DURATION = 6000
  const RADIUS = 22
  const CIRC = 2 * Math.PI * RADIUS

  useEffect(() => {
    let raf: number
    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const remaining = Math.max(0, 1 - elapsed / DURATION)
      setPct(remaining * 100)
      if (remaining > 0) {
        raf = requestAnimationFrame(tick)
      } else {
        onSelect('en')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onSelect])

  const dash = (pct / 100) * CIRC

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#0B0F17] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="#ffffff18" strokeWidth="3"/>
            <circle
              cx="28" cy="28" r={RADIUS} fill="none"
              stroke="#E8B84B" strokeWidth="3"
              strokeDasharray={`${dash} ${CIRC}`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400 mb-5">Choose your language</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, info]) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:border-yellow-500/50 hover:bg-white/5 transition text-sm text-left"
            >
              <span>{info.flag}</span>
              <span className="text-gray-200">{info.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    // Check auth — redirect logged-in users
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/dashboard')
    })

    // Show language picker unless already chosen
    const stored = localStorage.getItem('gw_lang') as Language | null
    if (stored && stored in LANGUAGES) {
      setLang(stored)
    } else {
      const t = setTimeout(() => setShowPicker(true), 300)
      return () => clearTimeout(t)
    }
  }, [router])

  const handleLangSelect = (l: Language) => {
    setLang(l)
    setShowPicker(false)
    localStorage.setItem('gw_lang', l)
  }

  const t = LT[lang]
  const isRtl = LANGUAGES[lang].dir === 'rtl'

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0B0F17] text-white font-sans">
      {showPicker && <LangPicker onSelect={handleLangSelect} />}

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#0B0F17]/90 backdrop-blur border-b border-white/6">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-xl">GigWrench</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
            >
              {t.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <p className="text-yellow-400 text-sm font-medium uppercase tracking-widest mb-4">{t.eyebrow}</p>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          {t.h1.map((line, i) => (
            <span key={i} className={i === t.h1.length - 1 ? 'text-yellow-400' : ''}>{line}{' '}</span>
          ))}
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">{t.sub}</p>
        <Link
          href="/signup"
          className="inline-block bg-yellow-400 text-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-yellow-300 transition shadow-lg"
        >
          {t.cta}
        </Link>
        <p className="text-xs text-gray-500 mt-4">Free to join · No credit card · 3 months Pro free for early members</p>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t.feat1, icon: '📅', desc: 'AI schedules jobs, texts customers, and keeps your calendar full automatically.' },
            { title: t.feat2, icon: '📄', desc: 'Create and send professional invoices in seconds. Get paid faster, stress less.' },
            { title: t.feat3, icon: '📍', desc: 'Customers track you in real-time in their own language. No calls needed.' },
            { title: t.feat4, icon: '🔍', desc: 'Get discovered by customers near you and build your reputation automatically.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-yellow-400/30 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">GigWrench vs. The Rest</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-6 text-gray-400">Feature</th>
                <th className="py-3 px-4 text-yellow-400 font-bold">GigWrench</th>
                <th className="py-3 px-4 text-gray-500">Others</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Multi-language support', true, false],
                ['AI-powered dispatch', true, false],
                ['Real-time customer tracking', true, false],
                ['Built-in Find-A-Pro marketplace', true, false],
                ['Mobile-first design', true, true],
                ['Invoice & payment collection', true, true],
              ].map(([feature, gw, other]) => (
                <tr key={feature as string} className="border-b border-white/5">
                  <td className="py-3 pr-6 text-gray-300">{feature as string}</td>
                  <td className="py-3 px-4 text-center">{gw ? '✅' : '❌'}</td>
                  <td className="py-3 px-4 text-center">{other ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-4">{t.pricing}</h2>
        <p className="text-gray-400 mb-10">One plan. Everything included. Cancel anytime.</p>
        <div className="inline-block bg-white/5 border border-yellow-400/30 rounded-2xl p-8">
          <p className="text-5xl font-black text-yellow-400 mb-2">$29<span className="text-xl text-gray-400">/mo</span></p>
          <p className="text-gray-300 mb-6">Everything you need to run your trade business</p>
          <Link href="/signup" className="block bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-300 transition">
            {t.cta}
          </Link>
          <p className="text-xs text-gray-500 mt-4">3 months free for early members</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">{t.faq}</h2>
        <div className="space-y-4">
          {[
            { q: 'Does GigWrench work in my language?', a: 'Yes! GigWrench supports 10 languages including English, Spanish, French, Portuguese, Polish, Tagalog, Arabic, Russian, Chinese, and Hindi.' },
            { q: 'Is there a free trial?', a: 'Yes — join for free and get 3 months of Pro access. No credit card required to start.' },
            { q: 'What trades does GigWrench support?', a: 'Any trade! Plumbers, electricians, HVAC, carpentry, roofing, painting, and more. If you go to job sites, GigWrench was built for you.' },
            { q: 'Do my customers need to download anything?', a: 'No! Your customers track your arrival and receive invoices via a simple web link. No app download needed.' },
            { q: 'How does the AI dispatch work?', a: 'GigWrench AI reads your calendar, learns your service area, and automatically schedules, confirms, and reminds — saving you hours every week.' },
          ].map((item) => (
            <details key={item.q} className="bg-white/5 border border-white/8 rounded-xl p-5 group cursor-pointer">
              <summary className="font-semibold text-gray-100 list-none flex justify-between items-center">
                {item.q}
                <span className="text-yellow-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-400 text-sm mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── APP STORE ── */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-black mb-4">{t.appStore}</h2>
        <p className="text-gray-400 mb-8">Available on iOS and Android</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://apps.apple.com/app/gigwrench/id1234567890" className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-6 py-3 hover:bg-white/15 transition">
            <span className="text-2xl">🍎</span>
            <div className="text-left">
              <p className="text-xs text-gray-400">Download on the</p>
              <p className="font-bold">App Store</p>
            </div>
          </a>
          <a href="https://play.google.com/store/apps/details?id=app.gigwrench" className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-6 py-3 hover:bg-white/15 transition">
            <span className="text-2xl">▶</span>
            <div className="text-left">
              <p className="text-xs text-gray-400">Get it on</p>
              <p className="font-bold">Google Play</p>
            </div>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/6 py-8 px-4 text-center text-gray-500 text-sm">
        <p>© 2026 GigWrench. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/login" className="hover:text-gray-300 transition">Sign In</Link>
          <Link href="/signup" className="hover:text-gray-300 transition">Sign Up</Link>
        </div>
      </footer>
    </div>
  )
}

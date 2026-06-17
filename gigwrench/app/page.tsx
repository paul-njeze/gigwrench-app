'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap, MapPin, Camera, MessageSquare, FileText, Users,
  BarChart2, Globe, Shield, ChevronDown, ChevronUp,
  Check, X, Star, Clock, DollarSign, Smartphone
} from 'lucide-react'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ko', label: '한국어' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ro', label: 'Română' },
  { code: 'sv', label: 'Svenska' },
]

const COPY: Record<string, Record<string, string>> = {
  en: {
    pick_lang: 'Choose your language',
    pick_sub: 'GigWrench is available in 14 languages for Pros and customers worldwide.',
    skip: 'Continue in English',
    nav_signin: 'Sign In',
    nav_cta: 'Get Started Free',
    hero_h1_a: 'Run Your Trade',
    hero_h1_b: 'Like a Pro.',
    hero_sub: 'GigWrench gives solo Pros the AI-powered tools to win more jobs, get paid faster, and never miss a lead. Just $19 a month.',
    hero_cta1: 'Get Started Free',
    hero_cta2: 'See how it works',
    problem_label: 'The Problem',
    problem_h2: 'Running a solo trade business is brutal.',
    problem_body: 'You answer calls while under a sink. You chase payments for weeks. You lose leads because you were on a job. You write invoices by hand. You have no idea which customers are coming back. GigWrench fixes all of it.',
    feat_label: 'Features',
    feat_h2: 'Everything a Pro needs. Nothing they do not.',
    compare_label: 'Comparison',
    compare_h2: 'Why Pros choose GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Questions answered.',
    faq_pro: 'For Pros',
    faq_cust: 'For Customers',
    app_label: 'Mobile App',
    app_h2: 'Take GigWrench everywhere.',
    app_sub: 'Native apps for Android and iOS are on the way. Sign up on the web now and get early access when they launch.',
    app_android: 'Coming to Google Play',
    app_ios: 'Coming to App Store',
    app_beta: 'Join the beta on web now',
    footer_tagline: 'Built for Pros. Powered by AI.',
    footer_copy: '2026 GigWrench. All rights reserved.',
    beta_pill: 'Beta now live',
    stat_lead: 'Lead response', stat_flat: 'Flat rate, no fees', stat_langs: 'Languages', stat_id: 'ID verified Pros', stat_pros: 'US solo Pros',
    table_feature: 'Feature', coming_soon: 'Coming soon',
    footer_signup: 'Sign Up', footer_terms: 'Terms', footer_privacy: 'Privacy', footer_contact: 'Contact',
  },
  es: {
    pick_lang: 'Elige tu idioma',
    pick_sub: 'GigWrench esta disponible en 14 idiomas para Pros y clientes de todo el mundo.',
    skip: 'Continuar en ingles',
    nav_signin: 'Iniciar sesion',
    nav_cta: 'Empieza gratis',
    hero_h1_a: 'Maneja tu oficio',
    hero_h1_b: 'como un Pro.',
    hero_sub: 'GigWrench da a los Pros independientes las herramientas de IA para ganar mas trabajos, cobrar mas rapido y nunca perder un cliente. Todo por $19 al mes.',
    hero_cta1: 'Empieza gratis',
    hero_cta2: 'Ver como funciona',
    problem_label: 'El problema',
    problem_h2: 'Ser autonomo en los oficios es duro.',
    problem_body: 'Contestas llamadas mientras trabajas. Cobras tarde. Pierdes clientes cuando estas ocupado. Facturas a mano. GigWrench lo resuelve todo.',
    feat_label: 'Funciones',
    feat_h2: 'Todo lo que un Pro necesita.',
    compare_label: 'Comparacion',
    compare_h2: 'Por que los Pros eligen GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Tus preguntas respondidas.',
    faq_pro: 'Para Pros',
    faq_cust: 'Para clientes',
    app_label: 'App movil',
    app_h2: 'Lleva GigWrench contigo.',
    app_sub: 'Las apps nativas para Android e iOS estan en camino. Registrate en la web ahora.',
    app_android: 'Proximamente en Google Play',
    app_ios: 'Proximamente en App Store',
    app_beta: 'Unete a la beta en la web',
    footer_tagline: 'Hecho para Pros. Impulsado por IA.',
    footer_copy: '2026 GigWrench. Todos los derechos reservados.',
    beta_pill: 'Beta ya disponible',
    stat_lead: 'Respuesta a leads', stat_flat: 'Tarifa fija, sin comisiones', stat_langs: 'Idiomas', stat_id: 'Pros verificados', stat_pros: 'Pros independientes en EEUU',
    table_feature: 'Caracteristica', coming_soon: 'Proximamente',
    footer_signup: 'Registrarse', footer_terms: 'Terminos', footer_privacy: 'Privacidad', footer_contact: 'Contacto',
  },
}

export default function LandingPage() {
  const [lang, setLang] = useState('en')
  const [showPicker, setShowPicker] = useState(false)
  const [faqTab, setFaqTab] = useState<'pro' | 'cust'>('pro')
  const c = { ...COPY.en, ...(COPY[lang] || {}) }
  const isRtl = lang === 'ar'

  useEffect(() => {
    const saved = localStorage.getItem('gw_lang')
    const pickerShown = localStorage.getItem('gw_picker_shown')
    if (saved && COPY[saved]) {
      setLang(saved)
    }
    if (!pickerShown) {
      const t = setTimeout(() => setShowPicker(true), 300)
      return () => clearTimeout(t)
    }
  }, [])

  function handleLangSelect(code: string) {
    setLang(code)
    setShowPicker(false)
    localStorage.setItem('gw_lang', code)
    localStorage.setItem('gw_picker_shown', '1')
    window.dispatchEvent(new CustomEvent('gw-lang-change', { detail: code }))
  }

  const signupHref = `/signup?lang=${lang}`

  return (
    <div className="min-h-screen bg-gw-bg text-gw-text" dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5" style={{ background: 'rgba(7,9,13,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="font-mono font-bold text-xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="font-mono text-sm text-white/50 hover:text-white transition-colors no-underline hidden sm:block">{c.nav_signin}</Link>
          <Link href={signupHref} className="bg-yellow-400 text-black font-mono font-bold text-xs tracking-widest px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors no-underline uppercase">{c.nav_cta}</Link>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-yellow-400/8 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
          <span className="font-mono text-xs text-yellow-400 tracking-wider uppercase">{c.beta_pill}</span>
        </div>
        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl text-white leading-none tracking-wide mb-6">
          {c.hero_h1_a}<br/>
          <span className="text-yellow-400">{c.hero_h1_b}</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-10">{c.hero_sub}</p>
        <div className="flex flex-wrap gap-4 mb-16">
          <Link href={signupHref} className="bg-yellow-400 text-black font-mono font-bold text-sm tracking-widest px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors no-underline uppercase inline-flex items-center gap-2">
            {c.hero_cta1}
          </Link>
          <a href="#features" className="border border-white/15 text-white/70 font-mono text-sm px-8 py-4 rounded-2xl hover:border-white/30 hover:text-white transition-colors no-underline">
            {c.hero_cta2}
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { icon: Clock, val: '<90s', label: c.stat_lead },
            { icon: DollarSign, val: '$19/mo', label: c.stat_flat },
            { icon: Globe, val: '14', label: c.stat_langs },
            { icon: Shield, val: '100%', label: c.stat_id },
            { icon: Star, val: '40M+', label: c.stat_pros },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-2xl px-4 py-2.5">
              <Icon size={14} className="text-yellow-400 flex-shrink-0"/>
              <span className="font-mono font-bold text-sm text-white">{val}</span>
              <span className="font-mono text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.problem_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-6 leading-tight">{c.problem_h2}</h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-3xl">{c.problem_body}</p>
        </div>
      </section>

      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.feat_label}</span>
        <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-14 leading-tight">{c.feat_h2}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Dispatch AI Booking</h3>
            <p className="text-white/40 text-xs leading-relaxed">Responds to new leads in under 90 seconds while you are on a job.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">GigWrench Lens</h3>
            <p className="text-white/40 text-xs leading-relaxed">Point your camera at any part for instant identification.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Live GPS Tracking</h3>
            <p className="text-white/40 text-xs leading-relaxed">Customers see exactly where you are and when you will arrive.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Smart Invoicing</h3>
            <p className="text-white/40 text-xs leading-relaxed">Create invoices and send a Stripe payment link in under a minute.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Customer CRM</h3>
            <p className="text-white/40 text-xs leading-relaxed">Every customer, every job, every note in one place.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Loyalty Engine</h3>
            <p className="text-white/40 text-xs leading-relaxed">Automatically reaches out to past customers. Keeps your calendar full.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">14 Languages</h3>
            <p className="text-white/40 text-xs leading-relaxed">Available in English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian, and Swedish.</p>
          </div>
          <div className="bg-gw-bg2 border border-white/6 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-sm text-white mb-2">Analytics Dashboard</h3>
            <p className="text-white/40 text-xs leading-relaxed">Revenue trends, job stats, customer breakdown at a glance.</p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.compare_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-14 leading-tight">{c.compare_h2}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-4 font-mono text-xs text-white/30 uppercase tracking-widest w-[30%]">{c.table_feature}</th>
                  <th className="px-6 py-4 font-mono text-xs tracking-widest text-center"><span className="text-yellow-400 font-bold">GigWrench</span><div className="text-white/20 text-[10px] font-normal mt-0.5">$19/mo</div></th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">Thumbtack<div className="text-white/20 text-[10px] font-normal mt-0.5">$300-500/mo</div></th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">Angi<div className="text-white/20 text-[10px] font-normal mt-0.5">$300+/mo</div></th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">Housecall Pro<div className="text-white/20 text-[10px] font-normal mt-0.5">$149+/mo</div></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: c.table_feature === 'Feature' ? 'Monthly price' : 'Precio mensual', gw: '$19 flat', thumb: '$300-500', angi: '$300+', hcp: '$149+' },
                  { feature: 'AI booking agent', gw: true, thumb: false, angi: false, hcp: false },
                  { feature: 'Live GPS tracking', gw: true, thumb: false, angi: false, hcp: 'Add-on' },
                  { feature: 'Invoicing built in', gw: true, thumb: false, angi: false, hcp: true },
                  { feature: '14 languages', gw: true, thumb: false, angi: false, hcp: false },
                  { feature: 'ID verification', gw: true, thumb: false, angi: false, hcp: false },
                  { feature: 'Setup fee', gw: 'None', thumb: 'None', angi: 'None', hcp: 'None' },
                ].map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? 'bg-white/1' : ''}`}>
                    <td className="px-6 py-4 font-mono text-xs text-white/60">{row.feature}</td>
                    {[row.gw, row.thumb, row.angi, row.hcp].map((val, ci) => (
                      <td key={ci} className={`px-6 py-4 text-center ${ci === 0 ? 'bg-yellow-400/3' : ''}`}>
                        {typeof val === 'boolean' ? (
                          val ? <Check size={16} className="text-green-400 mx-auto"/> : <X size={16} className="text-white/15 mx-auto"/>
                        ) : (
                          <span className={`font-mono text-xs ${ci === 0 ? 'text-yellow-400 font-bold' : 'text-white/40'}`}>{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.faq_label}</span>
        <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-10 leading-tight">{c.faq_h2}</h2>
        <div className="flex gap-2 mb-10">
          {(['pro', 'cust'] as const).map(tab => (
            <button key={tab} onClick={() => setFaqTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider uppercase transition-all ${faqTab === tab ? 'bg-yellow-400 text-black font-bold' : 'border border-white/10 text-white/40 hover:text-white/70'}`}>
              {tab === 'pro' ? c.faq_pro : c.faq_cust}
            </button>
          ))}
        </div>
        <div className="max-w-3xl">
          {faqTab === 'pro' ? (
            <>
              <div className="border-b border-white/6 py-5"><p className="text-white text-sm">How much does GigWrench cost?</p><p className="text-white/50 text-sm mt-2">$19 per month, flat. No lead fees, no commissions, no hidden charges.</p></div>
              <div className="border-b border-white/6 py-5"><p className="text-white text-sm">What is GigWrench Lens?</p><p className="text-white/50 text-sm mt-2">Lens uses your phone camera and AI to identify any part instantly.</p></div>
              <div className="py-5"><p className="text-white text-sm">What languages is GigWrench available in?</p><p className="text-white/50 text-sm mt-2">English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian, and Swedish. All 14 languages.</p></div>
            </>
          ) : (
            <>
              <div className="border-b border-white/6 py-5"><p className="text-white text-sm">Are Pros on GigWrench verified?</p><p className="text-white/50 text-sm mt-2">Yes. Pros go through government ID verification and selfie liveness checks.</p></div>
              <div className="py-5"><p className="text-white text-sm">Is my payment safe?</p><p className="text-white/50 text-sm mt-2">Yes. All payments are processed through Stripe. GigWrench never stores your card details.</p></div>
            </>
          )}
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.app_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-4 leading-tight">{c.app_h2}</h2>
          <p className="text-white/40 text-base font-mono mb-12 max-w-xl mx-auto leading-relaxed">{c.app_sub}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 opacity-60 cursor-not-allowed select-none">
              <Smartphone size={20} className="text-white/40"/>
              <div className="text-left">
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{c.coming_soon}</div>
                <div className="font-mono text-sm text-white/60 font-bold">{c.app_android}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 opacity-60 cursor-not-allowed select-none">
              <Smartphone size={20} className="text-white/40"/>
              <div className="text-left">
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{c.coming_soon}</div>
                <div className="font-mono text-sm text-white/60 font-bold">{c.app_ios}</div>
              </div>
            </div>
          </div>
          <Link href={signupHref} className="inline-flex items-center gap-2 bg-yellow-400 text-black font-mono font-bold text-sm tracking-widest px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors no-underline uppercase">
            {c.app_beta}
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-mono font-bold text-base tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></div>
            <div className="font-mono text-[10px] text-white/25 tracking-wider">{c.footer_tagline}</div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href={signupHref} className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{c.footer_signup}</Link>
            <Link href="/login" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{c.nav_signin}</Link>
            <Link href="/terms" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{c.footer_terms}</Link>
            <Link href="/privacy" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{c.footer_privacy}</Link>
            <a href="mailto:paul@gigwrench.app" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">{c.footer_contact}</a>
          </div>
          <div className="font-mono text-[10px] text-white/20">{c.footer_copy}</div>
        </div>
      </footer>
    </div>
  )
}

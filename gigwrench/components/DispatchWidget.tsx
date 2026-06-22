'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, ChevronDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

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

const UI: Record<string, Record<string, string>> = {
  en: { online: 'Dispatch is online', pick: 'Choose your language', greeting: "Hey there! I'm Dispatch, your GigWrench coordinator. How can I help you today?", placeholder: 'Type your message...', send: 'Send', escalate_prompt: 'To connect you with our team, can I get your name and email?', name_ph: 'Your name', email_ph: 'Your email address', submit: 'Send to support', escalate_done: 'Done. Our team will follow up at your email within a few hours. Is there anything else I can help you with?', powered: 'Powered by GigWrench', change_lang: 'Change language' },
  es: { online: 'Dispatch está en línea', pick: 'Elige tu idioma', greeting: 'Hola! Soy Dispatch, tu coordinador de GigWrench. Como puedo ayudarte hoy?', placeholder: 'Escribe tu mensaje...', send: 'Enviar', escalate_prompt: 'Para conectarte con nuestro equipo, me puedes dar tu nombre y correo?', name_ph: 'Tu nombre', email_ph: 'Tu correo electronico', submit: 'Enviar al soporte', escalate_done: 'Listo. Nuestro equipo te respondera en unas horas. Hay algo mas en que pueda ayudarte?', powered: 'Con tecnologia de GigWrench', change_lang: 'Cambiar idioma' },
  pt: { online: 'Dispatch está online', pick: 'Escolha seu idioma', greeting: 'Ola! Sou o Dispatch, seu coordenador GigWrench. Como posso ajudar hoje?', placeholder: 'Digite sua mensagem...', send: 'Enviar', escalate_prompt: 'Para conectar voce com nossa equipe, pode me dar seu nome e email?', name_ph: 'Seu nome', email_ph: 'Seu email', submit: 'Enviar ao suporte', escalate_done: 'Pronto. Nossa equipe vai responder em algumas horas. Posso ajudar com mais alguma coisa?', powered: 'Desenvolvido por GigWrench', change_lang: 'Mudar idioma' },
  fr: { online: 'Dispatch est en ligne', pick: 'Choisissez votre langue', greeting: 'Salut! Je suis Dispatch, votre coordinateur GigWrench. Comment puis-je vous aider?', placeholder: 'Tapez votre message...', send: 'Envoyer', escalate_prompt: 'Pour vous mettre en contact avec notre equipe, pouvez-vous me donner votre nom et email?', name_ph: 'Votre nom', email_ph: 'Votre adresse email', submit: 'Envoyer au support', escalate_done: 'Fait. Notre equipe reviendra vers vous dans quelques heures. Puis-je vous aider avec autre chose?', powered: 'Propulse par GigWrench', change_lang: 'Changer de langue' },
  ar: { online: 'Dispatch متصل', pick: 'اختر لغتك', greeting: 'مرحبا! انا Dispatch، منسق GigWrench. كيف يمكنني مساعدتك اليوم؟', placeholder: 'اكتب رسالتك...', send: 'ارسال', escalate_prompt: 'للتواصل مع فريقنا، هل يمكنك اعطائي اسمك وبريدك الالكتروني؟', name_ph: 'اسمك', email_ph: 'بريدك الالكتروني', submit: 'ارسال للدعم', escalate_done: 'تم. سيتابع فريقنا معك خلال ساعات. هل هناك شيء اخر يمكنني مساعدتك به؟', powered: 'مدعوم من GigWrench', change_lang: 'تغيير اللغة' },
  zh: { online: 'Dispatch 在线', pick: '选择您的语言', greeting: '您好！我是 Dispatch，您的 GigWrench 协调员。今天有什么可以帮您的？', placeholder: '输入您的消息...', send: '发送', escalate_prompt: '为了帮您联系我们的团队，能告诉我您的姓名和电子邮件吗？', name_ph: '您的姓名', email_ph: '您的电子邮件', submit: '发送给支持团队', escalate_done: '好的。我们的团队将在几小时内通过邮件跟进。还有其他可以帮助您的吗？', powered: 'GigWrench 提供支持', change_lang: '更换语言' },
  hi: { online: 'Dispatch ऑनलाइन है', pick: 'अपनी भाषा चुनें', greeting: 'नमस्ते! मैं Dispatch हूं, आपका GigWrench समन्वयक। आज मैं आपकी कैसे मदद कर सकता हूं?', placeholder: 'अपना संदेश लिखें...', send: 'भेजें', escalate_prompt: 'आपको हमारी टीम से जोड़ने के लिए, क्या आप अपना नाम और ईमेल दे सकते हैं?', name_ph: 'आपका नाम', email_ph: 'आपका ईमेल पता', submit: 'सहायता को भेजें', escalate_done: 'हो गया। हमारी टीम कुछ घंटों में आपके ईमेल पर फॉलो अप करेगी। क्या और कोई मदद चाहिए?', powered: 'GigWrench द्वारा संचालित', change_lang: 'भाषा बदलें' },
  ko: { online: 'Dispatch 온라인', pick: '언어를 선택하세요', greeting: '안녕하세요! 저는 Dispatch, GigWrench 담당자입니다. 오늘 어떻게 도와드릴까요?', placeholder: '메시지를 입력하세요...', send: '보내기', escalate_prompt: '팀과 연결하기 위해 이름과 이메일을 알려주시겠어요?', name_ph: '성함', email_ph: '이메일 주소', submit: '지원팀에 보내기', escalate_done: '완료되었습니다. 팀이 몇 시간 내에 이메일로 연락드릴 것입니다. 다른 도움이 필요하신가요?', powered: 'GigWrench 제공', change_lang: '언어 변경' },
  tr: { online: 'Dispatch çevrimiçi', pick: 'Dilinizi seçin', greeting: 'Merhaba! Ben Dispatch, GigWrench koordinatörünüzüm. Bugün size nasıl yardımcı olabilirim?', placeholder: 'Mesajınızı yazın...', send: 'Gönder', escalate_prompt: 'Sizi ekibimizle buluşturmak için adınızı ve e-postanızı alabilir miyim?', name_ph: 'Adınız', email_ph: 'E-posta adresiniz', submit: 'Desteğe gönder', escalate_done: 'Tamam. Ekibimiz birkaç saat içinde e-postanızda takip edecek. Başka yardımcı olabileceğim bir şey var mı?', powered: 'GigWrench tarafından desteklenir', change_lang: 'Dili değiştir' },
  de: { online: 'Dispatch ist online', pick: 'Sprache wählen', greeting: 'Hallo! Ich bin Dispatch, Ihr GigWrench-Koordinator. Wie kann ich Ihnen heute helfen?', placeholder: 'Nachricht eingeben...', send: 'Senden', escalate_prompt: 'Um Sie mit unserem Team zu verbinden, darf ich Ihren Namen und Ihre E-Mail haben?', name_ph: 'Ihr Name', email_ph: 'Ihre E-Mail-Adresse', submit: 'An Support senden', escalate_done: 'Erledigt. Unser Team meldet sich in wenigen Stunden. Kann ich noch mit etwas helfen?', powered: 'Unterstützt von GigWrench', change_lang: 'Sprache ändern' },
  it: { online: 'Dispatch è online', pick: 'Scegli la tua lingua', greeting: 'Ciao! Sono Dispatch, il tuo coordinatore GigWrench. Come posso aiutarti oggi?', placeholder: 'Scrivi il tuo messaggio...', send: 'Invia', escalate_prompt: 'Per metterti in contatto con il nostro team, posso avere il tuo nome e la tua email?', name_ph: 'Il tuo nome', email_ph: 'Il tuo indirizzo email', submit: 'Invia al supporto', escalate_done: "Fatto. Il nostro team ti risponderà entro poche ore. Posso aiutarti con altro?", powered: 'Offerto da GigWrench', change_lang: 'Cambia lingua' },
  nl: { online: 'Dispatch is online', pick: 'Kies uw taal', greeting: 'Hallo! Ik ben Dispatch, uw GigWrench-coördinator. Hoe kan ik u vandaag helpen?', placeholder: 'Typ uw bericht...', send: 'Verzenden', escalate_prompt: 'Om u te verbinden met ons team, mag ik uw naam en e-mail?', name_ph: 'Uw naam', email_ph: 'Uw e-mailadres', submit: 'Naar support sturen', escalate_done: 'Klaar. Ons team neemt binnen een paar uur contact op. Kan ik nog ergens mee helpen?', powered: 'Mogelijk gemaakt door GigWrench', change_lang: 'Taal wijzigen' },
  ro: { online: 'Dispatch este online', pick: 'Alege-ți limba', greeting: 'Bună! Sunt Dispatch, coordonatorul tău GigWrench. Cum te pot ajuta astăzi?', placeholder: 'Scrie mesajul tău...', send: 'Trimite', escalate_prompt: 'Pentru a te conecta cu echipa noastră, îmi poți da numele și emailul?', name_ph: 'Numele tău', email_ph: 'Adresa ta de email', submit: 'Trimite la suport', escalate_done: 'Gata. Echipa noastră va reveni la emailul tău în câteva ore. Te pot ajuta cu altceva?', powered: 'Oferit de GigWrench', change_lang: 'Schimbă limba' },
  sv: { online: 'Dispatch är online', pick: 'Välj ditt språk', greeting: 'Hej! Jag är Dispatch, din GigWrench-koordinator. Hur kan jag hjälpa dig idag?', placeholder: 'Skriv ditt meddelande...', send: 'Skicka', escalate_prompt: 'För att koppla dig till vårt team, kan jag få ditt namn och din e-post?', name_ph: 'Ditt namn', email_ph: 'Din e-postadress', submit: 'Skicka till support', escalate_done: 'Klart. Vårt team återkommer via e-post inom några timmar. Kan jag hjälpa dig med något annat?', powered: 'Drivs av GigWrench', change_lang: 'Byt språk' },
}

type Message = { role: 'user' | 'assistant'; content: string }
type Stage = 'lang' | 'chat' | 'escalate'

export default function DispatchWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('lang')
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalateName, setEscalateName] = useState('')
  const [escalateEmail, setEscalateEmail] = useState('')
  const [escalateLoading, setEscalateLoading] = useState(false)
  const [escalateSummary, setEscalateSummary] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ui = UI[lang] || UI.en
  const isRtl = lang === 'ar'

  useEffect(() => {
    // Read lang from URL param first (set by landing page on signup links)
    const params = new URLSearchParams(window.location.search)
    const urlLang = params.get('lang')
    const saved = localStorage.getItem('gw_lang')
    const code = (urlLang && UI[urlLang]) ? urlLang : (saved && UI[saved]) ? saved : null
    if (code) {
      setLang(code)
      setStage('chat')
      setMessages([{ role: 'assistant', content: (UI[code] || UI.en).greeting }])
      if (urlLang && UI[urlLang]) localStorage.setItem('gw_lang', urlLang)
    }
  }, [])

  // Sync language when the landing page picker (or another tab) changes it after mount
  useEffect(() => {
    function applyLang(code: string) {
      if (!code || !UI[code]) return
      setLang(code)
      setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: (UI[code] || UI.en).greeting }])
      setStage(prev => prev === 'lang' ? 'chat' : prev)
    }
    function onCustom(e: Event) { applyLang((e as CustomEvent).detail as string) }
    function onStorage(e: StorageEvent) { if (e.key === 'gw_lang' && e.newValue) applyLang(e.newValue) }
    window.addEventListener('gw-lang-change', onCustom as EventListener)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('gw-lang-change', onCustom as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (open && stage === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, stage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function selectLang(code: string) {
    setLang(code)
    localStorage.setItem('gw_lang', code)
    const u = UI[code] || UI.en
    setMessages([{ role: 'assistant', content: u.greeting }])
    setStage('chat')
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      } catch {}
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: newMessages, lang }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.escalate) {
        setEscalateSummary(data.escalationSummary || userMsg.content)
        setTimeout(() => setStage('escalate'), 1200)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I hit a snag. Please email us at support@gigwrench.app and we will get back to you shortly.'
      }])
    } finally {
      setLoading(false)
    }
  }

  async function handleEscalate() {
    if (!escalateName.trim()) return
    setEscalateLoading(true)
    try {
      await fetch('/api/support/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: escalateName,
          userEmail: escalateEmail,
          summary: escalateSummary,
          transcript: messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Dispatch'}: ${m.content}`).join('\n'),
        }),
      })
    } catch { /* silent */ }
    setMessages(prev => [...prev, { role: 'assistant', content: ui.escalate_done }])
    setStage('chat')
    setEscalateLoading(false)
    setEscalateName('')
    setEscalateEmail('')
  }

  if (pathname?.startsWith('/track')) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" data-tour="tour-dispatch-widget">
        {!open && (
          <div className="bg-[#0F1520] border border-white/10 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 animate-bounce-subtle">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/>
            <span className="font-mono text-xs text-white/70">{ui.online}</span>
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-300 transition-all shadow-2xl flex items-center justify-center"
          aria-label="Open Dispatch support chat"
        >
          {open
            ? <X size={22} className="text-black"/>
            : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="black"/>
              </svg>
            )
          }
        </button>
      </div>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '520px', background: '#07090D', border: '1px solid rgba(255,255,255,0.08)' }}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6" style={{ background: '#0F1520' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
                </svg>
              </div>
              <div>
                <div className="font-mono font-bold text-sm text-white">Dispatch</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"/>
                  <span className="font-mono text-[10px] text-white/30">GigWrench Support</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage('lang')}
                className="font-mono text-[10px] text-white/25 hover:text-white/60 transition-colors"
                title={ui.change_lang}
              >
                {lang.toUpperCase()}
              </button>
              <button onClick={() => setOpen(false)} className="text-white/25 hover:text-white/60 transition-colors">
                <ChevronDown size={16}/>
              </button>
            </div>
          </div>

          {stage === 'lang' && (
            <div className="flex-1 overflow-y-auto p-5">
              <p className="font-mono text-xs text-white/40 mb-4 text-center">{ui.pick}</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => selectLang(l.code)}
                    className="px-3 py-2.5 rounded-xl border border-white/8 bg-white/3 text-white/60 text-xs font-mono hover:bg-yellow-400/10 hover:border-yellow-400/30 hover:text-yellow-400 transition-all text-left">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                          <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-yellow-400 text-black font-medium rounded-br-sm' : 'bg-white/5 text-white/85 rounded-bl-sm border border-white/6'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                      <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                        <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="bg-white/5 border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s`}}/>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
              <div className="p-3 border-t border-white/6">
                <div className="flex gap-2 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={ui.placeholder}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25 font-mono"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-7 h-7 rounded-xl bg-yellow-400 hover:bg-yellow-300 transition-colors flex items-center justify-center disabled:opacity-30 flex-shrink-0"
                  >
                    {loading ? <Loader2 size={13} className="text-black animate-spin"/> : <Send size={13} className="text-black"/>}
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="font-mono text-[9px] text-white/15">{ui.powered}</span>
                </div>
              </div>
            </>
          )}

          {stage === 'escalate' && (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {messages.slice(-2).map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/85 border border-white/6'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex flex-col gap-3 mt-2">
                <p className="font-mono text-xs text-white/60 leading-relaxed">{ui.escalate_prompt}</p>
                <input type="text" value={escalateName} onChange={e => setEscalateName(e.target.value)} placeholder={ui.name_ph}
                  className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20 font-mono"/>
                <input type="email" value={escalateEmail} onChange={e => setEscalateEmail(e.target.value)} placeholder={ui.email_ph}
                  className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20 font-mono"/>
                <button onClick={handleEscalate} disabled={!escalateName.trim() || escalateLoading}
                  className="bg-yellow-400 text-black font-mono font-bold text-xs tracking-widest py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 uppercase">
                  {escalateLoading ? '...' : ui.submit}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </>
  )
}

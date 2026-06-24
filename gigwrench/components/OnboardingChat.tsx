'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { Check, ChevronRight, X, Wrench, Zap, Link as LinkIcon } from 'lucide-react'
import LensCapture from '@/components/lens/LensCapture'
import type { LensResult } from '@/components/lens/LensCapture'

const TRADES = [
  'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting',
  'Roofing', 'Landscaping', 'Flooring', 'General Handyman', 'Other',
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Stage = 'welcome' | 'trade' | 'business' | 'availability' | 'lens' | 'done'

interface Message {
  from: 'dispatch' | 'user'
  text: string
}

interface Props {
  userName: string
  userId: string
  onComplete: () => void
}

const DISPATCH_LINES: Record<string, Record<string, string>> = {
  welcome: {
    en: `Hey {name}! I'm Dispatch, your AI assistant. I'll get your GigWrench account set up in about 2 minutes. First, what type of work do you do?`,
    es: `Hola {name}! Soy Dispatch, tu asistente de IA. Voy a configurar tu cuenta en unos 2 minutos. Primero, que tipo de trabajo haces?`,
    pt: `Oi {name}! Sou o Dispatch, seu assistente de IA. Vou configurar sua conta em cerca de 2 minutos. Primeiro, que tipo de trabalho voce faz?`,
    fr: `Salut {name}! Je suis Dispatch, votre assistant IA. Je vais configurer votre compte en environ 2 minutes. D'abord, quel type de travail faites-vous?`,
    ar: `مرحبا {name}! انا Dispatch، مساعدك الذكي. سأقوم بإعداد حسابك في حوالي دقيقتين. اولا، ما نوع العمل الذي تقوم به؟`,
    zh: `嗨 {name}！我是 Dispatch，您的 AI 助手。我将在大约 2 分钟内设置好您的账户。首先，您从事什么类型的工作？`,
    hi: `नमस्ते {name}! मैं Dispatch हूं, आपका AI सहायक। मैं आपका खाता लगभग 2 मिनट में सेट कर दूंगा। पहले, आप किस प्रकार का काम करते हैं?`,
    ko: `안녕하세요 {name}! 저는 Dispatch, AI 어시스턴트입니다. 약 2분 안에 계정을 설정해 드리겠습니다. 먼저 어떤 종류의 일을 하시나요?`,
    tr: `Merhaba {name}! Ben Dispatch, yapay zeka asistanınızım. Hesabınızı yaklaşık 2 dakikada kuracağım. Önce, ne tür işler yapıyorsunuz?`,
    de: `Hallo {name}! Ich bin Dispatch, Ihr KI-Assistent. Ich richte Ihr Konto in etwa 2 Minuten ein. Zuerst, welche Art von Arbeit machen Sie?`,
    it: `Ciao {name}! Sono Dispatch, il tuo assistente AI. Configurerò il tuo account in circa 2 minuti. Prima, che tipo di lavoro fai?`,
    nl: `Hallo {name}! Ik ben Dispatch, uw AI-assistent. Ik stel uw account in ongeveer 2 minuten in. Eerst, wat voor soort werk doet u?`,
    ro: `Buna {name}! Sunt Dispatch, asistentul tau AI. Voi configura contul tau in aproximativ 2 minute. Mai intai, ce tip de munca faci?`,
    sv: `Hej {name}! Jag ar Dispatch, din AI-assistent. Jag konfigurerar ditt konto pa ungefar 2 minuter. Forst, vilken typ av arbete gor du?`,
  },
  trade_ack: {
    en: `Got it. Now, what should customers call your business? And what city or area do you serve?`,
    es: `Entendido. Ahora, como se llama tu negocio? Y que ciudad o area atiendes?`,
    pt: `Entendido. Agora, qual e o nome do seu negocio? E qual cidade ou area voce atende?`,
    fr: `Compris. Maintenant, comment s'appelle votre entreprise? Et quelle ville ou zone desservez-vous?`,
    ar: `فهمت. الان، ما اسم عملك؟ وما المدينة او المنطقة التي تخدمها؟`,
    zh: `明白了。现在，您的业务叫什么名字？您服务哪个城市或地区？`,
    hi: `समझ गया। अब, आपके व्यवसाय का नाम क्या है? और आप किस शहर या क्षेत्र में सेवा देते हैं?`,
    ko: `알겠습니다. 이제 고객들이 귀하의 비즈니스를 어떻게 부를까요? 어느 도시나 지역을 서비스하시나요?`,
    tr: `Anladım. Simdi, musteriler isletmenizi nasil cagirmali? Ve hangi sehir veya bolgeye hizmet veriyorsunuz?`,
    de: `Verstanden. Wie heisst Ihr Unternehmen? Und welche Stadt oder Region bedienen Sie?`,
    it: `Capito. Ora, come si chiama la tua attivita? E quale citta o zona servi?`,
    nl: `Begrepen. Nu, hoe noemen klanten uw bedrijf? En welke stad of regio bedient u?`,
    ro: `Inteleg. Acum, cum isi numesc clientii afacerea ta? Si ce oras sau zona deservesti?`,
    sv: `Forstar. Nu, vad kallar kunder ditt foretag? Och vilken stad eller omrade betjanar du?`,
  },
  business_ack: {
    en: `Perfect. When are you available to take jobs? Pick the days and hours that work for you.`,
    es: `Perfecto. Cuando estas disponible para trabajar? Elige los dias y horarios que te convengan.`,
    pt: `Perfeito. Quando voce esta disponivel para trabalhos? Escolha os dias e horarios que funcionam para voce.`,
    fr: `Parfait. Quand etes-vous disponible pour des travaux? Choisissez les jours et heures qui vous conviennent.`,
    ar: `ممتاز. متى تكون متاحا للعمل؟ اختر الايام والساعات المناسبة لك.`,
    zh: `完美。您什么时候可以接受工作？选择适合您的日期和时间。`,
    hi: `बढ़िया। आप कब काम के लिए उपलब्ध हैं? अपने लिए सुविधाजनक दिन और घंटे चुनें।`,
    ko: `완벽합니다. 언제 일을 받을 수 있으신가요? 편한 요일과 시간을 선택하세요.`,
    tr: `Mukemmel. Is almak icin ne zaman musaitsiniz? Size uygun gun ve saatleri secin.`,
    de: `Perfekt. Wann sind Sie fur Jobs verfugbar? Wahlen Sie die Tage und Zeiten, die fur Sie passen.`,
    it: `Perfetto. Quando sei disponibile per i lavori? Scegli i giorni e gli orari che fanno per te.`,
    nl: `Perfect. Wanneer bent u beschikbaar voor klussen? Kies de dagen en uren die voor u werken.`,
    ro: `Perfect. Cand esti disponibil pentru lucrari? Alege zilele si orele care ti se potrivesc.`,
    sv: `Perfekt. Nar ar du tillganglig for jobb? Valj de dagar och tider som passar dig.`,
  },
  lens_intro: {
    en: `Almost done! I want to show you one of GigWrench's best features. Point your camera at any tool, part, or material on a job and I'll identify it instantly. Try it now.`,
    es: `Casi listo! Quiero mostrarte una de las mejores funciones de GigWrench. Apunta tu camara a cualquier herramienta, pieza o material en un trabajo y lo identifico al instante. Pruebalo ahora.`,
    pt: `Quase pronto! Quero te mostrar um dos melhores recursos do GigWrench. Aponte sua camera para qualquer ferramenta, peca ou material num trabalho e eu identifico na hora. Tente agora.`,
    fr: `Presque termine! Je veux vous montrer l'une des meilleures fonctionnalites de GigWrench. Pointez votre camera sur un outil, une piece ou un materiau et je l'identifie instantanement. Essayez maintenant.`,
    ar: `اوشكنا على الانتهاء! اريد ان اريك احدى افضل ميزات GigWrench. وجه كاميرتك نحو اي ادة او قطعة او مادة في العمل وسأحددها على الفور. جربها الان.`,
    zh: `快完成了！我想向您展示 GigWrench 最好的功能之一。将相机对准工作现场的任何工具、零件或材料，我将立即识别它。现在试试。`,
    hi: `लगभग हो गया! मैं आपको GigWrench की सबसे अच्छी विशेषताओं में से एक दिखाना चाहता हूं। किसी भी उपकरण, पुर्जे या सामग्री पर कैमरा लगाएं और मैं इसे तुरंत पहचान लूंगा। अभी आजमाएं।`,
    ko: `거의 다 됐어요! GigWrench의 최고 기능 중 하나를 보여드리고 싶습니다. 작업 현장의 도구, 부품 또는 재료에 카메라를 향하면 즉시 식별해 드립니다. 지금 해보세요.`,
    tr: `Neredeyse bitti! GigWrench'in en iyi ozelliklerinden birini gostermek istiyorum. Kameranizi herhangi bir alet, parca veya malzemeye cevirin ve aninda tanimlayayim. Simdi deneyin.`,
    de: `Fast fertig! Ich mochte Ihnen eine der besten Funktionen von GigWrench zeigen. Richten Sie Ihre Kamera auf ein Werkzeug, ein Teil oder ein Material und ich identifiziere es sofort. Jetzt ausprobieren.`,
    it: `Quasi finito! Voglio mostrarti una delle migliori funzionalita di GigWrench. Punta la fotocamera su qualsiasi strumento, parte o materiale e lo identifichero immediatamente. Provalo adesso.`,
    nl: `Bijna klaar! Ik wil u een van de beste functies van GigWrench laten zien. Richt uw camera op een gereedschap, onderdeel of materiaal en ik identificeer het onmiddellijk. Probeer het nu.`,
    ro: `Aproape gata! Vreau sa iti arat una dintre cele mai bune functii ale GigWrench. Indreptati camera spre orice unealta, piesa sau material si o voi identifica instant. Incercati acum.`,
    sv: `Nara klar! Jag vill visa dig en av GigWrenchs basta funktioner. Rikta kameran mot vilket verktyg, del eller material som helst och jag identifierar det omedelbart. Prova nu.`,
  },
  done: {
    en: `You're all set! Your GigWrench account is ready. What would you like to do first?`,
    es: `Todo listo! Tu cuenta de GigWrench esta lista. Que quieres hacer primero?`,
    pt: `Tudo pronto! Sua conta GigWrench esta configurada. O que voce quer fazer primeiro?`,
    fr: `Tout est pret! Votre compte GigWrench est configure. Que voulez-vous faire en premier?`,
    ar: `كل شيء جاهز! حسابك في GigWrench جاهز. ماذا تريد ان تفعل اولا؟`,
    zh: `一切就绪！您的 GigWrench 账户已准备好。您想先做什么？`,
    hi: `सब तैयार है! आपका GigWrench खाता तैयार है। आप पहले क्या करना चाहेंगे?`,
    ko: `준비 완료! GigWrench 계정이 준비되었습니다. 먼저 무엇을 하시겠어요?`,
    tr: `Hazirsiniz! GigWrench hesabiniz hazir. Once ne yapmak istersiniz?`,
    de: `Alles bereit! Ihr GigWrench-Konto ist eingerichtet. Was mochten Sie als erstes tun?`,
    it: `Tutto pronto! Il tuo account GigWrench e configurato. Cosa vuoi fare per primo?`,
    nl: `U bent klaar! Uw GigWrench-account is ingesteld. Wat wilt u als eerste doen?`,
    ro: `Totul este gata! Contul tau GigWrench este configurat. Ce vrei sa faci primul?`,
    sv: `Allt ar klart! Ditt GigWrench-konto ar konfigurerat. Vad vill du gora forst?`,
  },
}

function getLine(key: string, lang: string, name?: string): string {
  const lines = DISPATCH_LINES[key]
  const text = lines[lang] || lines.en
  return name ? text.replace('{name}', name) : text
}

export default function OnboardingChat({ userName, userId, onComplete }: Props) {
  const { lang } = useLang()
  const [stage, setStage] = useState<Stage>('trade')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTrade, setSelectedTrade] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon','Tue','Wed','Thu','Fri'])
  const [startHour, setStartHour] = useState('08:00')
  const [endHour, setEndHour] = useState('18:00')
  const [lensResult, setLensResult] = useState<LensResult | null>(null)
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Push initial Dispatch welcome on mount
  useEffect(() => {
    const text = getLine('welcome', lang, userName)
    setMessages([{ from: 'dispatch', text }])
  }, [lang, userName])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, stage])

  function pushDispatch(key: string) {
    setMessages(prev => [...prev, { from: 'dispatch', text: getLine(key, lang) }])
  }

  function pushUser(text: string) {
    setMessages(prev => [...prev, { from: 'user', text }])
  }

  function handleTradeSelect(trade: string) {
    setSelectedTrade(trade)
    pushUser(trade)
    setTimeout(() => { pushDispatch('trade_ack'); setStage('business') }, 400)
  }

  function handleBusinessNext() {
    if (!businessName.trim()) return
    pushUser(`${businessName.trim()}${serviceArea.trim() ? ', ' + serviceArea.trim() : ''}`)
    setTimeout(() => { pushDispatch('business_ack'); setStage('availability') }, 400)
  }

  function toggleDay(day: string) {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  function handleAvailabilityNext() {
    const summary = `${selectedDays.join(', ')} ${startHour} - ${endHour}`
    pushUser(summary)
    setTimeout(() => { pushDispatch('lens_intro'); setStage('lens') }, 400)
  }

  function handleLensResult(result: LensResult) {
    setLensResult(result)
    pushUser(`Scanned: ${result.part_name}`)
    setTimeout(() => { pushDispatch('done'); setStage('done') }, 400)
  }

  function skipLens() {
    pushUser('Skip for now')
    setTimeout(() => { pushDispatch('done'); setStage('done') }, 400)
  }

  async function handleFinish(action: string) {
    setSaving(true)
    const supabase = createClient()

    // Save onboarding data to pro_profiles
    await supabase.from('pro_profiles').update({
      primary_trade: selectedTrade,
      business_name: businessName.trim() || null,
      service_address: serviceArea.trim() || null,
      availability_days: selectedDays,
      availability_start: startHour + ':00',
      availability_end: endHour + ':00',
    }).eq('id', userId)

    // Mark onboarding complete on profiles
    await supabase.from('profiles').update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    }).eq('id', userId)

    // Insert primary trade into pro_trades
    if (selectedTrade) {
      await supabase.from('pro_trades').insert({
        pro_id: userId,
        category: selectedTrade,
        subcategory: selectedTrade,
      })
    }

    setSaving(false)
    onComplete()
    if (action === 'job') window.location.href = '/jobs'
    else if (action === 'booking') window.location.href = '/dispatch'
    else window.location.href = '/dashboard'
  }

  const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, '0')
    return `${h}:00`
  })

  return (
    <div className="fixed inset-0 z-50 bg-[#07090D] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Zap size={14} className="text-yellow-400"/>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Dispatch</div>
            <div className="text-white/30 text-xs font-mono">GigWrench Setup</div>
          </div>
        </div>
        <button onClick={() => handleFinish('explore')}
          className="text-white/20 hover:text-white/50 transition-colors flex items-center gap-1.5 font-mono text-xs">
          <X size={14}/> Skip setup
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'dispatch' && (
              <div className="w-6 h-6 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Zap size={10} className="text-yellow-400"/>
              </div>
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.from === 'dispatch'
                ? 'bg-[#131C28] border border-white/8 text-white/80 rounded-tl-sm'
                : 'bg-yellow-400 text-black font-medium rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Stage input areas */}
        <div className="flex justify-start">
          <div className="w-6 mr-2 flex-shrink-0"/>
          <div className="flex-1 max-w-md">

            {/* STAGE: trade */}
            {stage === 'trade' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TRADES.map(t => (
                  <button key={t} onClick={() => handleTradeSelect(t)}
                    className="px-3 py-2.5 rounded-xl border border-white/8 bg-[#131C28] text-white/60 text-xs font-mono hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all text-left">
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* STAGE: business */}
            {stage === 'business' && (
              <div className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  placeholder="Business name (e.g. Mike's Plumbing)"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="bg-[#131C28] border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                />
                <input
                  type="text"
                  placeholder="City or service area (e.g. Austin, TX)"
                  value={serviceArea}
                  onChange={e => setServiceArea(e.target.value)}
                  className="bg-[#131C28] border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                />
                <button onClick={handleBusinessNext} disabled={!businessName.trim()}
                  className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-semibold text-sm py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  Continue <ChevronRight size={16}/>
                </button>
              </div>
            )}

            {/* STAGE: availability */}
            {stage === 'availability' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        selectedDays.includes(d)
                          ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                          : 'border-white/8 bg-[#131C28] text-white/40 hover:border-white/20'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-white/30">Start time</label>
                    <select value={startHour} onChange={e => setStartHour(e.target.value)}
                      className="bg-[#131C28] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/40 appearance-none">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-white/30">End time</label>
                    <select value={endHour} onChange={e => setEndHour(e.target.value)}
                      className="bg-[#131C28] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/40 appearance-none">
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleAvailabilityNext} disabled={selectedDays.length === 0}
                  className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-semibold text-sm py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  Continue <ChevronRight size={16}/>
                </button>
              </div>
            )}

            {/* STAGE: lens */}
            {stage === 'lens' && !lensResult && (
              <div className="flex flex-col gap-3 mt-2">
                <LensCapture onResult={handleLensResult}/>
                <button onClick={skipLens}
                  className="text-white/30 text-xs font-mono hover:text-white/60 transition-colors text-center py-2">
                  Skip for now
                </button>
              </div>
            )}

            {/* STAGE: done */}
            {stage === 'done' && (
              <div className="flex flex-col gap-3 mt-2">
                <button onClick={() => handleFinish('job')} disabled={saving}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-[#131C28] hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all text-left disabled:opacity-40">
                  <Wrench size={16} className="text-yellow-400 flex-shrink-0"/>
                  <div>
                    <div className="text-white text-sm font-medium">Add my first job</div>
                    <div className="text-white/30 text-xs font-mono">Schedule a job and start tracking</div>
                  </div>
                </button>
                <button onClick={() => handleFinish('booking')} disabled={saving}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-[#131C28] hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all text-left disabled:opacity-40">
                  <LinkIcon size={16} className="text-yellow-400 flex-shrink-0"/>
                  <div>
                    <div className="text-white text-sm font-medium">Share my booking link</div>
                    <div className="text-white/30 text-xs font-mono">Let customers book you directly</div>
                  </div>
                </button>
                <button onClick={() => handleFinish('explore')} disabled={saving}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-[#131C28] hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all text-left disabled:opacity-40">
                  <Check size={16} className="text-yellow-400 flex-shrink-0"/>
                  <div>
                    <div className="text-white text-sm font-medium">Explore the dashboard</div>
                    <div className="text-white/30 text-xs font-mono">See everything GigWrench can do</div>
                  </div>
                </button>
                {saving && (
                  <div className="text-center text-white/30 text-xs font-mono py-2">Saving your profile...</div>
                )}
              </div>
            )}

          </div>
        </div>

        <div ref={bottomRef}/>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 px-5 pb-5 pt-2 border-t border-white/6">
        <div className="flex gap-1.5">
          {(['welcome','trade','business','availability','lens','done'] as Stage[]).map((s, i) => {
            const stages: Stage[] = ['welcome','trade','business','availability','lens','done']
            const currentIdx = stages.indexOf(stage)
            const thisIdx = stages.indexOf(s)
            return (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                thisIdx <= currentIdx ? 'bg-yellow-400' : 'bg-white/10'
              }`}/>
            )
          })}
        </div>
        <div className="text-white/20 text-[10px] font-mono mt-2 text-center tracking-widest uppercase">
          {stage === 'welcome' ? 'Step 1 of 5' :
           stage === 'trade' ? 'Step 1 of 5' :
           stage === 'business' ? 'Step 2 of 5' :
           stage === 'availability' ? 'Step 3 of 5' :
           stage === 'lens' ? 'Step 4 of 5' : 'Done'}
        </div>
      </div>

    </div>
  )
}

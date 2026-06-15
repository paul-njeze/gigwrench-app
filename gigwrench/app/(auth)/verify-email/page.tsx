'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'

type Lang = 'en'|'es'|'pt'|'fr'|'ar'|'zh'|'hi'|'ko'|'tr'|'de'|'it'|'nl'|'ro'|'sv'

const UI: Record<Lang, {
  heading: string; sent: string; next_label: string;
  steps: string[]; loading: string; resend: string; resent: string;
  wrong: string; back: string; expires: string;
}> = {
  en: {
    heading: 'Check Your Email.',
    sent: 'We sent a verification link to',
    next_label: 'What to do next',
    steps: [
      'Open your email inbox',
      'Find the email from GigWrench',
      'Click the "Confirm your email" button',
      'You will be signed in automatically',
    ],
    loading: 'Sending...', resend: "Didn't receive it? Resend email",
    resent: 'Verification email resent',
    wrong: 'Wrong email?', back: 'Go back and try again',
    expires: 'This verification link expires in 24 hours.',
  },
  es: {
    heading: 'Revisa tu correo.',
    sent: 'Enviamos un enlace de verificacion a',
    next_label: 'Que hacer a continuacion',
    steps: [
      'Abre tu bandeja de entrada',
      'Encuentra el correo de GigWrench',
      'Haz clic en "Confirmar tu correo"',
      'Seras autenticado automaticamente',
    ],
    loading: 'Enviando...', resend: 'No lo recibiste? Reenviar correo',
    resent: 'Correo de verificacion reenviado',
    wrong: 'Correo incorrecto?', back: 'Volver e intentar de nuevo',
    expires: 'Este enlace de verificacion expira en 24 horas.',
  },
  pt: {
    heading: 'Verifique seu email.',
    sent: 'Enviamos um link de verificacao para',
    next_label: 'O que fazer a seguir',
    steps: [
      'Abra sua caixa de entrada',
      'Encontre o email do GigWrench',
      'Clique no botao "Confirmar seu email"',
      'Voce sera autenticado automaticamente',
    ],
    loading: 'Enviando...', resend: 'Nao recebeu? Reenviar email',
    resent: 'Email de verificacao reenviado',
    wrong: 'Email errado?', back: 'Voltar e tentar novamente',
    expires: 'Este link de verificacao expira em 24 horas.',
  },
  fr: {
    heading: 'Verifiez votre email.',
    sent: 'Nous avons envoye un lien de verification a',
    next_label: 'Que faire ensuite',
    steps: [
      'Ouvrez votre boite de reception',
      "Trouvez l'email de GigWrench",
      'Cliquez sur "Confirmer votre email"',
      'Vous serez connecte automatiquement',
    ],
    loading: 'Envoi...', resend: "Vous ne l'avez pas recu? Renvoyer",
    resent: 'Email de verification renvoye',
    wrong: 'Mauvais email?', back: 'Retourner et reessayer',
    expires: 'Ce lien de verification expire dans 24 heures.',
  },
  ar: {
    heading: 'تحقق من بريدك الالكتروني.',
    sent: 'ارسلنا رابط التحقق الى',
    next_label: 'ماذا تفعل بعد ذلك',
    steps: [
      'افتح صندوق البريد الوارد',
      'ابحث عن البريد من GigWrench',
      'انقر على تاكيد بريدك الالكتروني',
      'ستتم المصادقة تلقائيا',
    ],
    loading: 'جاري الارسال...', resend: 'لم تستلمه؟ اعادة الارسال',
    resent: 'تمت اعادة ارسال بريد التحقق',
    wrong: 'البريد خاطئ؟', back: 'العودة والمحاولة',
    expires: 'ينتهي صلاحية رابط التحقق خلال 24 ساعة.',
  },
  zh: {
    heading: '请查看您的邮件。',
    sent: '我们已向以下地址发送了验证链接',
    next_label: '接下来怎么做',
    steps: [
      '打开您的电子邮件收件筱',
      '找到来自 GigWrench 的邮件',
      '点击“确认您的电子邮件”按鈕',
      '您将自动登录',
    ],
    loading: '发送中...', resend: '没有收到？重新发送邮件',
    resent: '验证邮件已重新发送',
    wrong: '邮筱填错了？', back: '返回重试',
    expires: '此验证链接24小时后失效。',
  },
  hi: {
    heading: 'अपना ईमेल जांचें।',
    sent: 'हमने एक सत्यापन लिंक भेजा है',
    next_label: 'आगे क्या करें',
    steps: [
      'अपना ईमेल इनबॉक्स खोलें',
      'GigWrench से ईमेल खोजें',
      'ईमेल पुष्टि करें बटन दबाएं',
      'आप स्वचालिت रूप से लॉग इन हो जाएंगे',
    ],
    loading: 'भेज रहे हैं...', resend: 'नहीं मिला? ईमेल फिर से भेजें',
    resent: 'सत्यापन ईमेल पुनः भेजा गया',
    wrong: 'गलत ईमेल?', back: 'वापस जाएं और पुनः प्रयास करें',
    expires: 'यह सत्यापन लिंक 24 घंटों में समाप्त हो जाता है।',
  },
  ko: {
    heading: '이메일을 확인하세요.',
    sent: '다음 주소로 인증 링크를 보냈습니다',
    next_label: '다음에 할 일',
    steps: [
      '이메일 받은편지함 열기',
      'GigWrench에서 온 이메일 찾기',
      '이메일 확인 버튼 클릭',
      '자동으로 로그인됩니다',
    ],
    loading: '전송 중...', resend: '받지 못하셨나요? 이메일 재전송',
    resent: '인증 이메일이 재전송되었습니다',
    wrong: '이메일이 잘못되었나요?', back: '돌아가서 다시 시도',
    expires: '이 인증 링크는 24시간 후 만료됩니다.',
  },
  tr: {
    heading: 'E-postanizi kontrol edin.',
    sent: 'Dogrulama baglantisi gonderdik',
    next_label: 'Bundan sonra ne yapacaksiniz',
    steps: [
      'E-posta gelen kutunuzu acin',
      "GigWrench'ten gelen e-postayi bulun",
      '"E-postanizi onaylayin" butonuna tiklayin',
      'Otomatik olarak giris yapilacak',
    ],
    loading: 'Gonderiliyor...', resend: 'Almadin mi? E-postayi yeniden gonder',
    resent: 'Dogrulama e-postasi yeniden gonderildi',
    wrong: 'Yanlis e-posta mi?', back: 'Geri don ve tekrar dene',
    expires: 'Bu dogrulama baglantisi 24 saat sonra sona erer.',
  },
  de: {
    heading: 'Pruefen Sie Ihre E-Mail.',
    sent: 'Wir haben einen Verifizierungslink gesendet an',
    next_label: 'Was als naechstes zu tun ist',
    steps: [
      'Oeffnen Sie Ihren E-Mail-Posteingang',
      'Finden Sie die E-Mail von GigWrench',
      'Klicken Sie auf "E-Mail bestaetigen"',
      'Sie werden automatisch angemeldet',
    ],
    loading: 'Senden...', resend: 'Nicht erhalten? E-Mail erneut senden',
    resent: 'Bestaetigung E-Mail erneut gesendet',
    wrong: 'Falsche E-Mail?', back: 'Zurueck und erneut versuchen',
    expires: 'Dieser Verifikationslink laeuft in 24 Stunden ab.',
  },
  it: {
    heading: 'Controlla la tua email.',
    sent: 'Abbiamo inviato un link di verifica a',
    next_label: 'Cosa fare dopo',
    steps: [
      'Apri la tua casella di posta',
      "Trova l'email da GigWrench",
      'Clicca su "Conferma la tua email"',
      'Verrai autenticato automaticamente',
    ],
    loading: 'Invio...', resend: "Non l'hai ricevuta? Invia di nuovo",
    resent: 'Email di verifica reinviata',
    wrong: 'Email sbagliata?', back: 'Torna e riprova',
    expires: 'Questo link di verifica scade in 24 ore.',
  },
  nl: {
    heading: 'Controleer uw e-mail.',
    sent: 'We hebben een verificatielink gestuurd naar',
    next_label: 'Wat u vervolgens moet doen',
    steps: [
      'Open uw e-mailinbox',
      'Zoek de e-mail van GigWrench',
      'Klik op "Bevestig uw e-mail"',
      'U wordt automatisch ingelogd',
    ],
    loading: 'Verzenden...', resend: 'Niet ontvangen? E-mail opnieuw sturen',
    resent: 'Verificatie-e-mail opnieuw verzonden',
    wrong: 'Verkeerd e-mailadres?', back: 'Ga terug en probeer opnieuw',
    expires: 'Deze verificatielink verloopt over 24 uur.',
  },
  ro: {
    heading: 'Verifica-ti emailul.',
    sent: 'Am trimis un link de verificare la',
    next_label: 'Ce sa faci in continuare',
    steps: [
      'Deschide-ti casuta de email',
      'Gaseste emailul de la GigWrench',
      'Apasa pe "Confirma emailul tau"',
      'Vei fi autentificat automat',
    ],
    loading: 'Se trimite...', resend: 'Nu l-ai primit? Retrimite emailul',
    resent: 'Emailul de verificare a fost retrimis',
    wrong: 'Email gresit?', back: 'Inapoi si incearca din nou',
    expires: 'Acest link de verificare expira in 24 de ore.',
  },
  sv: {
    heading: 'Kontrollera din e-post.',
    sent: 'Vi skickade en verifieringslaenk till',
    next_label: 'Vad du ska goera haernaest',
    steps: [
      'Oeppna din e-postinkorg',
      'Hitta e-postmeddelandet fran GigWrench',
      'Klicka pa "Bekraefta din e-post"',
      'Du loggas in automatiskt',
    ],
    loading: 'Skickar...', resend: 'Fick du det inte? Skicka om',
    resent: 'Verifieringsmail skickat igen',
    wrong: 'Fel e-post?', back: 'Ga tillbaka och foersoek igen',
    expires: 'Den haer verifieringslaenken upphoer att gaella om 24 timmar.',
  },
}

function VerifyContent() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('gw_lang') as Lang | null
    if (saved && UI[saved]) setLang(saved)
  }, [])

  const ui = UI[lang]

  async function resendEmail() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setResent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col">
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
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-yellow-400"/>
          </div>

          <h1 className="font-display text-4xl tracking-wider text-white mb-3">{ui.heading}</h1>
          <p className="text-white/50 text-sm font-mono leading-relaxed mb-2">{ui.sent}</p>
          {email && (
            <p className="text-yellow-400 font-mono text-sm font-medium mb-6 bg-yellow-400/8 border border-yellow-400/20 rounded-lg px-4 py-2 inline-block">
              {email}
            </p>
          )}

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-6 mb-6 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">{ui.next_label}</p>
            <div className="flex flex-col gap-3">
              {ui.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm text-yellow-400">{i + 1}</span>
                  </div>
                  <span className="text-white/60 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {!resent ? (
            <button onClick={resendEmail} disabled={loading}
              className="flex items-center gap-2 mx-auto text-white/30 hover:text-white/60 transition-colors font-mono text-xs disabled:opacity-40">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>
              {loading ? ui.loading : ui.resend}
            </button>
          ) : (
            <div className="flex items-center gap-2 justify-center text-green-400 font-mono text-xs">
              <CheckCircle2 size={12}/>
              {ui.resent}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/6">
            <p className="text-white/20 font-mono text-xs">
              {ui.wrong}{' '}
              <Link href="/signup" className="text-yellow-400/60 hover:text-yellow-400 transition-colors">
                {ui.back}
              </Link>
            </p>
            <p className="text-white/10 font-mono text-[10px] mt-3">{ui.expires}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent/>
    </Suspense>
  )
}

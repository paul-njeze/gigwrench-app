'use client'

import { useState, useEffect, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useLang } from '@/lib/lang'

import { X, ChevronRight, ChevronLeft, Zap } from 'lucide-react'

export interface TourStep {
  target: string
  title: Record<string, string>
  body: Record<string, string>
  position: 'bottom' | 'right' | 'left' | 'top'
}

export const PRO_STEPS: TourStep[] = [
  {
    target: 'tour-dashboard',
    position: 'right',
    title: {
      en: 'Your Command Center',
      es: 'Tu centro de control',
      pt: 'Seu centro de comando',
      fr: 'Votre centre de commande',
      ar: 'مركز التحكم',
      zh: '您的指挥中心',
      hi: 'आपका कमांड सेंटर',
      ko: '명령 센터',
      tr: 'Komuta merkeziniz',
      de: 'Ihre Kommandozentrale',
      it: 'Il tuo centro di comando',
      nl: 'Uw commandocentrum',
      ro: 'Centrul tau de comanda',
      sv: 'Ditt kommandocenter',
    },
    body: {
      en: "This is your dashboard. Today's jobs, earnings, and upcoming work live here at a glance.",
      es: 'Este es tu panel. Los trabajos de hoy, tus ganancias y el trabajo proximo estan aqui de un vistazo.',
      pt: 'Este e o seu painel. Os trabalhos de hoje, ganhos e proximos trabalhos ficam aqui.',
      fr: "C'est votre tableau de bord. Les jobs du jour, vos revenus et le travail a venir sont ici d'un coup d'oeil.",
      ar: 'هذه لوحة التحكم. وظائف اليوم والارباح والعمل القادم موجودة هنا في لمحة.',
      zh: '这是您的仪表盘。今日工作、收入和即将到来的工作一目了然。',
      hi: 'यह आपका डैशबोर्ड है। आज के काम, कमाई और आगामी काम यहां एक नज़र में।',
      ko: '이것이 대시보드입니다. 오늘의 작업, 수익, 예정된 작업이 한눈에 보입니다.',
      tr: 'Bu sizin panonuz. Bugunku isler, kazanclar ve gelecek calisma bir bakista burada.',
      de: 'Das ist Ihr Dashboard. Die heutigen Jobs, Einnahmen und anstehende Arbeit auf einen Blick.',
      it: "Questa e la tua dashboard. I lavori di oggi, i guadagni e il lavoro futuro sono qui a colpo d'occhio.",
      nl: 'Dit is uw dashboard. De jobs van vandaag, inkomsten en aankomend werk in een oogopslag.',
      ro: 'Acesta este tabloul tau de bord. Lucrarile de astazi, castigurile si lucrul viitor sunt aici dintr-o privire.',
      sv: 'Det har ar din instrumentpanel. Dagens jobb, intakter och kommande arbete pa ett ogonblick.',
    },
  },
  {
    target: 'tour-jobs',
    position: 'right',
    title: {
      en: 'Jobs',
      es: 'Trabajos', pt: 'Trabalhos', fr: 'Travaux', ar: 'الوظائف',
      zh: '工作', hi: 'काम', ko: '작업', tr: 'Isler', de: 'Jobs',
      it: 'Lavori', nl: 'Klussen', ro: 'Lucrari', sv: 'Jobb',
    },
    body: {
      en: 'Create and manage every job. Schedule, track status, and fire GPS tracking when you head out.',
      es: 'Crea y gestiona cada trabajo. Agenda, sigue el estado y activa el GPS cuando sales.',
      pt: 'Crie e gerencie cada trabalho. Agende, acompanhe o status e ative o GPS ao sair.',
      fr: 'Creez et gerez chaque job. Planifiez, suivez le statut et activez le GPS en partant.',
      ar: 'انشئ وادر كل وظيفة. جدول وتتبع الحالة وفعل تتبع GPS عند المغادرة.',
      zh: '创建和管理每项工作。安排日程、追踪状态，出发时启动GPS追踪。',
      hi: 'हर काम बनाएं और प्रबंधित करें। शेड्यूल करें, स्थिति ट्रैक करें और निकलते समय GPS चालू करें।',
      ko: '모든 작업을 만들고 관리하세요. 일정 잡기, 상태 추적, 출발 시 GPS 추적 시작.',
      tr: "Her isi olusturun ve yonetin. Planlayın, durumu takip edin ve giderken GPS'i baslatın.",
      de: 'Erstellen und verwalten Sie jeden Job. Planen, Status verfolgen und GPS beim Losfahren starten.',
      it: 'Crea e gestisci ogni lavoro. Pianifica, monitora lo stato e attiva il GPS quando parti.',
      nl: 'Maak en beheer elke klus. Plan, volg de status en start GPS-tracking als u vertrekt.',
      ro: 'Creeaza si gestioneaza fiecare lucrare. Programeaza, urmareste starea si porneste GPS la plecare.',
      sv: 'Skapa och hantera varje jobb. Schemalägg, spara status och starta GPS-spårning när du åker.',
    },
  },
  {
    target: 'tour-dispatch',
    position: 'right',
    title: {
      en: 'Dispatch',
      es: 'Dispatch', pt: 'Dispatch', fr: 'Dispatch', ar: 'Dispatch',
      zh: 'Dispatch', hi: 'Dispatch', ko: 'Dispatch', tr: 'Dispatch',
      de: 'Dispatch', it: 'Dispatch', nl: 'Dispatch', ro: 'Dispatch', sv: 'Dispatch',
    },
    body: {
      en: 'Dispatch is your AI booking agent. It answers leads by SMS while you are on a job, 24/7, under 90 seconds.',
      es: 'Dispatch es tu agente de reservas con IA. Responde consultas por SMS mientras trabajas, 24/7, en menos de 90 segundos.',
      pt: 'Dispatch e seu agente de reservas com IA. Responde leads por SMS enquanto voce trabalha, 24/7, em menos de 90 segundos.',
      fr: 'Dispatch est votre agent de reservation IA. Il repond aux leads par SMS pendant que vous travaillez, 24/7, en moins de 90 secondes.',
      ar: 'Dispatch هو وكيل الحجز بالذكاء الاصطناعي. يرد على العملاء بالرسائل اثناء عملك، 24/7 في اقل من 90 ثانية.',
      zh: 'Dispatch 是您的 AI 预约代理。在您工作时通过短信回复客户线索，24/7，90秒内响应。',
      hi: 'Dispatch आपका AI बुकिंग एजेंट है। काम पर रहते हुए SMS से लीड का जवाब देता है, 24/7, 90 सेकंड से कम।',
      ko: 'Dispatch는 AI 예약 에이전트입니다. 작업 중에도 SMS로 리드에 응답합니다, 24/7, 90초 이내.',
      tr: 'Dispatch, yapay zeka rezervasyon ajanınızdır. Çalışırken SMS ile musterilere yanit verir, 7/24, 90 saniye icinde.',
      de: 'Dispatch ist Ihr KI-Buchungsagent. Er beantwortet Leads per SMS wahrend Sie arbeiten, 24/7, unter 90 Sekunden.',
      it: 'Dispatch e il tuo agente di prenotazione AI. Risponde ai lead via SMS mentre lavori, 24/7, in meno di 90 secondi.',
      nl: 'Dispatch is uw AI-boekingsagent. Het beantwoordt leads via SMS terwijl u werkt, 24/7, binnen 90 seconden.',
      ro: 'Dispatch este agentul tau AI de rezervari. Raspunde la lead-uri prin SMS cat timp lucrezi, 24/7, sub 90 de secunde.',
      sv: 'Dispatch ar din AI-bokningsagent. Den svarar pa leads via SMS medan du jobbar, 24/7, under 90 sekunder.',
    },
  },
  {
    target: 'tour-invoices',
    position: 'right',
    title: {
      en: 'Invoices',
      es: 'Facturas', pt: 'Faturas', fr: 'Factures', ar: 'الفواتير',
      zh: '发票', hi: 'चालान', ko: '청구서', tr: 'Faturalar', de: 'Rechnungen',
      it: 'Fatture', nl: 'Facturen', ro: 'Facturi', sv: 'Fakturor',
    },
    body: {
      en: 'Create invoices and send Stripe payment links in seconds. Customers pay online, you get notified instantly.',
      es: 'Crea facturas y envia enlaces de pago Stripe en segundos. Los clientes pagan en linea y te notificamos al instante.',
      pt: 'Crie faturas e envie links de pagamento Stripe em segundos. Clientes pagam online e voce e notificado.',
      fr: 'Creez des factures et envoyez des liens de paiement Stripe en quelques secondes. Les clients paient en ligne.',
      ar: 'انشئ فواتير وارسل روابط الدفع Stripe في ثوانٍ. يدفع العملاء عبر الانترنت وتتلقى اشعارا فوريا.',
      zh: '几秒内创建发票并发送 Stripe 付款链接。客户在线付款，您立即收到通知。',
      hi: 'सेकंड में चालान बनाएं और Stripe पेमेंट लिंक भेजें। ग्राहक ऑनलाइन भुगतान करते हैं, आपको तुरंत सूचना मिलती है।',
      ko: '몇 초 만에 청구서를 만들고 Stripe 결제 링크를 보내세요. 고객이 온라인으로 결제하면 즉시 알림이 옵니다.',
      tr: 'Saniyeler icinde fatura olusturun ve Stripe odeme baglantisi gonderin. Musteriler cevrimici oder, aninda bildirim alirsiniz.',
      de: 'Erstellen Sie Rechnungen und senden Sie Stripe-Zahlungslinks in Sekunden. Kunden zahlen online, Sie werden sofort benachrichtigt.',
      it: 'Crea fatture e invia link di pagamento Stripe in pochi secondi. I clienti pagano online e tu ricevi una notifica immediata.',
      nl: 'Maak facturen en stuur Stripe betaallinks in seconden. Klanten betalen online, u krijgt direct een melding.',
      ro: 'Creeaza facturi si trimite linkuri de plata Stripe in secunde. Clientii platesc online si esti notificat instant.',
      sv: 'Skapa fakturor och skicka Stripe-betalningslänkar på sekunder. Kunder betalar online, du får omedelbar avisering.',
    },
  },
  {
    target: 'tour-customers',
    position: 'right',
    title: {
      en: 'Customers',
      es: 'Clientes', pt: 'Clientes', fr: 'Clients', ar: 'العملاء',
      zh: '客户', hi: 'ग्राहक', ko: '고객', tr: 'Musteriler', de: 'Kunden',
      it: 'Clienti', nl: 'Klanten', ro: 'Clienti', sv: 'Kunder',
    },
    body: {
      en: 'Your full customer CRM. See job history, contact info, and loyalty status for every customer in one place.',
      es: 'Tu CRM completo de clientes. Historial de trabajos, contacto y estado de fidelidad en un solo lugar.',
      pt: 'Seu CRM completo de clientes. Historico de trabalhos, contato e status de fidelidade em um lugar so.',
      fr: 'Votre CRM client complet. Historique des jobs, coordonnees et statut de fidelite en un seul endroit.',
      ar: 'نظام CRM الكامل للعملاء. سجل الوظائف ومعلومات الاتصال وحالة الولاء في مكان واحد.',
      zh: '您的完整客户CRM。在一个地方查看每位客户的工作历史、联系信息和忠诚度状态。',
      hi: 'आपका पूरा ग्राहक CRM। हर ग्राहक का काम इतिहास, संपर्क जानकारी और वफादारी स्थिति एक जगह।',
      ko: '완전한 고객 CRM. 모든 고객의 작업 이력, 연락처, 충성도 상태를 한 곳에서 확인.',
      tr: "Tam musteri CRM'iniz. Her musteri icin is gecmisi, iletisim bilgileri ve sadakat durumu tek yerde.",
      de: 'Ihr vollstandiges Kunden-CRM. Jobhistorie, Kontaktdaten und Treuestatus fur jeden Kunden an einem Ort.',
      it: 'Il tuo CRM clienti completo. Cronologia lavori, contatti e stato fedelta per ogni cliente in un unico posto.',
      nl: 'Uw volledige klanten-CRM. Klusgeschiedenis, contactgegevens en loyaliteitsstatus voor elke klant op een plek.',
      ro: 'CRM-ul complet al clientilor. Istoricul lucrarilor, informatii de contact si starea de loialitate intr-un singur loc.',
      sv: 'Ditt fullständiga kund-CRM. Jobbhistorik, kontaktuppgifter och lojalitetsstatus för varje kund på ett ställe.',
    },
  },
  {
    target: 'tour-analytics',
    position: 'right',
    title: {
      en: 'Analytics',
      es: 'Analíticas', pt: 'Análises', fr: 'Analytique', ar: 'التحليلات',
      zh: '分析', hi: 'विश्लेषण', ko: '분석', tr: 'Analizler', de: 'Analysen',
      it: 'Analisi', nl: 'Analyses', ro: 'Analitice', sv: 'Analys',
    },
    body: {
      en: 'Track your revenue, job count, and performance trends over 30 days, 90 days, or all time.',
      es: 'Sigue tus ingresos, cantidad de trabajos y tendencias de rendimiento en 30, 90 dias o todo el tiempo.',
      pt: 'Acompanhe receita, numero de trabalhos e tendencias de desempenho em 30, 90 dias ou todo o periodo.',
      fr: 'Suivez vos revenus, le nombre de jobs et les tendances de performance sur 30, 90 jours ou tout le temps.',
      ar: 'تتبع ايراداتك وعدد الوظائف واتجاهات الاداء على مدى 30 او 90 يوما او طوال الوقت.',
      zh: '追踪您的收入、工作数量和30天、90天或全部时间的绩效趋势。',
      hi: '30 दिन, 90 दिन या सभी समय में अपनी आय, काम की संख्या और प्रदर्शन रुझान ट्रैक करें।',
      ko: '30일, 90일 또는 전체 기간의 수익, 작업 수, 성과 추세를 추적하세요.',
      tr: '30 gun, 90 gun veya tum zamanlarda gelirinizi, is sayinizi ve performans egilimlerinizi takip edin.',
      de: 'Verfolgen Sie Einnahmen, Jobanzahl und Leistungstrends uber 30, 90 Tage oder alle Zeit.',
      it: 'Monitora entrate, numero di lavori e tendenze delle prestazioni in 30, 90 giorni o sempre.',
      nl: 'Volg uw inkomsten, aantal klussen en prestatietrends over 30, 90 dagen of altijd.',
      ro: 'Urmareste veniturile, numarul de lucrari si tendintele de performanta pe 30, 90 de zile sau mereu.',
      sv: 'Spåra dina intäkter, jobbantal och prestandatrender över 30, 90 dagar eller alltid.',
    },
  },
  {
    target: 'tour-find-pro',
    position: 'right',
    title: {
      en: 'Find a Pro',
      es: 'Buscar un Pro', pt: 'Encontrar um Pro', fr: 'Trouver un Pro', ar: 'ابحث عن Pro',
      zh: '找Pro', hi: 'Pro खोजें', ko: 'Pro 찾기', tr: 'Pro Bul', de: 'Pro finden',
      it: 'Trova un Pro', nl: 'Vind een Pro', ro: 'Gaseste un Pro', sv: 'Hitta en Pro',
    },
    body: {
      en: 'Transfer overflow jobs to verified Pros nearby. Swipe to browse, tap to send a work order, 24-hour acceptance window.',
      es: 'Transfiere trabajos extra a Pros verificados cercanos. Desliza para explorar, toca para enviar una orden de trabajo.',
      pt: 'Transfira trabalhos extras para Pros verificados proximos. Deslize para navegar, toque para enviar uma ordem.',
      fr: 'Transferez les travaux en surplus a des Pros verifies a proximite. Faites glisser pour parcourir, appuyez pour envoyer.',
      ar: 'انقل الوظائف الزائدة الى Pros المعتمدين القريبين. اسحب للتصفح، اضغط لارسال امر عمل.',
      zh: '将溢出的工作转移给附近经过验证的Pro。滑动浏览，点击发送工作订单，24小时接受窗口。',
      hi: 'अतिरिक्त काम पास के सत्यापित Pros को ट्रांसफर करें। स्वाइप करके ब्राउज़ करें, वर्क ऑर्डर भेजने के लिए टैप करें।',
      ko: '초과 작업을 근처 인증된 Pro에게 이전하세요. 스와이프로 탐색, 탭으로 작업 주문 전송, 24시간 수락 창.',
      tr: "Fazla isleri yakındaki dogrulanmis Pros'lara aktarin. Gozatmak icin kaydirin, is emri gondermek icin dokunun.",
      de: 'Uberschussjobs an verifizierte Pros in der Nahe ubertragen. Wischen zum Durchsuchen, tippen zum Senden.',
      it: 'Trasferisci i lavori in eccesso a Pro verificati nelle vicinanze. Scorri per sfogliare, tocca per inviare un ordine.',
      nl: 'Stuur overtollige klussen door naar geverifieerde Pros in de buurt. Swipe om te bladeren, tik om te sturen.',
      ro: 'Transfera lucrarile in exces catre Pros verificati din apropiere. Gliseaza pentru a naviga, atinge pentru a trimite.',
      sv: 'Overfor överskottsjobb till verifierade Pros i närheten. Svep för att bläddra, tryck för att skicka arbetsorder.',
    },
  },
  {
    target: 'tour-lens',
    position: 'right',
    title: {
      en: 'GigWrench Lens',
      es: 'GigWrench Lens', pt: 'GigWrench Lens', fr: 'GigWrench Lens', ar: 'GigWrench Lens',
      zh: 'GigWrench Lens', hi: 'GigWrench Lens', ko: 'GigWrench Lens', tr: 'GigWrench Lens',
      de: 'GigWrench Lens', it: 'GigWrench Lens', nl: 'GigWrench Lens', ro: 'GigWrench Lens', sv: 'GigWrench Lens',
    },
    body: {
      en: 'Point your camera at any part or tool on a job. Dispatch identifies it, gives you pricing and suppliers, and adds it to your invoice.',
      es: 'Apunta la camara a cualquier pieza o herramienta. Dispatch lo identifica, te da precios y proveedores, y lo agrega a tu factura.',
      pt: 'Aponte a camera para qualquer peca ou ferramenta. Dispatch identifica, da precos e fornecedores, e adiciona a fatura.',
      fr: "Pointez la camera sur n'importe quelle piece ou outil. Dispatch l'identifie, vous donne les prix et fournisseurs, et l'ajoute a la facture.",
      ar: 'وجه الكاميرا نحو اي قطعة او ادة. Dispatch يحددها ويعطيك الاسعار والموردين ويضيفها للفاتورة.',
      zh: '将相机对准任何零件或工具。Dispatch识别它，提供价格和供应商，并添加到发票。',
      hi: 'किसी भी पुर्जे या उपकरण पर कैमरा लगाएं। Dispatch इसे पहचानता है, कीमत और आपूर्तिकर्ता देता है, और चालान में जोड़ता है।',
      ko: '부품이나 도구에 카메라를 향하세요. Dispatch가 식별하고 가격과 공급업체를 알려주며 청구서에 추가합니다.',
      tr: 'Kameranizi herhangi bir parca veya alete cevirin. Dispatch tanimlar, fiyat ve tedarikci verir, faturaya ekler.',
      de: 'Richten Sie die Kamera auf ein Teil oder Werkzeug. Dispatch identifiziert es, gibt Preise und Lieferanten an und fugt es zur Rechnung hinzu.',
      it: 'Punta la fotocamera su qualsiasi pezzo o strumento. Dispatch lo identifica, fornisce prezzi e fornitori, e lo aggiunge alla fattura.',
      nl: 'Richt uw camera op een onderdeel of gereedschap. Dispatch identificeert het, geeft prijzen en leveranciers en voegt het toe aan de factuur.',
      ro: 'Indreptati camera spre orice piesa sau unealta. Dispatch o identifica, da preturi si furnizori si o adauga la factura.',
      sv: 'Rikta kameran mot ett reservdel eller verktyg. Dispatch identifierar det, ger priser och leverantörer och lägger till på fakturan.',
    },
  },
  {
    target: 'tour-dispatch-widget',
    position: 'top',
    title: {
      en: 'Need help? Ask Dispatch.',
      es: 'Necesitas ayuda? Preguntale a Dispatch.',
      pt: 'Precisa de ajuda? Pergunte ao Dispatch.',
      fr: "Besoin d'aide? Demandez a Dispatch.",
      ar: 'تحتاج مساعدة؟ اسال Dispatch.',
      zh: '需要帮助？问问 Dispatch。',
      hi: 'मदद चाहिए? Dispatch से पूछें।',
      ko: '도움이 필요하세요? Dispatch에게 물어보세요.',
      tr: "Yardima mi ihtiyaciniz var? Dispatch'e sorun.",
      de: 'Brauchen Sie Hilfe? Fragen Sie Dispatch.',
      it: 'Hai bisogno di aiuto? Chiedi a Dispatch.',
      nl: 'Hulp nodig? Vraag het aan Dispatch.',
      ro: 'Ai nevoie de ajutor? Intreaba Dispatch.',
      sv: 'Behover du hjälp? Fråga Dispatch.',
    },
    body: {
      en: 'This button is always here. Tap it any time to ask Dispatch a question, get help with a feature, or restart this tour.',
      es: 'Este boton siempre esta aqui. Tocalo para hacerle una pregunta a Dispatch, pedir ayuda con una funcion o reiniciar este recorrido.',
      pt: 'Este botao esta sempre aqui. Toque para fazer uma pergunta ao Dispatch, obter ajuda com um recurso ou reiniciar este tour.',
      fr: "Ce bouton est toujours la. Appuyez dessus pour poser une question a Dispatch, obtenir de l'aide ou relancer cette visite guidee.",
      ar: 'هذا الزر موجود دائما. انقر عليه في اي وقت لطرح سؤال على Dispatch او للمساعدة او لاعادة تشغيل هذا الجولة.',
      zh: '这个按钮始终在这里。随时点击向 Dispatch 提问、获取功能帮助，或重启本导览。',
      hi: 'यह बटन हमेशा यहां है। Dispatch से सवाल पूछने, सुविधा में मदद पाने या यह टूर फिर से शुरू करने के लिए इसे टैप करें।',
      ko: '이 버튼은 항상 여기 있습니다. Dispatch에게 질문하거나, 기능 도움을 받거나, 이 투어를 다시 시작하려면 언제든지 탭하세요.',
      tr: "Bu dugme her zaman burada. Dispatch'e soru sormak, ozellik yardimi almak veya bu turu yeniden baslatmak icin istediginiz zaman dokunun.",
      de: 'Diese Schaltflache ist immer hier. Tippen Sie jederzeit, um Dispatch eine Frage zu stellen, Hilfe zu erhalten oder diese Tour neu zu starten.',
      it: 'Questo pulsante e sempre qui. Toccalo in qualsiasi momento per fare una domanda a Dispatch, ottenere aiuto o riavviare questo tour.',
      nl: 'Deze knop is er altijd. Tik er op om Dispatch een vraag te stellen, hulp te krijgen of deze rondleiding opnieuw te starten.',
      ro: 'Acest buton este mereu aici. Apasa-l oricand pentru a intreba Dispatch, a obtine ajutor sau a reporni acest tur.',
      sv: 'Denna knapp finns alltid här. Tryck när som helst för att ställa en fråga till Dispatch, få hjälp med en funktion eller starta om den här guidade turen.',
    },
  },
  {
    target: 'tour-done',
    position: 'top',
    title: {
      en: "You're ready.",
      es: "Estas listo.",
      pt: "Voce esta pronto.",
      fr: "Vous etes pret.",
      ar: "انت مستعد.",
      zh: "您已准备好了。",
      hi: "आप तैयार हैं।",
      ko: "준비 완료.",
      tr: "Hazirsiniz.",
      de: "Sie sind bereit.",
      it: "Sei pronto.",
      nl: "U bent klaar.",
      ro: "Esti gata.",
      sv: "Du är redo.",
    },
    body: {
      en: "That's everything. To replay this tour any time, open Settings and tap Restart tour. Now go get some jobs.",
      es: "Eso es todo. Para repetir este recorrido cuando quieras, abre Configuracion y toca Reiniciar recorrido. Ahora ve a conseguir trabajos.",
      pt: "E isso. Para refazer este tour quando quiser, abra Configuracoes e toque em Reiniciar tour. Agora va conseguir trabalhos.",
      fr: "C'est tout. Pour revoir cette visite a tout moment, ouvrez Parametres et appuyez sur Relancer la visite. Maintenant, allez chercher des jobs.",
      ar: "هذا كل شيء. لاعادة هذه الجولة في اي وقت، افتح الإعدادات واضغط اعادة الجولة. الان اذهب واحصل على وظائف.",
      zh: "就这些了。想随时重看导览，打开设置并点击重新开始导览。现在去接活吧。",
      hi: "बस यही है। इस टूर को कभी भी फिर से देखने के लिए, सेटिंग्स खोलें और टूर फिर से शुरू करें पर टैप करें। अब जाएं और काम लाएं।",
      ko: "다 됐습니다. 이 투어를 언제든 다시 보려면 설정을 열고 투어 다시 시작을 탭하세요. 이제 일을 가져오세요.",
      tr: "Hepsi bu. Bu turu istediginiz zaman tekrar izlemek icin Ayarlar'i acin ve Turu yeniden baslat'a dokunun. Simdi is bulun.",
      de: "Das war alles. Um diese Tour jederzeit erneut anzusehen, offnen Sie Einstellungen und tippen Sie auf Tour neu starten. Holen Sie sich jetzt Jobs.",
      it: "E tutto. Per rivedere questo tour in qualsiasi momento, apri Impostazioni e tocca Riavvia il tour. Ora vai a prendere lavori.",
      nl: "Dat is alles. Om deze rondleiding altijd opnieuw te bekijken, open Instellingen en tik op Rondleiding herstarten. Ga nu klussen ophalen.",
      ro: "Asta e tot. Pentru a revedea acest tur oricand, deschide Setari si apasa Reia turul. Acum mergi sa obtii lucrari.",
      sv: "Det ar allt. For att se den har turen igen nar som helst, oppna Installningar och tryck pa Starta om turen. Nu ska du ga och skaffa jobb.",
    },
  },
]

export const CUSTOMER_STEPS: TourStep[] = [
  {
    target: 'tour-cp-home',
    position: 'right',
    title: {
      en: "Your home", es: "Tu inicio", pt: "Seu início", fr: "Votre accueil", ar: "صفحتك الرئيسية",
      zh: "您的主页", hi: "आपका होम", de: "Ihre Startseite", it: "La tua home", ko: "내 홈",
      nl: "Uw home", ro: "Pagina ta principală", sv: "Din startsida", tr: "Ana sayfanız",
    },
    body: {
      en: "This is your portal home. Your next appointment and quick links to everything live right here.",
      es: "Esta es la página principal de tu portal. Tu próxima cita y accesos rápidos a todo están aquí.",
      pt: "Esta é a página inicial do seu portal. Seu próximo agendamento e atalhos para tudo ficam aqui.",
      fr: "Voici l'accueil de votre portail. Votre prochain rendez-vous et des raccourcis vers tout sont ici.",
      ar: "هذه هي الصفحة الرئيسية لبوابتك. موعدك القادم وروابط سريعة لكل شيء موجودة هنا.",
      zh: "这是您的门户主页。您的下一个预约和各项快捷入口都在这里。",
      hi: "यह आपके पोर्टल का होम है। आपकी अगली अपॉइंटमेंट और हर चीज़ के त्वरित लिंक यहीं हैं।",
      de: "Das ist die Startseite Ihres Portals. Ihr nächster Termin und schnelle Links zu allem sind hier.",
      it: "Questa è la home del tuo portale. Il tuo prossimo appuntamento e i collegamenti rapidi a tutto sono qui.",
      ko: "포털 홈입니다. 다음 예약과 모든 기능으로의 빠른 링크가 여기에 있습니다.",
      nl: "Dit is de home van uw portaal. Uw volgende afspraak en snelle links naar alles staan hier.",
      ro: "Aceasta este pagina principală a portalului tău. Următoarea ta programare și linkuri rapide către tot sunt aici.",
      sv: "Det här är din portalstartsida. Din nästa bokning och snabblänkar till allt finns här.",
      tr: "Bu, portalınızın ana sayfasıdır. Bir sonraki randevunuz ve her şeye hızlı bağlantılar burada.",
    },
  },
  {
    target: 'tour-cp-jobs',
    position: 'right',
    title: {
      en: "My Jobs", es: "Mis trabajos", pt: "Meus trabalhos", fr: "Mes travaux", ar: "وظائفي",
      zh: "我的工作", hi: "मेरे काम", de: "Meine Jobs", it: "I miei lavori", ko: "내 작업",
      nl: "Mijn klussen", ro: "Lucrările mele", sv: "Mina jobb", tr: "İşlerim",
    },
    body: {
      en: "Every job you have booked, upcoming and past. Open one to see the details, track your Pro live on the way, and leave a review when it is done.",
      es: "Cada trabajo que has reservado, próximo y pasado. Abre uno para ver los detalles, seguir a tu Pro en vivo y dejar una reseña al terminar.",
      pt: "Cada trabalho que você agendou, próximo e passado. Abra um para ver os detalhes, acompanhar seu Pro ao vivo e deixar uma avaliação ao concluir.",
      fr: "Chaque travail que vous avez réservé, à venir et passé. Ouvrez-en un pour voir les détails, suivre votre Pro en direct et laisser un avis une fois terminé.",
      ar: "كل وظيفة حجزتها، القادمة والسابقة. افتح واحدة لرؤية التفاصيل وتتبع الـ Pro مباشرة وترك تقييم عند الانتهاء.",
      zh: "您预约的每项工作，包括即将到来和过往的。打开任一项可查看详情、实时追踪您的 Pro，并在完成后留下评价。",
      hi: "आपके द्वारा बुक किया गया हर काम, आगामी और पिछला। विवरण देखने, अपने Pro को लाइव ट्रैक करने और पूरा होने पर समीक्षा देने के लिए कोई एक खोलें।",
      de: "Jeder von Ihnen gebuchte Job, anstehend und vergangen. Öffnen Sie einen, um die Details zu sehen, Ihren Pro live zu verfolgen und nach Abschluss eine Bewertung abzugeben.",
      it: "Ogni lavoro che hai prenotato, in programma e passato. Aprine uno per vedere i dettagli, seguire il tuo Pro in tempo reale e lasciare una recensione al termine.",
      ko: "예약한 모든 작업, 예정과 지난 작업. 하나를 열어 세부 정보를 보고, Pro를 실시간으로 추적하고, 완료 후 리뷰를 남기세요.",
      nl: "Elke klus die u heeft geboekt, aankomend en eerder. Open er een om de details te zien, uw Pro live te volgen en een review achter te laten als het klaar is.",
      ro: "Fiecare lucrare pe care ai rezervat-o, viitoare și anterioară. Deschide una pentru a vedea detaliile, a urmări Pro live și a lăsa o recenzie la final.",
      sv: "Varje jobb du har bokat, kommande och tidigare. Öppna ett för att se detaljerna, följa din Pro live och lämna ett omdöme när det är klart.",
      tr: "Rezerve ettiğiniz her iş, yaklaşan ve geçmiş. Ayrıntıları görmek, Pro'nuzu canlı takip etmek ve tamamlandığında değerlendirme bırakmak için birini açın.",
    },
  },
  {
    target: 'tour-cp-invoices',
    position: 'right',
    title: {
      en: "My Invoices", es: "Mis facturas", pt: "Minhas faturas", fr: "Mes factures", ar: "فواتيري",
      zh: "我的发票", hi: "मेरे चालान", de: "Meine Rechnungen", it: "Le mie fatture", ko: "내 청구서",
      nl: "Mijn facturen", ro: "Facturile mele", sv: "Mina fakturor", tr: "Faturalarım",
    },
    body: {
      en: "See what you owe and your full payment history. Each invoice shows the amount, the due date, and a way to pay.",
      es: "Mira lo que debes y todo tu historial de pagos. Cada factura muestra el importe, la fecha de vencimiento y cómo pagar.",
      pt: "Veja o que você deve e todo o seu histórico de pagamentos. Cada fatura mostra o valor, a data de vencimento e como pagar.",
      fr: "Voyez ce que vous devez et tout votre historique de paiement. Chaque facture indique le montant, l'échéance et un moyen de payer.",
      ar: "شاهد ما عليك دفعه وسجل مدفوعاتك الكامل. تعرض كل فاتورة المبلغ وتاريخ الاستحقاق وطريقة الدفع.",
      zh: "查看您的应付金额和完整付款记录。每张发票显示金额、到期日和付款方式。",
      hi: "देखें कि आप पर कितना बकाया है और आपका पूरा भुगतान इतिहास। हर चालान राशि, देय तिथि और भुगतान का तरीका दिखाता है।",
      de: "Sehen Sie, was Sie schulden, und Ihren gesamten Zahlungsverlauf. Jede Rechnung zeigt den Betrag, das Fälligkeitsdatum und eine Zahlungsmöglichkeit.",
      it: "Guarda quanto devi e tutto lo storico dei pagamenti. Ogni fattura mostra l'importo, la scadenza e un modo per pagare.",
      ko: "미납 금액과 전체 결제 내역을 확인하세요. 각 청구서에는 금액, 마감일, 결제 방법이 표시됩니다.",
      nl: "Zie wat u verschuldigd bent en uw volledige betalingsgeschiedenis. Elke factuur toont het bedrag, de vervaldatum en een manier om te betalen.",
      ro: "Vezi cât ai de plată și întregul tău istoric de plăți. Fiecare factură arată suma, data scadentă și o modalitate de plată.",
      sv: "Se vad du är skyldig och hela din betalningshistorik. Varje faktura visar beloppet, förfallodatumet och ett sätt att betala.",
      tr: "Borcunuzu ve tüm ödeme geçmişinizi görün. Her fatura tutarı, son ödeme tarihini ve bir ödeme yolunu gösterir.",
    },
  },
  {
    target: 'tour-cp-pay',
    position: 'top',
    title: {
      en: "Pay in one tap", es: "Paga con un toque", pt: "Pague com um toque", fr: "Payez en un geste", ar: "ادفع بنقرة واحدة",
      zh: "一键支付", hi: "एक टैप में भुगतान करें", de: "Mit einem Tippen bezahlen", it: "Paga con un tocco", ko: "한 번에 결제",
      nl: "Betaal met één tik", ro: "Plătește dintr-o atingere", sv: "Betala med ett tryck", tr: "Tek dokunuşla ödeyin",
    },
    body: {
      en: "When an invoice is due, tap Pay to settle it securely online. You get a receipt the moment it goes through.",
      es: "Cuando una factura esté pendiente, toca Pagar para liquidarla de forma segura en línea. Recibes un comprobante en cuanto se procesa.",
      pt: "Quando uma fatura estiver pendente, toque em Pagar para quitá-la com segurança online. Você recebe um comprovante assim que for processado.",
      fr: "Lorsqu'une facture est due, appuyez sur Payer pour la régler en ligne en toute sécurité. Vous recevez un reçu dès qu'elle est traitée.",
      ar: "عندما تكون هناك فاتورة مستحقة، اضغط ادفع لتسويتها بأمان عبر الإنترنت. تحصل على إيصال فور إتمام العملية.",
      zh: "当发票到期时，点击支付即可在线安全结清。处理完成后您会立即收到收据。",
      hi: "जब कोई चालान देय हो, तो इसे ऑनलाइन सुरक्षित रूप से चुकाने के लिए भुगतान करें पर टैप करें। प्रोसेस होते ही आपको रसीद मिल जाती है।",
      de: "Wenn eine Rechnung fällig ist, tippen Sie auf Bezahlen, um sie sicher online zu begleichen. Sie erhalten sofort nach der Verarbeitung eine Quittung.",
      it: "Quando una fattura è in scadenza, tocca Paga per saldarla online in modo sicuro. Ricevi una ricevuta nel momento in cui il pagamento va a buon fine.",
      ko: "청구서가 마감되면 결제를 탭하여 온라인에서 안전하게 정산하세요. 처리되는 즉시 영수증을 받습니다.",
      nl: "Wanneer een factuur vervalt, tikt u op Betalen om deze veilig online te voldoen. U krijgt direct een bon zodra de betaling is verwerkt.",
      ro: "Când o factură este scadentă, apasă Plătește pentru a o achita în siguranță online. Primești o chitanță în momentul în care plata este procesată.",
      sv: "När en faktura förfaller trycker du på Betala för att betala den säkert online. Du får ett kvitto i samma stund som betalningen går igenom.",
      tr: "Bir faturanın ödeme zamanı geldiğinde, çevrimiçi güvenle ödemek için Öde'ye dokunun. İşlem tamamlanır tamamlanmaz bir makbuz alırsınız.",
    },
  },
  {
    target: 'tour-cp-done',
    position: 'top',
    title: {
      en: "You're all set", es: "Todo listo", pt: "Tudo pronto", fr: "Tout est prêt", ar: "كل شيء جاهز",
      zh: "一切就绪", hi: "सब तैयार है", de: "Alles bereit", it: "Tutto pronto", ko: "준비 완료",
      nl: "Helemaal klaar", ro: "Totul e gata", sv: "Allt är klart", tr: "Her şey hazır",
    },
    body: {
      en: "That's the tour. Your Pro will keep you posted at every step. Welcome aboard.",
      es: "Eso es todo el recorrido. Tu Pro te mantendrá informado en cada paso. Bienvenido.",
      pt: "Esse é o tour. Seu Pro vai te manter informado em cada etapa. Boas-vindas.",
      fr: "Voilà pour la visite. Votre Pro vous tiendra informé à chaque étape. Bienvenue.",
      ar: "هذه هي الجولة. سيبقيك الـ Pro على اطلاع في كل خطوة. مرحبا بك.",
      zh: "导览到此结束。您的 Pro 会在每一步让您随时了解进展。欢迎加入。",
      hi: "यह रहा पूरा टूर। आपका Pro हर कदम पर आपको अपडेट रखेगा। आपका स्वागत है।",
      de: "Das war die Tour. Ihr Pro hält Sie bei jedem Schritt auf dem Laufenden. Willkommen.",
      it: "Questo è il tour. Il tuo Pro ti terrà aggiornato a ogni passo. Benvenuto.",
      ko: "투어가 끝났습니다. Pro가 모든 단계에서 소식을 전해드립니다. 환영합니다.",
      nl: "Dat was de rondleiding. Uw Pro houdt u bij elke stap op de hoogte. Welkom.",
      ro: "Acesta a fost turul. Pro-ul tău te va ține la curent la fiecare pas. Bun venit.",
      sv: "Det var rundturen. Din Pro håller dig uppdaterad i varje steg. Välkommen.",
      tr: "Tur bu kadar. Pro'nuz her adımda sizi bilgilendirecek. Aramıza hoş geldiniz.",
    },
  },
]

interface Props {
  userId: string
  onComplete: () => void
  steps?: TourStep[]
}

export default function TourOverlay({ userId, onComplete, steps = PRO_STEPS }: Props) {
  const { lang } = useLang()
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [saving, setSaving] = useState(false)

  const current = steps[step]

  const measureTarget = useCallback(() => {
    const el = document.querySelector(`[data-tour="${current.target}"]`)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [current.target])

  useEffect(() => {
    measureTarget()
    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, true)
    return () => {
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  }, [measureTarget])

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      tour_completed: true,
      tour_completed_at: new Date().toISOString(),
    }).eq('id', userId)
    setSaving(false)
    onComplete()
  }

  function next() {
    if (step < steps.length - 1) setStep(s => s + 1)
    else finish()
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  const title = current.title[lang] || current.title.en
  const body = current.body[lang] || current.body.en

  // Tooltip position calculation
  const TOOLTIP_W = 280
  const TOOLTIP_H = 180
  const PAD = 16

  function tooltipStyle(): React.CSSProperties {
    if (!targetRect) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    const pos = current.position
    if (pos === 'right') {
      return {
        position: 'fixed',
        top: Math.min(targetRect.top, window.innerHeight - TOOLTIP_H - PAD),
        left: targetRect.right + PAD,
      }
    }
    if (pos === 'left') {
      return {
        position: 'fixed',
        top: Math.min(targetRect.top, window.innerHeight - TOOLTIP_H - PAD),
        left: targetRect.left - TOOLTIP_W - PAD,
      }
    }
    if (pos === 'bottom') {
      return {
        position: 'fixed',
        top: targetRect.bottom + PAD,
        left: Math.min(targetRect.left, window.innerWidth - TOOLTIP_W - PAD),
      }
    }
    // top
    return {
      position: 'fixed',
      top: targetRect.top - TOOLTIP_H - PAD,
      left: Math.min(targetRect.left, window.innerWidth - TOOLTIP_W - PAD),
    }
  }

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white"/>
              {targetRect && (
                <rect
                  x={targetRect.left - 6}
                  y={targetRect.top - 6}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="10"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.72)"
            mask="url(#tour-mask)"
          />
        </svg>
        {/* Spotlight border glow */}
        {targetRect && (
          <div
            style={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              borderRadius: 10,
              border: '2px solid rgba(245,197,24,0.6)',
              boxShadow: '0 0 0 4px rgba(245,197,24,0.08)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      {/* Tooltip card */}
      <div
        style={{ ...tooltipStyle(), width: TOOLTIP_W, zIndex: 70 }}
        className="bg-[#131C28] border border-white/10 rounded-2xl shadow-2xl p-5"
      >
        {/* Dispatch badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <Zap size={9} className="text-yellow-400"/>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-yellow-400/60">Dispatch</span>
          <span className="ml-auto font-mono text-[9px] text-white/20">{step + 1} / {steps.length}</span>
        </div>
        <div className="text-white font-semibold text-sm mb-1.5">{title}</div>
        <div className="text-white/50 text-xs leading-relaxed font-mono mb-4">{body}</div>
        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-yellow-400' : 'bg-white/10'}`}/>
          ))}
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button onClick={prev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all text-xs font-mono">
              <ChevronLeft size={12}/> Back
            </button>
          )}
          <button onClick={next} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400 text-black font-semibold text-xs py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-40">
            {step === steps.length - 1
              ? (saving ? 'Saving...' : 'Done')
              : (<>Next <ChevronRight size={12}/></>)
            }
          </button>
          <button onClick={finish} disabled={saving}
            className="p-1.5 rounded-lg text-white/20 hover:text-white/50 transition-colors">
            <X size={14}/>
          </button>
        </div>
      </div>
    </>
  )
}

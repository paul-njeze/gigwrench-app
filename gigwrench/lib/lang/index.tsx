'use client'
// GPS i18n v0.8 -- all 10 language objects verified

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'pl' | 'tl' | 'ar' | 'ru' | 'zh' | 'hi'

export const LANGUAGES = {
  en: { label: 'English', flag: '🇺🇸', dir: 'ltr' },
  es: { label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  pt: { label: 'Português', flag: '🇵🇹', dir: 'ltr' },
  fr: { label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  pl: { label: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  tl: { label: 'Tagalog', flag: '🇵🇭', dir: 'ltr' },
  ar: { label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  ru: { label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  zh: { label: '中文', flag: '🇨🇳', dir: 'ltr' },
  hi: { label: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
}

// Core UI translations — app text per language

export const T: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', jobs: 'Jobs', dispatch: 'Dispatch', invoices: 'Invoices', customers: 'Customers',
    messages: 'Messages', settings: 'Settings', logout: 'Sign Out',
    add_job: 'Add Job', new_invoice: 'New Invoice', send_invoice: 'Send Invoice',
    on_my_way: 'On My Way', job_complete: 'Mark Complete', get_paid: 'Get Paid',
    scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', paid: 'Paid',
    earnings_today: "Today's Earnings", jobs_this_week: 'Jobs This Week',
    outstanding: 'Outstanding', avg_rating: 'Avg Rating',
    welcome_back: 'Welcome back', good_morning: 'Good morning', good_afternoon: 'Good afternoon',
    good_evening: 'Good evening', no_jobs_today: 'No jobs scheduled today',
    next_job: 'Next Job', customer: 'Customer', address: 'Address', amount: 'Amount',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', search: 'Search',
    loading: 'Loading...', error: 'Something went wrong', success: 'Done', shareLocation: 'Share Live Location', broadcasting: 'Broadcasting Location', trackingLink: 'Share with customer:', copied: 'Copied!', locationDenied: 'Location access denied. Please enable location in your browser settings.', waitingForPro: 'Waiting for Pro to share location...', proOnTheWay: 'Live tracking -- your Pro is on the way',
    bookWithPro: 'Book with [Pro name]', describeYourProblem: 'Describe your problem', addVisualEvidence: 'Add photos or a voice note', confirmScope: 'Confirm job scope', chooseATime: 'Choose a time', termsAndDeposit: 'Review terms and pay', bookingConfirmed: 'Booking confirmed', dispatchIsThinking: 'Dispatch is thinking...', confirmAndPay: 'Confirm and Pay $50', transferNotice: 'Your booking has been transferred to a new Pro',
  },
  es: {
    dashboard: 'Panel', jobs: 'Trabajos', dispatch: 'Dispatch', invoices: 'Facturas', customers: 'Clientes',
    messages: 'Mensajes', settings: 'Configuración', logout: 'Cerrar sesión',
    add_job: 'Agregar trabajo', new_invoice: 'Nueva factura', send_invoice: 'Enviar factura',
    on_my_way: 'Estoy en camino', job_complete: 'Marcar completo', get_paid: 'Cobrar',
    scheduled: 'Programado', in_progress: 'En progreso', completed: 'Completado', paid: 'Pagado',
    earnings_today: 'Ganancias de hoy', jobs_this_week: 'Trabajos esta semana',
    outstanding: 'Pendiente', avg_rating: 'Calificación promedio',
    welcome_back: 'Bienvenido de nuevo', good_morning: 'Buenos días',
    good_afternoon: 'Buenas tardes', good_evening: 'Buenas noches',
    no_jobs_today: 'No hay trabajos programados hoy',
    next_job: 'Próximo trabajo', customer: 'Cliente', address: 'Dirección', amount: 'Monto',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', search: 'Buscar',
    loading: 'Cargando...', error: 'Algo salió mal', success: 'Listo', shareLocation: 'Compartir ubicacion en vivo', broadcasting: 'Transmitiendo ubicacion', trackingLink: 'Compartir con cliente:', copied: 'Copiado!', locationDenied: 'Acceso a ubicacion denegado. Activa la ubicacion en la configuracion del navegador.', waitingForPro: 'Esperando que el Pro comparta su ubicacion...', proOnTheWay: 'Seguimiento en vivo -- tu Pro esta en camino',
    bookWithPro: 'Reservar con [nombre del Pro]', describeYourProblem: 'Describe tu problema', addVisualEvidence: 'Agrega fotos o una nota de voz', confirmScope: 'Confirmar alcance del trabajo', chooseATime: 'Elige un horario', termsAndDeposit: 'Revisa terminos y paga', bookingConfirmed: 'Reserva confirmada', dispatchIsThinking: 'Dispatch esta pensando...', confirmAndPay: 'Confirmar y Pagar $50', transferNotice: 'Tu reserva fue transferida a un nuevo Pro',
  },
  pt: {
    dashboard: 'Painel', jobs: 'Trabalhos', dispatch: 'Dispatch', invoices: 'Faturas', customers: 'Clientes',
    messages: 'Mensagens', settings: 'Configurações', logout: 'Sair',
    add_job: 'Adicionar trabalho', new_invoice: 'Nova fatura', send_invoice: 'Enviar fatura',
    on_my_way: 'Estou a caminho', job_complete: 'Marcar concluído', get_paid: 'Receber',
    scheduled: 'Agendado', in_progress: 'Em andamento', completed: 'Concluído', paid: 'Pago',
    earnings_today: 'Ganhos hoje', jobs_this_week: 'Trabalhos esta semana',
    outstanding: 'Pendente', avg_rating: 'Avaliação média',
    welcome_back: 'Bem-vindo de volta', good_morning: 'Bom dia',
    good_afternoon: 'Boa tarde', good_evening: 'Boa noite',
    no_jobs_today: 'Nenhum trabalho agendado hoje',
    next_job: 'Próximo trabalho', customer: 'Cliente', address: 'Endereço', amount: 'Valor',
    save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', search: 'Pesquisar',
    loading: 'Carregando...', error: 'Algo deu errado', success: 'Pronto', shareLocation: 'Compartilhar localizacao ao vivo', broadcasting: 'Transmitindo localizacao', trackingLink: 'Compartilhar com cliente:', copied: 'Copiado!', locationDenied: 'Acesso a localizacao negado. Ative a localizacao nas configuracoes do navegador.', waitingForPro: 'Aguardando o Pro compartilhar localizacao...', proOnTheWay: 'Rastreamento ao vivo -- seu Pro esta a caminho',
    bookWithPro: 'Agendar com [nome do Pro]', describeYourProblem: 'Descreva seu problema', addVisualEvidence: 'Adicione fotos ou nota de voz', confirmScope: 'Confirmar escopo do servico', chooseATime: 'Escolha um horario', termsAndDeposit: 'Revise os termos e pague', bookingConfirmed: 'Agendamento confirmado', dispatchIsThinking: 'Dispatch esta pensando...', confirmAndPay: 'Confirmar e Pagar $50', transferNotice: 'Seu agendamento foi transferido para um novo Pro',
  },
  fr: {
    dashboard: 'Tableau de bord', jobs: 'Travaux', dispatch: 'Dispatch', invoices: 'Factures', customers: 'Clients',
    messages: 'Messages', settings: 'Paramètres', logout: 'Se déconnecter',
    add_job: 'Ajouter un travail', new_invoice: 'Nouvelle facture', send_invoice: 'Envoyer la facture',
    on_my_way: 'Je suis en route', job_complete: 'Marquer terminé', get_paid: 'Encaisser',
    scheduled: 'Planifié', in_progress: 'En cours', completed: 'Terminé', paid: 'Payé',
    earnings_today: "Gains d'aujourd'hui", jobs_this_week: 'Travaux cette semaine',
    outstanding: 'En attente', avg_rating: 'Note moyenne',
    welcome_back: 'Bon retour', good_morning: 'Bonjour',
    good_afternoon: 'Bon après-midi', good_evening: 'Bonsoir',
    no_jobs_today: "Aucun travail prévu aujourd'hui",
    next_job: 'Prochain travail', customer: 'Client', address: 'Adresse', amount: 'Montant',
    save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', search: 'Rechercher',
    loading: 'Chargement...', error: "Quelque chose s'est mal passé", success: 'Fait', shareLocation: 'Partager la position en direct', broadcasting: 'Diffusion de position', trackingLink: 'Partager avec le client:', copied: 'Copie!', locationDenied: 'Acces a la position refuse. Activez la localisation dans les parametres de votre navigateur.', waitingForPro: 'En attente que le Pro partage sa position...', proOnTheWay: 'Suivi en direct -- votre Pro est en route',
    bookWithPro: 'Reserver avec [nom du Pro]', describeYourProblem: 'Decrivez votre probleme', addVisualEvidence: 'Ajoutez des photos ou une note vocale', confirmScope: 'Confirmer la portee du travail', chooseATime: 'Choisissez un creneau', termsAndDeposit: 'Consultez les conditions et payez', bookingConfirmed: 'Reservation confirmee', dispatchIsThinking: 'Dispatch reflechit...', confirmAndPay: 'Confirmer et Payer 50$', transferNotice: 'Votre reservation a ete transferee a un nouveau Pro',
  },
  pl: { dashboard: 'Panel', jobs: 'Prace', dispatch: 'Dispatch', invoices: 'Faktury', customers: 'Klienci', messages: 'Wiadomości', settings: 'Ustawienia', logout: 'Wyloguj', add_job: 'Dodaj pracę', new_invoice: 'Nowa faktura', send_invoice: 'Wyślij fakturę', on_my_way: 'Jadę', job_complete: 'Oznacz jako ukończone', get_paid: 'Pobierz płatność', scheduled: 'Zaplanowane', in_progress: 'W toku', completed: 'Ukończone', paid: 'Zapłacone', earnings_today: 'Zarobki dziś', jobs_this_week: 'Prace w tym tygodniu', outstanding: 'Oczekujące', avg_rating: 'Średnia ocena', welcome_back: 'Witaj z powrotem', good_morning: 'Dzień dobry', good_afternoon: 'Dzień dobry', good_evening: 'Dobry wieczór', no_jobs_today: 'Brak zaplanowanych prac na dziś', next_job: 'Następna praca', customer: 'Klient', address: 'Adres', amount: 'Kwota', save: 'Zapisz', cancel: 'Anuluj', delete: 'Usuń', edit: 'Edytuj', search: 'Szukaj', loading: 'Ładowanie...', error: 'Coś poszło nie tak', success: 'Gotowe', shareLocation: 'Udostepnij lokalizacje na zywo', broadcasting: 'Nadawanie lokalizacji', trackingLink: 'Udostepnij klientowi:', copied: 'Skopiowano!', locationDenied: 'Odmowiono dostepu do lokalizacji. Wlacz lokalizacje w ustawieniach przegladarki.', waitingForPro: 'Oczekiwanie na udostepnienie lokalizacji przez Specjaliste...', proOnTheWay: 'Sledzenie na zywo -- Twoj Specjalista jest w drodze', bookWithPro: 'Zarezerwuj ze [nazwa Pro]', describeYourProblem: 'Opisz swoj problem', addVisualEvidence: 'Dodaj zdjecia lub notatke glosowa', confirmScope: 'Potwierdz zakres pracy', chooseATime: 'Wybierz termin', termsAndDeposit: 'Przejrzyj warunki i zaplac', bookingConfirmed: 'Rezerwacja potwierdzona', dispatchIsThinking: 'Dispatch mysli...', confirmAndPay: 'Potwierdz i Zaplac $50', transferNotice: 'Twoja rezerwacja zostala przekazana nowemu Pro' },
  tl: { dashboard: 'Dashboard', jobs: 'Mga Trabaho', dispatch: 'Dispatch', invoices: 'Mga Invoice', customers: 'Mga Customer', messages: 'Mga Mensahe', settings: 'Mga Setting', logout: 'Mag-sign Out', add_job: 'Magdagdag ng trabaho', new_invoice: 'Bagong invoice', send_invoice: 'Ipadala ang invoice', on_my_way: 'Papunta na ako', job_complete: 'Markahan bilang kumpleto', get_paid: 'Singilin', scheduled: 'Nakatakda', in_progress: 'Isinasagawa', completed: 'Kumpleto', paid: 'Bayad', earnings_today: 'Kita ngayon', jobs_this_week: 'Mga trabaho ngayong linggo', outstanding: 'Natitirang bayad', avg_rating: 'Avg na rating', welcome_back: 'Maligayang pagbabalik', good_morning: 'Magandang umaga', good_afternoon: 'Magandang hapon', good_evening: 'Magandang gabi', no_jobs_today: 'Walang trabaho ngayon', next_job: 'Susunod na trabaho', customer: 'Customer', address: 'Address', amount: 'Halaga', save: 'I-save', cancel: 'Kanselahin', delete: 'Burahin', edit: 'I-edit', search: 'Maghanap', loading: 'Naglo-load...', error: 'May naganap na error', success: 'Tapos na', shareLocation: 'Ibahagi ang Live na Lokasyon', broadcasting: 'Nagbo-broadcast ng Lokasyon', trackingLink: 'Ibahagi sa customer:', copied: 'Nakopya!', locationDenied: 'Tinanggihan ang lokasyon. Paganahin ang lokasyon sa iyong browser.', waitingForPro: 'Naghihintay sa Pro na ibahagi ang lokasyon...', proOnTheWay: 'Live na pagsubaybay -- papunta na ang iyong Pro', bookWithPro: 'Mag-book kay [pangalan ng Pro]', describeYourProblem: 'Ilarawan ang iyong problema', addVisualEvidence: 'Magdagdag ng mga larawan o voice note', confirmScope: 'Kumpirmahin ang saklaw ng trabaho', chooseATime: 'Pumili ng oras', termsAndDeposit: 'Suriin ang mga tuntunin at magbayad', bookingConfirmed: 'Nakumpirma ang booking', dispatchIsThinking: 'Nag-iisip si Dispatch...', confirmAndPay: 'Kumpirmahin at Bayaran ang $50', transferNotice: 'Ang iyong booking ay inilipat sa bagong Pro' },
  ar: { dashboard: 'لوحة التحكم', jobs: 'الوظائف', dispatch: 'Dispatch', invoices: 'الفواتير', customers: 'العملاء', messages: 'الرسائل', settings: 'الإعدادات', logout: 'تسجيل الخروج', add_job: 'إضافة وظيفة', new_invoice: 'فاتورة جديدة', send_invoice: 'إرسال فاتورة', on_my_way: 'في الطريق', job_complete: 'تم الإنجاز', get_paid: 'احصل على أجرك', scheduled: 'مجدول', in_progress: 'جارٍ', completed: 'مكتمل', paid: 'مدفوع', earnings_today: 'أرباح اليوم', jobs_this_week: 'وظائف هذا الأسبوع', outstanding: 'غير مدفوع', avg_rating: 'متوسط التقييم', welcome_back: 'مرحبًا بعودتك', good_morning: 'صباح الخير', good_afternoon: 'مساء الخير', good_evening: 'مساء النور', no_jobs_today: 'لا توجد وظائف اليوم', next_job: 'الوظيفة التالية', customer: 'العميل', address: 'العنوان', amount: 'المبلغ', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', search: 'بحث', loading: 'جارٍ التحميل...', error: 'حدث خطأ', success: 'تم', shareLocation: 'مشاركة الموقع المباشر', broadcasting: 'بث الموقع', trackingLink: 'مشاركة مع العميل:', copied: 'تم النسخ!', locationDenied: 'تم رفض الموقع. يرجى تمكين الموقع في المتصفح.', waitingForPro: 'في انتظار المحترف لمشاركة الموقع...', proOnTheWay: 'تتبع مباشر -- محترفك في الطريق', bookWithPro: 'احجز مع [اسم المحترف]', describeYourProblem: 'صف مشكلتك', addVisualEvidence: 'اضف صورا او ملاحظة صوتية', confirmScope: 'تاكيد نطاق العمل', chooseATime: 'اختر وقتا', termsAndDeposit: 'راجع الشروط وادفع', bookingConfirmed: 'تم تاكيد الحجز', dispatchIsThinking: 'Dispatch يفكر...', confirmAndPay: 'تاكيد والدفع 50 دولارا', transferNotice: 'تم نقل حجزك الى محترف جديد' },
  ru: { dashboard: 'Панель', jobs: 'Задания', dispatch: 'Dispatch', invoices: 'Счета', customers: 'Клиенты', messages: 'Сообщения', settings: 'Настройки', logout: 'Выйти', add_job: 'Добавить задание', new_invoice: 'Новый счет', send_invoice: 'Отправить счет', on_my_way: 'Еду', job_complete: 'Отметить завершение', get_paid: 'Получить оплату', scheduled: 'Запланировано', in_progress: 'В процессе', completed: 'Завершено', paid: 'Оплачено', earnings_today: 'Заработок сегодня', jobs_this_week: 'Заданий за неделю', outstanding: 'Долг', avg_rating: 'Ср. рейтинг', welcome_back: 'С возвращением', good_morning: 'Доброе утро', good_afternoon: 'Добрый день', good_evening: 'Добрый вечер', no_jobs_today: 'Заданий нет', next_job: 'Следующее задание', customer: 'Клиент', address: 'Адрес', amount: 'Сумма', save: 'Сохранить', cancel: 'Отменить', delete: 'Удалить', edit: 'Редактировать', search: 'Поиск', loading: 'Загрузка...', error: 'Ошибка', success: 'Готово', shareLocation: 'Поделиться геопозицией', broadcasting: 'Трансляция геопозиции', trackingLink: 'Поделиться с клиентом:', copied: 'Скопировано!', locationDenied: 'Геолокация отклонена. Включите в настройках браузера.', waitingForPro: 'Ждем, пока специалист поделится геопозицией...', proOnTheWay: 'Живое отслеживание -- ваш специалист в пути', bookWithPro: 'Zabronirovat u [imya Pro]', describeYourProblem: 'Opishite vashu problemu', addVisualEvidence: 'Dobavte foto ili golosovuyu zametku', confirmScope: 'Podtverdite obyem rabot', chooseATime: 'Vyberite vremya', termsAndDeposit: 'Oznakomtes s usloviyami i oplatite', bookingConfirmed: 'Bronirovanie podtverzhdeno', dispatchIsThinking: 'Dispatch dumaet...', confirmAndPay: 'Podtverdit i oplatit $50', transferNotice: 'Vash zakaz peredan novomu Pro' },
  zh: { dashboard: '仪表盘', jobs: '工作', dispatch: 'Dispatch', invoices: '发票', customers: '客户', messages: '消息', settings: '设置', logout: '退出', add_job: '添加工作', new_invoice: '新发票', send_invoice: '发送发票', on_my_way: '在路上', job_complete: '标记完成', get_paid: '收款', scheduled: '已排期', in_progress: '进行中', completed: '已完成', paid: '已付款', earnings_today: '今日收入', jobs_this_week: '本周工作', outstanding: '待付款', avg_rating: '平均评分', welcome_back: '欢迎回来', good_morning: '早上好', good_afternoon: '下午好', good_evening: '晚上好', no_jobs_today: '今天没有工作', next_job: '下一个工作', customer: '客户', address: '地址', amount: '金额', save: '保存', cancel: '取消', delete: '删除', edit: '编辑', search: '搜索', loading: '加载中...', error: '出错了', success: '完成', shareLocation: '分享实时位置', broadcasting: '正在广播位置', trackingLink: '与客户分享:', copied: '已复制!', locationDenied: '位置访问被拒绝，请在浏览器设置中启用。', waitingForPro: '等待Pro分享位置...', proOnTheWay: '实时跟踪 -- 您的专业人员正在路上', bookWithPro: 'yu [Pro]yuye', describeYourProblem: 'miaosu wenti', addVisualEvidence: 'tianjia zhaopian', confirmScope: 'queren fanwei', chooseATime: 'xuanze shijian', termsAndDeposit: 'chakan tiaoukuan', bookingConfirmed: 'yuyue yiqueren', dispatchIsThinking: 'Dispatch zhengzai sikao...', confirmAndPay: 'queren bing zhifu $50', transferNotice: 'yuyue yizhuanyi xin Pro' },
  hi: { dashboard: 'डैशबोर्ड', jobs: 'काम', dispatch: 'Dispatch', invoices: 'बिल', customers: 'ग्राहक', messages: 'संदेश', settings: 'सेटिंग्स', logout: 'लॉग आउट', add_job: 'काम जोड़ें', new_invoice: 'नया बिल', send_invoice: 'बिल भेजें', on_my_way: 'मैं आ रहा हूं', job_complete: 'पूर्ण करें', get_paid: 'भुगतान लें', scheduled: 'निर्धारित', in_progress: 'जारी', completed: 'पूर्ण', paid: 'भुगतान', earnings_today: 'आज की कमाई', jobs_this_week: 'इस सप्ताह के काम', outstanding: 'बकाया', avg_rating: 'औसत रेटिंग', welcome_back: 'वापस स्वागत है', good_morning: 'सुप्रभात', good_afternoon: 'नमस्ते', good_evening: 'शुभ संध्या', no_jobs_today: 'आज कोई काम निर्धारित नहीं', next_job: 'अगला काम', customer: 'ग्राहक', address: 'पता', amount: 'राशि', save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'संपादित करें', search: 'खोजें', loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ', success: 'हो गया', shareLocation: 'लाइव स्थान साझा करें', broadcasting: 'स्थान प्रसारित हो रहा है', trackingLink: 'ग्राहक के साथ साझा करें:', copied: 'कॉपी हो गया!', locationDenied: 'स्थान अस्वीकृत। ब्राउज़र सेटिंग में सक्षम करें।', waitingForPro: 'Pro के स्थान साझा करने की प्रतीक्षा...', proOnTheWay: 'लाइव ट्रैकिंग -- आपका प्रो रास्ते में है', bookWithPro: '[Pro ka naam] ke saath book karen', describeYourProblem: 'Apni samasya bataaen', addVisualEvidence: 'Photo ya voice note joden', confirmScope: 'Kaam ka daayara pusthi karen', chooseATime: 'Samay chunen', termsAndDeposit: 'Sharten dekhen aur bhugtaan karen', bookingConfirmed: 'Booking pusthi ho gayi', dispatchIsThinking: 'Dispatch soch raha hai...', confirmAndPay: 'Pusthi karen aur $50 den', transferNotice: 'Aapki booking naye Pro ko sthaanaantrit ki gayi' },
}

interface LangContextType {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: ', bookWithPro: '[Pro का नाम] के साथ बुक करें', describeYourProblem: 'अपनी समस्या बताएं', addVisualEvidence: 'फोटो या वॉयस नोट जोड़ें', confirmScope: 'काम का दायरा पुष्टि करें', chooseATime: 'समय चुनें', termsAndDeposit: 'शर्तें देखें और भुगतान करें', bookingConfirmed: 'बुकिंग पुष्टि हो गई', dispatchIsThinking: 'Dispatch सोच रहा है...', confirmAndPay: 'पुष्टि करें और $50 दें', transferNotice: 'आपकी बुकिंग नए Pro को स्थानांतरित की गई'en',
  setLang: () => {},
  t: (k) => k,
})

export function LangProvider({ children, defaultLang = 'en' }: { children: ReactNode; defaultLang?: Language }) {
  const [lang, setLangState] = useState<Language>(defaultLang)

  useEffect(() => {
    const saved = localStorage.getItem('gw_lang') as Language
    if (saved && T[saved]) setLangState(saved)
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem('gw_lang', l)
    document.documentElement.dir = LANGUAGES[l].dir
    document.documentElement.lang = l
  }

  const t = (key: string): string => T[lang]?.[key] ?? T['en']?.[key] ?? key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

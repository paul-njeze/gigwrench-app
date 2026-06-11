'use client'

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
  },
  pl: { dashboard: 'Panel', jobs: 'Prace', dispatch: 'Dispatch', invoices: 'Faktury', customers: 'Klienci', messages: 'Wiadomości', settings: 'Ustawienia', logout: 'Wyloguj', add_job: 'Dodaj pracę', new_invoice: 'Nowa faktura', send_invoice: 'Wyślij fakturę', on_my_way: 'Jadę', job_complete: 'Oznacz jako ukończone', get_paid: 'Pobierz płatność', scheduled: 'Zaplanowane', in_progress: 'W toku', completed: 'Ukończone', paid: 'Zapłacone', earnings_today: 'Zarobki dziś', jobs_this_week: 'Prace w tym tygodniu', outstanding: 'Oczekujące', avg_rating: 'Średnia ocena', welcome_back: 'Witaj z powrotem', good_morning: 'Dzień dobry', good_afternoon: 'Dzień dobry', good_evening: 'Dobry wieczór', no_jobs_today: 'Brak zaplanowanych prac na dziś', next_job: 'Następna praca', customer: 'Klient', address: 'Adres', amount: 'Kwota', save: 'Zapisz', cancel: 'Anuluj', delete: 'Usuń', edit: 'Edytuj', search: 'Szukaj', loading: 'Ładowanie...', error: 'Coś poszło nie tak', success: 'Gotowe', shareLocation: 'Udostepnij lokalizacje na zywo', broadcasting: 'Nadawanie lokalizacji', trackingLink: 'Udostepnij klientowi:', copied: 'Skopiowano!', locationDenied: 'Odmowiono dostepu do lokalizacji. Wlacz lokalizacje w ustawieniach przegladarki.', waitingForPro: 'Oczekiwanie na udostepnienie lokalizacji przez Specjaliste...', proOnTheWay: 'Sledzenie na zywo -- Twoj Specjalista jest w drodze' },
  tl: { dashboard: 'Dashboard', jobs: 'Mga Trabaho', dispatch: 'Dispatch', invoices: 'Mga Invoice', customers: 'Mga Kliyente', messages: 'Mga Mensahe', settings: 'Mga Setting', logout: 'Mag-sign out', add_job: 'Magdagdag ng trabaho', new_invoice: 'Bagong invoice', send_invoice: 'Ipadala ang invoice', on_my_way: 'Papunta na ako', job_complete: 'Markahan bilang tapos', get_paid: 'Bayad', scheduled: 'Nakatakda', in_progress: 'Ginagawa', completed: 'Tapos na', paid: 'Bayad na', earnings_today: 'Kita ngayon', jobs_this_week: 'Mga trabaho ngayong linggo', outstanding: 'Hindi pa bayad', avg_rating: 'Average na rating', welcome_back: 'Maligayang pagbabalik', good_morning: 'Magandang umaga', good_afternoon: 'Magandang hapon', good_evening: 'Magandang gabi', no_jobs_today: 'Walang nakatakdang trabaho ngayon', next_job: 'Susunod na trabaho', customer: 'Kliyente', address: 'Address', amount: 'Halaga', save: 'I-save', cancel: 'Kanselahin', delete: 'Burahin', edit: 'I-edit', search: 'Maghanap', loading: 'Naglo-load...', error: 'May nangyaring mali', success: 'Tapos', shareLocation: 'Ibahagi ang Live na Lokasyon', broadcasting: 'Nagbo-broadcast ng Lokasyon', trackingLink: 'Ibahagi sa customer:', copied: 'Nakopya!', locationDenied: 'Tinanggihan ang access sa lokasyon. Pakibukas ang lokasyon sa mga setting ng iyong browser.', waitingForPro: 'Naghihintay sa Pro na ibahagi ang lokasyon...', proOnTheWay: 'Live na pagsubaybay -- papunta na ang iyong Pro' },
  ar: { dashboard: 'لوحة التحكم', jobs: 'الأعمال', dispatch: 'Dispatch', invoices: 'الفواتير', customers: 'العملاء', messages: 'الرسائل', settings: 'الإعدادات', logout: 'تسجيل الخروج', add_job: 'إضافة عمل', new_invoice: 'فاتورة جديدة', send_invoice: 'إرسال الفاتورة', on_my_way: 'في طريقي', job_complete: 'تحديد كمكتمل', get_paid: 'استلام الدفع', scheduled: 'مجدول', in_progress: 'قيد التنفيذ', completed: 'مكتمل', paid: 'مدفوع', earnings_today: 'أرباح اليوم', jobs_this_week: 'أعمال هذا الأسبوع', outstanding: 'معلق', avg_rating: 'متوسط التقييم', welcome_back: 'مرحباً بعودتك', good_morning: 'صباح الخير', good_afternoon: 'مساء الخير', good_evening: 'مساء الخير', no_jobs_today: 'لا أعمال مجدولة اليوم', next_job: 'العمل التالي', customer: 'عميل', address: 'عنوان', amount: 'المبلغ', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', search: 'بحث', loading: 'جار التحميل...', error: 'حدث خطأ ما', success: 'تم', shareLocation: 'مشاركة الموقع المباشر', broadcasting: 'بث الموقع', trackingLink: 'مشاركة مع العميل:', copied: 'تم النسخ!', locationDenied: 'تم رفض الوصول إلى الموقع. يرجى تفعيل الموقع في إعدادات المتصفح.', waitingForPro: 'في انتظار مشاركة المحترف لموقعه...', proOnTheWay: 'تتبع مباشر -- محترفك في الطريق' },
  ru: { dashboard: 'Панель', jobs: 'Работы', dispatch: 'Dispatch', invoices: 'Счета', customers: 'Клиенты', messages: 'Сообщения', settings: 'Настройки', logout: 'Выйти', add_job: 'Добавить работу', new_invoice: 'Новый счёт', send_invoice: 'Отправить счёт', on_my_way: 'Еду к вам', job_complete: 'Отметить выполненной', get_paid: 'Получить оплату', scheduled: 'Запланировано', in_progress: 'В процессе', completed: 'Выполнено', paid: 'Оплачено', earnings_today: 'Доход сегодня', jobs_this_week: 'Работы на этой неделе', outstanding: 'Ожидает оплаты', avg_rating: 'Средний рейтинг', welcome_back: 'С возвращением', good_morning: 'Доброе утро', good_afternoon: 'Добрый день', good_evening: 'Добрый вечер', no_jobs_today: 'Нет запланированных работ на сегодня', next_job: 'Следующая работа', customer: 'Клиент', address: 'Адрес', amount: 'Сумма', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Изменить', search: 'Поиск', loading: 'Загрузка...', error: 'Что-то пошло не так', success: 'Готово', shareLocation: 'Поделиться живым местоположением', broadcasting: 'Трансляция местоположения', trackingLink: 'Поделиться с клиентом:', copied: 'Скопировано!', locationDenied: 'Доступ к местоположению запрещён. Разрешите доступ к геолокации в настройках браузера.', waitingForPro: 'Ожидание передачи местоположения специалистом...', proOnTheWay: 'Живое отслеживание -- ваш специалист в пути' },
  zh: { dashboard: '仪表板', jobs: '工作', dispatch: 'Dispatch', invoices: '发票', customers: '客户', messages: '消息', settings: '设置', logout: '退出', add_job: '添加工作', new_invoice: '新发票', send_invoice: '发送发票', on_my_way: '我在路上', job_complete: '标记完成', get_paid: '收款', scheduled: '已安排', in_progress: '进行中', completed: '已完成', paid: '已付款', earnings_today: '今日收入', jobs_this_week: '本周工作', outstanding: '未付', avg_rating: '平均评分', welcome_back: '欢迎回来', good_morning: '早上好', good_afternoon: '下午好', good_evening: '晚上好', no_jobs_today: '今天没有安排工作', next_job: '下一个工作', customer: '客户', address: '地址', amount: '金额', save: '保存', cancel: '取消', delete: '删除', edit: '编辑', search: '搜索', loading: '加载中...', error: '出了点问题', success: '完成', shareLocation: '分享实时位置', broadcasting: '正在广播位置', trackingLink: '分享给客户:', copied: '已复制!', locationDenied: '位置访问被拒绝。请在浏览器设置中开启位置。', waitingForPro: '等待服务专业人员分享位置...', proOnTheWay: '实时跟踪 -- 您的专业人员正在路上' },
  hi: { dashboard: 'डैशबोर्ड', jobs: 'काम', dispatch: 'Dispatch', invoices: 'बिल', customers: 'ग्राहक', messages: 'संदेश', settings: 'सेटिंग्स', logout: 'लॉग आउट', add_job: 'काम जोड़ें', new_invoice: 'नया बिल', send_invoice: 'बिल भेजें', on_my_way: 'मैं आ रहा हूं', job_complete: 'पूर्ण करें', get_paid: 'भुगतान लें', scheduled: 'निर्धारित', in_progress: 'जारी', completed: 'पूर्ण', paid: 'भुगतान', earnings_today: 'आज की कमाई', jobs_this_week: 'इस सप्ताह के काम', outstanding: 'बकाया', avg_rating: 'औसत रेटिंग', welcome_back: 'वापस स्वागत है', good_morning: 'सुप्रभात', good_afternoon: 'नमस्ते', good_evening: 'शुभ संध्या', no_jobs_today: 'आज कोई काम निर्धारित नहीं', next_job: 'अगला काम', customer: 'ग्राहक', address: 'पता', amount: 'राशि', save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'संपादित करें', search: 'खोजें', loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ', success: 'हो गया', shareLocation: 'लाइव स्थान साझा करें', broadcasting: 'स्थान प्रसारित हो रहा है', trackingLink: 'ग्राहक के साथ साझा करें:', copied: 'कॉपी हो गया!', locationDenied: 'स्थान अनुमति अस्वीकार की गई। कृपया ब्राउज़र सेटिंग में स्थान सक्षम करें।', waitingForPro: 'प्रो के स्थान साझा करने की प्रतीक्षा...', proOnTheWay: 'लाइव ट्रैकिंग -- आपका प्रो रास्ते में है' },
}

interface LangContextType {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
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

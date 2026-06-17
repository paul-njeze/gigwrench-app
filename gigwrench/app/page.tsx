'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Zap, MapPin, Camera, MessageSquare, FileText, Users,
  BarChart2, Globe, Shield, ChevronDown, ChevronUp,
  Check, X, Star, Clock, DollarSign, Smartphone
} from 'lucide-react'

// ─── LANGUAGES ───────────────────────────────────────────────────────────────
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

// ─── COPY ─────────────────────────────────────────────────────────────────────
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
  pt: {
    pick_lang: 'Escolha seu idioma',
    pick_sub: 'GigWrench esta disponivel em 14 idiomas para Pros e clientes no mundo todo.',
    skip: 'Continuar em ingles',
    nav_signin: 'Entrar',
    nav_cta: 'Comece gratis',
    hero_h1_a: 'Gere seu negocio',
    hero_h1_b: 'como um Pro.',
    hero_sub: 'GigWrench da aos Pros autonomos ferramentas de IA para ganhar mais trabalhos, receber mais rapido e nunca perder um cliente. Tudo por $19 por mes.',
    hero_cta1: 'Comece gratis',
    hero_cta2: 'Veja como funciona',
    problem_label: 'O problema',
    problem_h2: 'Trabalhar por conta propria e dificil.',
    problem_body: 'Voce atende ligacoes enquanto trabalha. Persegue pagamentos. Perde clientes quando esta ocupado. GigWrench resolve tudo isso.',
    feat_label: 'Recursos',
    feat_h2: 'Tudo que um Pro precisa.',
    compare_label: 'Comparacao',
    compare_h2: 'Por que os Pros escolhem GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Suas perguntas respondidas.',
    faq_pro: 'Para Pros',
    faq_cust: 'Para clientes',
    app_label: 'Aplicativo',
    app_h2: 'Leve o GigWrench com voce.',
    app_sub: 'Apps nativos para Android e iOS estao chegando. Cadastre-se na web agora.',
    app_android: 'Em breve no Google Play',
    app_ios: 'Em breve na App Store',
    app_beta: 'Entre no beta na web',
    footer_tagline: 'Feito para Pros. Movido por IA.',
    footer_copy: '2026 GigWrench. Todos os direitos reservados.',
    beta_pill: 'Beta ja disponivel',
    stat_lead: 'Resposta a leads', stat_flat: 'Taxa fixa, sem comissoes', stat_langs: 'Idiomas', stat_id: 'Pros verificados', stat_pros: 'Pros autonomos nos EUA',
    table_feature: 'Recurso', coming_soon: 'Em breve',
    footer_signup: 'Cadastrar', footer_terms: 'Termos', footer_privacy: 'Privacidade', footer_contact: 'Contato',
  },
  fr: {
    pick_lang: 'Choisissez votre langue',
    pick_sub: 'GigWrench est disponible en 14 langues pour les Pros et les clients du monde entier.',
    skip: 'Continuer en anglais',
    nav_signin: 'Se connecter',
    nav_cta: 'Commencer gratuitement',
    hero_h1_a: 'Gerez votre metier',
    hero_h1_b: 'comme un Pro.',
    hero_sub: 'GigWrench donne aux Pros independants les outils IA pour gagner plus de chantiers, etre payes plus vite et ne jamais rater un client. Tout pour 19$ par mois.',
    hero_cta1: 'Commencer gratuitement',
    hero_cta2: 'Voir comment ca marche',
    problem_label: 'Le probleme',
    problem_h2: 'Travailler a son compte, c\'est dur.',
    problem_body: 'Vous repondez aux appels pendant vos chantiers. Vous relancez les clients pour etre paye. Vous perdez des leads parce que vous etes occupe. GigWrench regle tout ca.',
    feat_label: 'Fonctionnalites',
    feat_h2: 'Tout ce dont un Pro a besoin.',
    compare_label: 'Comparaison',
    compare_h2: 'Pourquoi les Pros choisissent GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Vos questions, nos reponses.',
    faq_pro: 'Pour les Pros',
    faq_cust: 'Pour les clients',
    app_label: 'Application mobile',
    app_h2: 'Emportez GigWrench partout.',
    app_sub: 'Les apps natives Android et iOS arrivent bientot. Inscrivez-vous sur le web maintenant.',
    app_android: 'Bientot sur Google Play',
    app_ios: 'Bientot sur App Store',
    app_beta: 'Rejoindre la beta sur le web',
    footer_tagline: 'Fait pour les Pros. Alimente par IA.',
    footer_copy: '2026 GigWrench. Tous droits reserves.',
    beta_pill: 'Beta disponible',
    stat_lead: 'Reponse aux leads', stat_flat: 'Tarif fixe, sans frais', stat_langs: 'Langues', stat_id: 'Pros verifies', stat_pros: 'Pros solo aux USA',
    table_feature: 'Fonctionnalite', coming_soon: 'Bientot disponible',
    footer_signup: 'Inscription', footer_terms: 'Conditions', footer_privacy: 'Confidentialite', footer_contact: 'Contact',
  },
  ar: {
    pick_lang: 'اختر لغتك',
    pick_sub: 'GigWrench متاح بـ 14 لغات للمحترفين والعملاء حول العالم.',
    skip: 'المتابعة بالإنجليزية',
    nav_signin: 'تسجيل الدخول',
    nav_cta: 'ابدأ مجانا',
    hero_h1_a: 'ادر عملك',
    hero_h1_b: 'كالمحترف.',
    hero_sub: 'GigWrench يمنح المحترفين المستقلين أدوات الذكاء الاصطناعي للفوز بمزيد من الأعمال والحصول على المدفوعات بسرعة وعدم تفويت أي عميل. كل ذلك بـ 19 دولار شهرياً.',
    hero_cta1: 'ابدأ مجانا',
    hero_cta2: 'شاهد كيف يعمل',
    problem_label: 'المشكلة',
    problem_h2: 'العمل المستقل في الحرف صعب.',
    problem_body: 'تجيب على المكالمات أثناء العمل. تطارد المدفوعات. تفقد العملاء عندما تكون مشغولاً. GigWrench يحل كل ذلك.',
    feat_label: 'الميزات',
    feat_h2: 'كل ما يحتاجه المحترف.',
    compare_label: 'مقارنة',
    compare_h2: 'لماذا يختار المحترفون GigWrench.',
    faq_label: 'الأسئلة الشائعة',
    faq_h2: 'إجابات على أسئلتك.',
    faq_pro: 'للمحترفين',
    faq_cust: 'للعملاء',
    app_label: 'تطبيق الجوال',
    app_h2: 'خذ GigWrench معك في كل مكان.',
    app_sub: 'التطبيقات الأصلية لـ Android و iOS قادمة قريباً. سجل الآن على الويب.',
    app_android: 'قريباً على Google Play',
    app_ios: 'قريباً على App Store',
    app_beta: 'انضم إلى النسخة التجريبية',
    footer_tagline: 'مبني للمحترفين. مدعوم بالذكاء الاصطناعي.',
    footer_copy: '2026 GigWrench. جميع الحقوق محفوظة.',
    beta_pill: 'النسخة التجريبية متاحة',
    stat_lead: 'الرد على العملاء المحتملين', stat_flat: 'سعر ثابت، بدون رسوم', stat_langs: 'لغات', stat_id: 'محترفون موثقون', stat_pros: 'محترفون مستقلون في أمريكا',
    table_feature: 'الميزة', coming_soon: 'قريبا',
    footer_signup: 'إنشاء حساب', footer_terms: 'الشروط', footer_privacy: 'الخصوصية', footer_contact: 'اتصل بنا',
  },
  zh: {
    pick_lang: '选择您的语言',
    pick_sub: 'GigWrench 提供 14 种语言，服务全球的专业人士和客户。',
    skip: '继续使用英语',
    nav_signin: '登录',
    nav_cta: '免费开始',
    hero_h1_a: '像专业人士一样',
    hero_h1_b: '经营您的业务。',
    hero_sub: 'GigWrench 为独立专业人士提供 AI 驱动的工具，赢得更多工作、更快收款、绝不错过客户，每月仅需 $19。',
    hero_cta1: '免费开始',
    hero_cta2: '了解如何使用',
    problem_label: '问题所在',
    problem_h2: '独自经营手艺行业很艰难。',
    problem_body: '您在工作时接听电话。追讨付款需要数周。忙碌时错过潜在客户。手写发票。GigWrench 解决了这一切。',
    feat_label: '功能',
    feat_h2: '专业人士所需的一切。',
    compare_label: '对比',
    compare_h2: '为什么专业人士选择 GigWrench。',
    faq_label: '常见问题',
    faq_h2: '解答您的问题。',
    faq_pro: '专业人士',
    faq_cust: '客户',
    app_label: '移动应用',
    app_h2: '随时随地使用 GigWrench。',
    app_sub: 'Android 和 iOS 原生应用即将推出。现在就在网页版注册。',
    app_android: '即将登陆 Google Play',
    app_ios: '即将登陆 App Store',
    app_beta: '加入网页测试版',
    footer_tagline: '为专业人士而建。由 AI 驱动。',
    footer_copy: '2026 GigWrench. 版权所有。',
    beta_pill: '测试版已上线',
    stat_lead: '潜在客户响应', stat_flat: '统一费率，无手续费', stat_langs: '种语言', stat_id: '已验证专业人士', stat_pros: '美国独立专业人士',
    table_feature: '功能', coming_soon: '即将推出',
    footer_signup: '注册', footer_terms: '条款', footer_privacy: '隐私', footer_contact: '联系',
  },
  hi: {
    pick_lang: 'Apni bhasha chunein',
    pick_sub: 'GigWrench 14 bhashaon mein uplabdh hai, duniya bhar ke Pros aur customers ke liye.',
    skip: 'Angrezi mein jaari rakhen',
    nav_signin: 'Sign in karen',
    nav_cta: 'Muft shuru karen',
    hero_h1_a: 'Apna kaam chalaye',
    hero_h1_b: 'ek Pro ki tarah.',
    hero_sub: 'GigWrench solo Pros ko AI-powered tools deta hai: zyada kaam jeeto, jaldi bhugtan pao, koi bhi lead na khayo. Sirf $19 mahine mein.',
    hero_cta1: 'Muft shuru karen',
    hero_cta2: 'Dekhen kaise kaam karta hai',
    problem_label: 'Samasya',
    problem_h2: 'Solo trade business chalana mushkil hai.',
    problem_body: 'Aap kaam ke beech calls uthate hain. Hapton bhagte hain payment ke liye. Busy hone par leads kho dete hain. GigWrench yeh sab theek karta hai.',
    feat_label: 'Features',
    feat_h2: 'Ek Pro ko jo chahiye sab kuch.',
    compare_label: 'Tulna',
    compare_h2: 'Pros GigWrench kyun chunte hain.',
    faq_label: 'FAQ',
    faq_h2: 'Aapke sawaalon ke jawab.',
    faq_pro: 'Pros ke liye',
    faq_cust: 'Customers ke liye',
    app_label: 'Mobile App',
    app_h2: 'GigWrench sath le jaiye.',
    app_sub: 'Android aur iOS ke liye native apps aa rahe hain. Abhi web par sign up karen.',
    app_android: 'Jald Google Play par',
    app_ios: 'Jald App Store par',
    app_beta: 'Web beta mein shaamil hon',
    footer_tagline: 'Pros ke liye banaya. AI se sanchaalit.',
    footer_copy: '2026 GigWrench. Sabhi adhikaar surakshit.',
    beta_pill: 'Beta ab live',
    stat_lead: 'Lead response', stat_flat: 'Flat rate, koi fees nahi', stat_langs: 'Bhashayein', stat_id: 'ID verified Pros', stat_pros: 'US solo Pros',
    table_feature: 'Feature', coming_soon: 'Jald aa raha hai',
    footer_signup: 'Sign up karen', footer_terms: 'Sharten', footer_privacy: 'Gopniyata', footer_contact: 'Sampark',
  },
  ko: {
    pick_lang: "언어를 선택하세요",
    pick_sub: "GigWrench는 전 세계 Pro와 고객을 위해 14개 언어로 제공됩니다.",
    skip: "영어로 계속하기",
    nav_signin: "로그인",
    nav_cta: "무료로 시작하기",
    hero_h1_a: "당신의 사업을",
    hero_h1_b: "프로처럼 운영하세요.",
    hero_sub: "GigWrench는 1인 Pro에게 더 많은 일감을 따내고, 더 빨리 결제받고, 고객을 놓치지 않도록 돕는 AI 도구를 제공합니다. 월 $19로 모두 이용하세요.",
    hero_cta1: "무료로 시작하기",
    hero_cta2: "작동 방식 보기",
    problem_label: "문제",
    problem_h2: "1인 사업 운영은 힘듭니다.",
    problem_body: "작업 중에 전화를 받고, 결제를 며칠씩 쫓아다니고, 바쁠 때 고객을 놓치고, 청구서를 손으로 작성합니다. GigWrench가 이 모든 것을 해결합니다.",
    feat_label: "기능",
    feat_h2: "Pro에게 필요한 모든 것.",
    compare_label: "비교",
    compare_h2: "왜 Pro들이 GigWrench를 선택할까요.",
    faq_label: "FAQ",
    faq_h2: "자주 묻는 질문.",
    faq_pro: "Pro를 위해",
    faq_cust: "고객을 위해",
    app_label: "모바일 앱",
    app_h2: "GigWrench를 어디서나.",
    app_sub: "Android와 iOS 네이티브 앱이 곧 출시됩니다. 지금 웹에서 가입하세요.",
    app_android: "Google Play 출시 예정",
    app_ios: "App Store 출시 예정",
    app_beta: "웹 베타에 참여하기",
    footer_tagline: "Pro를 위해 제작. AI로 구동.",
    footer_copy: "2026 GigWrench. 모든 권리 보유.",
    beta_pill: "베타 출시",
    stat_lead: "리드 응답",
    stat_flat: "정액제, 수수료 없음",
    stat_langs: "개 언어",
    stat_id: "신원 인증 Pro",
    stat_pros: "미국 1인 Pro",
    table_feature: "기능",
    coming_soon: "출시 예정",
    footer_signup: "가입",
    footer_terms: "약관",
    footer_privacy: "개인정보",
    footer_contact: "문의",
  },
  de: {
    pick_lang: "Wählen Sie Ihre Sprache",
    pick_sub: "GigWrench ist in 14 Sprachen für Pros und Kunden weltweit verfügbar.",
    skip: "Auf Englisch fortfahren",
    nav_signin: "Anmelden",
    nav_cta: "Kostenlos starten",
    hero_h1_a: "Führen Sie Ihr Handwerk",
    hero_h1_b: "wie ein Pro.",
    hero_sub: "GigWrench gibt selbstständigen Pros die KI-gestützten Werkzeuge, um mehr Aufträge zu gewinnen, schneller bezahlt zu werden und keinen Lead zu verpassen. Für nur $19 im Monat.",
    hero_cta1: "Kostenlos starten",
    hero_cta2: "So funktioniert es",
    problem_label: "Das Problem",
    problem_h2: "Ein Handwerksbetrieb allein ist hart.",
    problem_body: "Sie nehmen Anrufe während der Arbeit an. Sie laufen wochenlang Zahlungen hinterher. Sie verlieren Leads, weil Sie auf einem Auftrag waren. Sie schreiben Rechnungen von Hand. GigWrench löst all das.",
    feat_label: "Funktionen",
    feat_h2: "Alles, was ein Pro braucht.",
    compare_label: "Vergleich",
    compare_h2: "Warum Pros GigWrench wählen.",
    faq_label: "FAQ",
    faq_h2: "Ihre Fragen beantwortet.",
    faq_pro: "Für Pros",
    faq_cust: "Für Kunden",
    app_label: "Mobile App",
    app_h2: "Nehmen Sie GigWrench überallhin mit.",
    app_sub: "Native Apps für Android und iOS sind unterwegs. Registrieren Sie sich jetzt im Web.",
    app_android: "Bald bei Google Play",
    app_ios: "Bald im App Store",
    app_beta: "Jetzt der Web-Beta beitreten",
    footer_tagline: "Für Pros gemacht. Mit KI betrieben.",
    footer_copy: "2026 GigWrench. Alle Rechte vorbehalten.",
    beta_pill: "Beta jetzt live",
    stat_lead: "Lead-Antwort",
    stat_flat: "Pauschal, keine Gebühren",
    stat_langs: "Sprachen",
    stat_id: "ID-verifizierte Pros",
    stat_pros: "Solo-Pros in den USA",
    table_feature: "Funktion",
    coming_soon: "Demnächst",
    footer_signup: "Registrieren",
    footer_terms: "AGB",
    footer_privacy: "Datenschutz",
    footer_contact: "Kontakt",
  },
  it: {
    pick_lang: "Scegli la tua lingua",
    pick_sub: "GigWrench è disponibile in 14 lingue per Pro e clienti in tutto il mondo.",
    skip: "Continua in inglese",
    nav_signin: "Accedi",
    nav_cta: "Inizia gratis",
    hero_h1_a: "Gestisci il tuo mestiere",
    hero_h1_b: "come un Pro.",
    hero_sub: "GigWrench offre ai Pro indipendenti gli strumenti basati su IA per ottenere più lavori, farsi pagare più in fretta e non perdere mai un lead. Solo $19 al mese.",
    hero_cta1: "Inizia gratis",
    hero_cta2: "Scopri come funziona",
    problem_label: "Il problema",
    problem_h2: "Lavorare in proprio nei mestieri è dura.",
    problem_body: "Rispondi alle chiamate mentre lavori. Rincorri i pagamenti per settimane. Perdi lead perché eri su un lavoro. Scrivi le fatture a mano. GigWrench risolve tutto questo.",
    feat_label: "Funzioni",
    feat_h2: "Tutto ciò che serve a un Pro.",
    compare_label: "Confronto",
    compare_h2: "Perché i Pro scelgono GigWrench.",
    faq_label: "FAQ",
    faq_h2: "Le tue domande, le nostre risposte.",
    faq_pro: "Per i Pro",
    faq_cust: "Per i clienti",
    app_label: "App mobile",
    app_h2: "Porta GigWrench ovunque.",
    app_sub: "Le app native per Android e iOS sono in arrivo. Registrati subito sul web.",
    app_android: "Presto su Google Play",
    app_ios: "Presto su App Store",
    app_beta: "Unisciti alla beta sul web",
    footer_tagline: "Fatto per i Pro. Alimentato dall'IA.",
    footer_copy: "2026 GigWrench. Tutti i diritti riservati.",
    beta_pill: "Beta ora attiva",
    stat_lead: "Risposta ai lead",
    stat_flat: "Tariffa fissa, senza commissioni",
    stat_langs: "Lingue",
    stat_id: "Pro verificati",
    stat_pros: "Pro indipendenti USA",
    table_feature: "Funzione",
    coming_soon: "Presto disponibile",
    footer_signup: "Registrati",
    footer_terms: "Termini",
    footer_privacy: "Privacy",
    footer_contact: "Contatti",
  },
  nl: {
    pick_lang: "Kies uw taal",
    pick_sub: "GigWrench is beschikbaar in 14 talen voor Pros en klanten wereldwijd.",
    skip: "Doorgaan in het Engels",
    nav_signin: "Inloggen",
    nav_cta: "Gratis beginnen",
    hero_h1_a: "Run uw vak",
    hero_h1_b: "als een Pro.",
    hero_sub: "GigWrench geeft zelfstandige Pros de AI-tools om meer klussen te winnen, sneller betaald te worden en nooit een lead te missen. Voor slechts $19 per maand.",
    hero_cta1: "Gratis beginnen",
    hero_cta2: "Bekijk hoe het werkt",
    problem_label: "Het probleem",
    problem_h2: "Een eenmanszaak in het vak runnen is zwaar.",
    problem_body: "U neemt telefoons aan tijdens het werk. U loopt weken achter betalingen aan. U verliest leads omdat u op een klus was. U schrijft facturen met de hand. GigWrench lost het allemaal op.",
    feat_label: "Functies",
    feat_h2: "Alles wat een Pro nodig heeft.",
    compare_label: "Vergelijking",
    compare_h2: "Waarom Pros voor GigWrench kiezen.",
    faq_label: "FAQ",
    faq_h2: "Uw vragen beantwoord.",
    faq_pro: "Voor Pros",
    faq_cust: "Voor klanten",
    app_label: "Mobiele app",
    app_h2: "Neem GigWrench overal mee naartoe.",
    app_sub: "Native apps voor Android en iOS komen eraan. Meld u nu aan op het web.",
    app_android: "Binnenkort in Google Play",
    app_ios: "Binnenkort in de App Store",
    app_beta: "Doe nu mee aan de web-beta",
    footer_tagline: "Gemaakt voor Pros. Aangedreven door AI.",
    footer_copy: "2026 GigWrench. Alle rechten voorbehouden.",
    beta_pill: "Beta nu live",
    stat_lead: "Lead-respons",
    stat_flat: "Vast tarief, geen kosten",
    stat_langs: "Talen",
    stat_id: "ID-geverifieerde Pros",
    stat_pros: "Solo-Pros in de VS",
    table_feature: "Functie",
    coming_soon: "Binnenkort",
    footer_signup: "Aanmelden",
    footer_terms: "Voorwaarden",
    footer_privacy: "Privacy",
    footer_contact: "Contact",
  },
  ro: {
    pick_lang: "Alege limba ta",
    pick_sub: "GigWrench este disponibil în 14 limbi pentru Pro și clienți din toată lumea.",
    skip: "Continuă în engleză",
    nav_signin: "Autentificare",
    nav_cta: "Începe gratuit",
    hero_h1_a: "Condu-ți meseria",
    hero_h1_b: "ca un Pro.",
    hero_sub: "GigWrench oferă Pro independenți instrumente bazate pe IA pentru a câștiga mai multe lucrări, a fi plătit mai repede și a nu pierde niciun lead. Doar $19 pe lună.",
    hero_cta1: "Începe gratuit",
    hero_cta2: "Vezi cum funcționează",
    problem_label: "Problema",
    problem_h2: "Să lucrezi pe cont propriu în meserii e greu.",
    problem_body: "Răspunzi la telefon în timp ce lucrezi. Alergi după plăți săptămâni întregi. Pierzi lead-uri pentru că erai pe o lucrare. Scrii facturi de mână. GigWrench rezolvă tot.",
    feat_label: "Funcții",
    feat_h2: "Tot ce are nevoie un Pro.",
    compare_label: "Comparație",
    compare_h2: "De ce aleg Pro GigWrench.",
    faq_label: "Întrebări",
    faq_h2: "Răspunsuri la întrebările tale.",
    faq_pro: "Pentru Pro",
    faq_cust: "Pentru clienți",
    app_label: "Aplicație mobilă",
    app_h2: "Ia GigWrench oriunde.",
    app_sub: "Aplicațiile native pentru Android și iOS sunt pe drum. Înregistrează-te acum pe web.",
    app_android: "În curând pe Google Play",
    app_ios: "În curând în App Store",
    app_beta: "Alătură-te beta pe web",
    footer_tagline: "Făcut pentru Pro. Alimentat de IA.",
    footer_copy: "2026 GigWrench. Toate drepturile rezervate.",
    beta_pill: "Beta acum live",
    stat_lead: "Răspuns la lead",
    stat_flat: "Tarif fix, fără comisioane",
    stat_langs: "Limbi",
    stat_id: "Pro verificați",
    stat_pros: "Pro independenți din SUA",
    table_feature: "Funcție",
    coming_soon: "În curând",
    footer_signup: "Înregistrare",
    footer_terms: "Termeni",
    footer_privacy: "Confidențialitate",
    footer_contact: "Contact",
  },
  sv: {
    pick_lang: "Välj ditt språk",
    pick_sub: "GigWrench är tillgängligt på 14 språk för proffs och kunder över hela världen.",
    skip: "Fortsätt på engelska",
    nav_signin: "Logga in",
    nav_cta: "Kom igång gratis",
    hero_h1_a: "Driv ditt yrke",
    hero_h1_b: "som ett proffs.",
    hero_sub: "GigWrench ger soloproffs AI-verktygen för att vinna fler jobb, få betalt snabbare och aldrig missa en lead. För bara $19 i månaden.",
    hero_cta1: "Kom igång gratis",
    hero_cta2: "Se hur det fungerar",
    problem_label: "Problemet",
    problem_h2: "Att driva ett soloföretag i yrket är tufft.",
    problem_body: "Du svarar i telefon mitt i jobbet. Du jagar betalningar i veckor. Du tappar leads för att du var på ett jobb. Du skriver fakturor för hand. GigWrench löser allt.",
    feat_label: "Funktioner",
    feat_h2: "Allt ett proffs behöver.",
    compare_label: "Jämförelse",
    compare_h2: "Varför proffs väljer GigWrench.",
    faq_label: "FAQ",
    faq_h2: "Dina frågor besvarade.",
    faq_pro: "För proffs",
    faq_cust: "För kunder",
    app_label: "Mobilapp",
    app_h2: "Ta med GigWrench överallt.",
    app_sub: "Native-appar för Android och iOS är på väg. Registrera dig på webben nu.",
    app_android: "Snart på Google Play",
    app_ios: "Snart i App Store",
    app_beta: "Gå med i webbetan nu",
    footer_tagline: "Byggt för proffs. Drivs av AI.",
    footer_copy: "2026 GigWrench. Alla rättigheter förbehållna.",
    beta_pill: "Beta nu live",
    stat_lead: "Lead-svar",
    stat_flat: "Fast pris, inga avgifter",
    stat_langs: "Språk",
    stat_id: "ID-verifierade proffs",
    stat_pros: "Soloproffs i USA",
    table_feature: "Funktion",
    coming_soon: "Kommer snart",
    footer_signup: "Registrera dig",
    footer_terms: "Villkor",
    footer_privacy: "Integritet",
    footer_contact: "Kontakt",
  },
  tr: {
    pick_lang: "Dilinizi seçin",
    pick_sub: "GigWrench, dünya genelinde Pro ve müşteriler için 14 dilde sunulur.",
    skip: "İngilizce devam et",
    nav_signin: "Giriş yap",
    nav_cta: "Ücretsiz başla",
    hero_h1_a: "İşinizi yönetin",
    hero_h1_b: "bir Pro gibi.",
    hero_sub: "GigWrench, bağımsız Pro'lara daha fazla iş kazanmak, daha hızlı ödeme almak ve hiçbir müşteri adayını kaçırmamak için yapay zeka araçları sunar. Ayda sadece $19.",
    hero_cta1: "Ücretsiz başla",
    hero_cta2: "Nasıl çalıştığını gör",
    problem_label: "Sorun",
    problem_h2: "Tek başına usta olarak çalışmak zor.",
    problem_body: "İş üzerindeyken telefonlara cevap verirsiniz. Ödemelerin haftalarca peşinden koşarsınız. Bir iştesiniz diye müşteri adaylarını kaçırırsınız. Faturaları elle yazarsınız. GigWrench hepsini çözer.",
    feat_label: "Özellikler",
    feat_h2: "Bir Pro'nun ihtiyacı olan her şey.",
    compare_label: "Karşılaştırma",
    compare_h2: "Pro'lar neden GigWrench'i seçiyor.",
    faq_label: "SSS",
    faq_h2: "Sorularınız yanıtlandı.",
    faq_pro: "Pro'lar için",
    faq_cust: "Müşteriler için",
    app_label: "Mobil uygulama",
    app_h2: "GigWrench'i her yere götürün.",
    app_sub: "Android ve iOS için yerel uygulamalar yolda. Şimdi web'den kaydolun.",
    app_android: "Yakında Google Play'de",
    app_ios: "Yakında App Store'da",
    app_beta: "Web betasına şimdi katılın",
    footer_tagline: "Pro'lar için yapıldı. Yapay zeka ile çalışır.",
    footer_copy: "2026 GigWrench. Tüm hakları saklıdır.",
    beta_pill: "Beta yayında",
    stat_lead: "Müşteri adayı yanıtı",
    stat_flat: "Sabit ücret, komisyon yok",
    stat_langs: "Dil",
    stat_id: "Kimliği doğrulanmış Pro",
    stat_pros: "ABD'deki bağımsız Pro",
    table_feature: "Özellik",
    coming_soon: "Yakında",
    footer_signup: "Kaydol",
    footer_terms: "Koşullar",
    footer_privacy: "Gizlilik",
    footer_contact: "İletişim",
  },
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURE_META = [
  { icon: MessageSquare, color: '#3B82F6' },
  { icon: Camera, color: '#F59E0B' },
  { icon: MapPin, color: '#10B981' },
  { icon: FileText, color: '#8B5CF6' },
  { icon: Users, color: '#EF4444' },
  { icon: Zap, color: '#F59E0B' },
  { icon: Globe, color: '#06B6D4' },
  { icon: BarChart2, color: '#10B981' },
]

const FEATURE_TEXT: Record<string, { title: string; desc: string }[]> = {
  en: [
    { title: 'Dispatch AI Booking', desc: 'Responds to new leads in under 90 seconds while you are on a job. No competitor does this.' },
    { title: 'GigWrench Lens', desc: 'Point your camera at any part. Get instant identification, supplier alternatives, and add it to an invoice. Completely unique to GigWrench.' },
    { title: 'Live GPS Tracking', desc: 'Customers see exactly where you are and when you will arrive. Eliminates the "are you coming?" calls.' },
    { title: 'Smart Invoicing', desc: 'Create professional invoices and send a Stripe payment link in under a minute. No more chasing payments.' },
    { title: 'Customer CRM', desc: 'Every customer, every job, every note in one place. Know who owes you money and who is a repeat client.' },
    { title: 'Loyalty Engine', desc: 'Automatically reaches out to past customers with tips, check-ins, and booking nudges. Keeps your calendar full without effort.' },
    { title: '14 Languages', desc: 'The only platform in the trades built for a multilingual workforce. Available in English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian, and Swedish.' },
    { title: 'Analytics Dashboard', desc: 'Revenue trends, job stats, customer breakdown. Know exactly how your business is performing at a glance.' },
  ],
  de: [
    { title: "Dispatch KI-Buchung", desc: "Antwortet neuen Leads in unter 90 Sekunden, während Sie arbeiten. Kein Wettbewerber kann das." },
    { title: "GigWrench Lens", desc: "Richten Sie Ihre Kamera auf ein beliebiges Teil. Sofortige Erkennung, Lieferanten-Alternativen und direkt zur Rechnung hinzufügen. Einzigartig bei GigWrench." },
    { title: "Live-GPS-Tracking", desc: "Kunden sehen genau, wo Sie sind und wann Sie ankommen. Schluss mit den Kommen-Sie-noch-Anrufen." },
    { title: "Intelligente Rechnungen", desc: "Erstellen Sie professionelle Rechnungen und senden Sie einen Stripe-Zahlungslink in unter einer Minute. Kein Hinterherlaufen mehr." },
    { title: "Kunden-CRM", desc: "Jeder Kunde, jeder Auftrag, jede Notiz an einem Ort. Wissen Sie, wer Ihnen Geld schuldet und wer Stammkunde ist." },
    { title: "Treue-Engine", desc: "Kontaktiert frühere Kunden automatisch mit Tipps, Nachfragen und Buchungserinnerungen. Hält Ihren Kalender mühelos voll." },
    { title: "14 Sprachen", desc: "Die einzige Plattform der Branche für eine mehrsprachige Belegschaft. Verfügbar auf Englisch, Spanisch, Portugiesisch, Französisch, Arabisch, Chinesisch, Hindi, Koreanisch, Türkisch, Deutsch, Italienisch, Niederländisch, Rumänisch und Schwedisch." },
    { title: "Analyse-Dashboard", desc: "Umsatztrends, Auftragsstatistiken, Kundenaufschlüsselung. Sehen Sie auf einen Blick, wie Ihr Geschäft läuft." },
  ],
  it: [
    { title: "Prenotazione IA Dispatch", desc: "Risponde ai nuovi lead in meno di 90 secondi mentre lavori. Nessun concorrente lo fa." },
    { title: "GigWrench Lens", desc: "Punta la fotocamera su qualsiasi pezzo. Ottieni identificazione immediata, alternative di fornitori e aggiungilo a una fattura. Esclusiva di GigWrench." },
    { title: "Tracciamento GPS dal vivo", desc: "I clienti vedono esattamente dove sei e quando arriverai. Elimina le chiamate stai arrivando." },
    { title: "Fatturazione intelligente", desc: "Crea fatture professionali e invia un link di pagamento Stripe in meno di un minuto. Basta rincorrere i pagamenti." },
    { title: "CRM clienti", desc: "Ogni cliente, ogni lavoro, ogni nota in un unico posto. Sai chi ti deve dei soldi e chi è un cliente abituale." },
    { title: "Motore di fedeltà", desc: "Ricontatta automaticamente i clienti passati con consigli, controlli e promemoria di prenotazione. Mantiene la tua agenda piena senza sforzo." },
    { title: "14 lingue", desc: "L'unica piattaforma del settore creata per una forza lavoro multilingue. Disponibile in inglese, spagnolo, portoghese, francese, arabo, cinese, hindi, coreano, turco, tedesco, italiano, olandese, rumeno e svedese." },
    { title: "Dashboard analitica", desc: "Andamento dei ricavi, statistiche dei lavori, analisi dei clienti. Sai esattamente come va la tua attività a colpo d'occhio." },
  ],
  nl: [
    { title: "Dispatch AI-boeking", desc: "Reageert binnen 90 seconden op nieuwe leads terwijl u werkt. Geen enkele concurrent doet dit." },
    { title: "GigWrench Lens", desc: "Richt uw camera op elk onderdeel. Krijg directe identificatie, leveranciersalternatieven en voeg het toe aan een factuur. Uniek voor GigWrench." },
    { title: "Live GPS-tracking", desc: "Klanten zien precies waar u bent en wanneer u aankomt. Einde aan de komt-u-nog-telefoontjes." },
    { title: "Slim factureren", desc: "Maak professionele facturen en stuur een Stripe-betaallink in minder dan een minuut. Geen achter betalingen aanlopen meer." },
    { title: "Klanten-CRM", desc: "Elke klant, elke klus, elke notitie op één plek. Weet wie u geld schuldig is en wie een vaste klant is." },
    { title: "Loyaliteitsmotor", desc: "Neemt automatisch contact op met oude klanten met tips, check-ins en boekingsherinneringen. Houdt uw agenda moeiteloos vol." },
    { title: "14 talen", desc: "Het enige platform in de sector gebouwd voor een meertalige beroepsbevolking. Beschikbaar in Engels, Spaans, Portugees, Frans, Arabisch, Chinees, Hindi, Koreaans, Turks, Duits, Italiaans, Nederlands, Roemeens en Zweeds." },
    { title: "Analytics-dashboard", desc: "Omzettrends, klusstatistieken, klantanalyse. Weet in één oogopslag hoe uw bedrijf presteert." },
  ],
  ro: [
    { title: "Programare IA Dispatch", desc: "Răspunde la lead-uri noi în mai puțin de 90 de secunde în timp ce lucrezi. Niciun concurent nu face asta." },
    { title: "GigWrench Lens", desc: "Îndreaptă camera spre orice piesă. Primești identificare instantanee, alternative de furnizori și o adaugi pe o factură. Exclusiv GigWrench." },
    { title: "Urmărire GPS în timp real", desc: "Clienții văd exact unde ești și când ajungi. Elimină apelurile mai vii." },
    { title: "Facturare inteligentă", desc: "Creează facturi profesionale și trimite un link de plată Stripe în mai puțin de un minut. Gata cu alergatul după plăți." },
    { title: "CRM clienți", desc: "Fiecare client, fiecare lucrare, fiecare notă într-un singur loc. Știi cine îți datorează bani și cine e client fidel." },
    { title: "Motor de fidelitate", desc: "Contactează automat clienții vechi cu sfaturi, verificări și memento-uri de programare. Îți ține agenda plină fără efort." },
    { title: "14 limbi", desc: "Singura platformă din domeniu construită pentru o forță de muncă multilingvă. Disponibilă în engleză, spaniolă, portugheză, franceză, arabă, chineză, hindi, coreeană, turcă, germană, italiană, olandeză, română și suedeză." },
    { title: "Tablou de analiză", desc: "Tendințe de venit, statistici de lucrări, segmentare clienți. Vezi dintr-o privire cum merge afacerea ta." },
  ],
  sv: [
    { title: "Dispatch AI-bokning", desc: "Svarar nya leads på under 90 sekunder medan du jobbar. Ingen konkurrent gör detta." },
    { title: "GigWrench Lens", desc: "Rikta kameran mot vilken del som helst. Få direkt identifiering, leverantörsalternativ och lägg till den på en faktura. Unikt för GigWrench." },
    { title: "Live GPS-spårning", desc: "Kunderna ser exakt var du är och när du kommer. Slut på kommer-du-snart-samtalen." },
    { title: "Smart fakturering", desc: "Skapa professionella fakturor och skicka en Stripe-betallänk på under en minut. Slut på att jaga betalningar." },
    { title: "Kund-CRM", desc: "Varje kund, varje jobb, varje anteckning på ett ställe. Vet vem som är skyldig dig pengar och vem som är återkommande." },
    { title: "Lojalitetsmotor", desc: "Kontaktar automatiskt tidigare kunder med tips, avstämningar och bokningspåminnelser. Håller din kalender full utan ansträngning." },
    { title: "14 språk", desc: "Den enda plattformen i branschen byggd för en flerspråkig arbetsstyrka. Tillgänglig på engelska, spanska, portugisiska, franska, arabiska, kinesiska, hindi, koreanska, turkiska, tyska, italienska, nederländska, rumänska och svenska." },
    { title: "Analyspanel", desc: "Intäktstrender, jobbstatistik, kundöversikt. Se på ett ögonkast hur din verksamhet går." },
  ],
  tr: [
    { title: "Dispatch AI Rezervasyon", desc: "Siz iş üzerindeyken yeni müşteri adaylarına 90 saniyenin altında yanıt verir. Hiçbir rakip bunu yapamaz." },
    { title: "GigWrench Lens", desc: "Kameranızı herhangi bir parçaya doğrultun. Anında tanıma, tedarikçi alternatifleri alın ve faturaya ekleyin. Yalnızca GigWrench'te." },
    { title: "Canlı GPS takibi", desc: "Müşteriler tam olarak nerede olduğunuzu ve ne zaman varacağınızı görür. Geliyor musunuz aramalarına son." },
    { title: "Akıllı faturalama", desc: "Profesyonel faturalar oluşturun ve bir dakikadan kısa sürede Stripe ödeme bağlantısı gönderin. Ödeme kovalamak yok." },
    { title: "Müşteri CRM", desc: "Her müşteri, her iş, her not tek bir yerde. Kimin size borcu olduğunu ve kimin düzenli müşteri olduğunu bilin." },
    { title: "Sadakat motoru", desc: "Eski müşterilere ipuçları, kontroller ve rezervasyon hatırlatmalarıyla otomatik ulaşır. Takviminizi zahmetsizce dolu tutar." },
    { title: "14 dil", desc: "Sektörde çok dilli iş gücü için kurulmuş tek platform. İngilizce, İspanyolca, Portekizce, Fransızca, Arapça, Çince, Hintçe, Korece, Türkçe, Almanca, İtalyanca, Felemenkçe, Rumence ve İsveççe sunulur." },
    { title: "Analiz panosu", desc: "Gelir eğilimleri, iş istatistikleri, müşteri dağılımı. İşinizin nasıl gittiğini bir bakışta görün." },
  ],
  ar: [
    { title: "حجز Dispatch بالذكاء الاصطناعي", desc: "يرد على العملاء المحتملين الجدد في أقل من 90 ثانية بينما تعمل. لا يفعل ذلك أي منافس." },
    { title: "GigWrench Lens", desc: "وجه كاميرتك إلى أي قطعة. احصل على تعريف فوري وبدائل من الموردين وأضفها إلى فاتورة. حصري لـ GigWrench." },
    { title: "تتبع GPS مباشر", desc: "يرى العملاء أين أنت بالضبط ومتى ستصل. يلغي مكالمات هل أنت قادم." },
    { title: "فوترة ذكية", desc: "أنشئ فواتير احترافية وأرسل رابط دفع Stripe في أقل من دقيقة. لا مزيد من ملاحقة المدفوعات." },
    { title: "إدارة علاقات العملاء", desc: "كل عميل وكل عمل وكل ملاحظة في مكان واحد. اعرف من يدين لك بالمال ومن هو عميل متكرر." },
    { title: "محرك الولاء", desc: "يتواصل تلقائيا مع العملاء السابقين بنصائح ومتابعات وتذكيرات بالحجز. يبقي جدولك ممتلئا بلا جهد." },
    { title: "14 لغة", desc: "المنصة الوحيدة في القطاع المبنية لقوة عمل متعددة اللغات. متاحة بالإنجليزية والإسبانية والبرتغالية والفرنسية والعربية والصينية والهندية والكورية والتركية والألمانية والإيطالية والهولندية والرومانية والسويدية." },
    { title: "لوحة التحليلات", desc: "اتجاهات الإيرادات وإحصاءات الأعمال وتفصيل العملاء. اعرف بالضبط كيف يسير عملك في لمحة." },
  ],
  zh: [
    { title: "Dispatch AI 预约", desc: "当您在工作时，90 秒内回应新的潜在客户。没有竞争对手能做到。" },
    { title: "GigWrench Lens", desc: "用相机对准任何零件。即时识别、获取供应商替代方案，并添加到发票。GigWrench 独有。" },
    { title: "实时 GPS 追踪", desc: "客户能准确看到您在哪里、何时到达。免去你来了吗的电话。" },
    { title: "智能开票", desc: "一分钟内创建专业发票并发送 Stripe 付款链接。不再追讨欠款。" },
    { title: "客户 CRM", desc: "每位客户、每项工作、每条备注都集中在一处。掌握谁欠您钱、谁是回头客。" },
    { title: "忠诚度引擎", desc: "自动向老客户发送提示、问候和预约提醒。轻松填满您的日程。" },
    { title: "14 种语言", desc: "业内唯一为多语言劳动力打造的平台。提供英语、西班牙语、葡萄牙语、法语、阿拉伯语、中文、印地语、韩语、土耳其语、德语、意大利语、荷兰语、罗马尼亚语和瑞典语。" },
    { title: "分析仪表板", desc: "收入趋势、工作统计、客户细分。一目了然地掌握业务表现。" },
  ],
  hi: [
    { title: "Dispatch AI Booking", desc: "Aap kaam par hote hue bhi naye leads ko 90 second se kam mein jawab deta hai. Koi competitor yeh nahi karta." },
    { title: "GigWrench Lens", desc: "Apne camera ko kisi bhi part par taarget karen. Turant pehchaan paayen, supplier alternatives len, aur use invoice mein joden. Sirf GigWrench par." },
    { title: "Live GPS Tracking", desc: "Customers theek-theek dekhte hain ki aap kahan hain aur kab pahunchenge. Aap aa rahe hain wali calls khatam." },
    { title: "Smart Invoicing", desc: "Professional invoice banayein aur Stripe payment link ek minute se kam mein bhejein. Payment ke peeche bhaagna khatam." },
    { title: "Customer CRM", desc: "Har customer, har kaam, har note ek jagah. Jaanein kaun aapka paisa deta hai aur kaun repeat client hai." },
    { title: "Loyalty Engine", desc: "Purane customers ko tips, check-in aur booking reminder apne aap bhejta hai. Bina mehnat aapka calendar bhara rakhta hai." },
    { title: "14 Bhashayein", desc: "Trades mein multilingual workforce ke liye bani ekmaatra platform. English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian aur Swedish mein uplabdh." },
    { title: "Analytics Dashboard", desc: "Revenue trends, job stats, customer breakdown. Ek nazar mein jaanein aapka business kaisa chal raha hai." },
  ],
  ko: [
    { title: "Dispatch AI 예약", desc: "Pro가 작업 중일 때도 새 리드에 90초 이내로 응답합니다. 어떤 경쟁사도 하지 못하는 기능입니다." },
    { title: "GigWrench Lens", desc: "카메라를 어떤 부품에든 비추세요. 즉시 식별하고, 공급처 대안을 찾고, 청구서에 추가합니다. GigWrench만의 기능입니다." },
    { title: "실시간 GPS 추적", desc: "고객이 당신의 위치와 도착 시간을 정확히 봅니다. 오고 있나요 하는 전화를 없애줍니다." },
    { title: "스마트 청구", desc: "전문적인 청구서를 만들고 Stripe 결제 링크를 1분 안에 보냅니다. 더 이상 결제를 쫓지 마세요." },
    { title: "고객 CRM", desc: "모든 고객, 모든 작업, 모든 메모를 한곳에. 누가 돈을 빚졌고 누가 단골인지 파악하세요." },
    { title: "로열티 엔진", desc: "지난 고객에게 팁, 안부, 예약 알림을 자동으로 보냅니다. 노력 없이 일정을 가득 채웁니다." },
    { title: "14개 언어", desc: "다국어 인력을 위해 만들어진 업계 유일의 플랫폼. 영어, 스페인어, 포르투갈어, 프랑스어, 아랍어, 중국어, 힌디어, 한국어, 터키어, 독일어, 이탈리아어, 네덜란드어, 루마니아어, 스웨덴어로 제공됩니다." },
    { title: "분석 대시보드", desc: "매출 추이, 작업 통계, 고객 분석. 사업이 어떻게 돌아가는지 한눈에 파악하세요." },
  ],
  pt: [
    { title: "Reservas com IA Dispatch", desc: "Responde a novos leads em menos de 90 segundos enquanto voce trabalha. Nenhum concorrente faz isso." },
    { title: "GigWrench Lens", desc: "Aponte a camera para qualquer peca. Receba identificacao instantanea, alternativas de fornecedores e adicione a uma fatura. Exclusivo do GigWrench." },
    { title: "Rastreamento GPS ao vivo", desc: "Os clientes veem exatamente onde voce esta e quando vai chegar. Acaba com as ligacoes de “ja vem?”." },
    { title: "Faturamento inteligente", desc: "Crie faturas profissionais e envie um link de pagamento Stripe em menos de um minuto. Chega de perseguir pagamentos." },
    { title: "CRM de clientes", desc: "Cada cliente, cada trabalho, cada nota em um so lugar. Saiba quem te deve dinheiro e quem e cliente recorrente." },
    { title: "Motor de fidelidade", desc: "Entra em contato automaticamente com clientes antigos com dicas, acompanhamentos e lembretes de agendamento. Mantem sua agenda cheia sem esforco." },
    { title: "14 idiomas", desc: "A unica plataforma do setor construida para uma forca de trabalho multilingue. Disponivel em ingles, espanhol, portugues, frances, arabe, chines, hindi, coreano, turco, alemao, italiano, holandes, romeno e sueco." },
    { title: "Painel de analises", desc: "Tendencias de receita, estatisticas de trabalhos, detalhamento de clientes. Saiba exatamente como seu negocio esta indo num relance." },
  ],
  fr: [
    { title: "Reservation IA Dispatch", desc: "Repond aux nouveaux leads en moins de 90 secondes pendant que vous travaillez. Aucun concurrent ne fait cela." },
    { title: "GigWrench Lens", desc: "Pointez votre camera sur n'importe quelle piece. Obtenez une identification instantanee, des alternatives de fournisseurs et ajoutez-la a une facture. Unique a GigWrench." },
    { title: "Suivi GPS en direct", desc: "Les clients voient exactement ou vous etes et quand vous arriverez. Fini les appels “vous arrivez?”." },
    { title: "Facturation intelligente", desc: "Creez des factures professionnelles et envoyez un lien de paiement Stripe en moins d'une minute. Fini de courir apres les paiements." },
    { title: "CRM clients", desc: "Chaque client, chaque chantier, chaque note au meme endroit. Sachez qui vous doit de l'argent et qui est un client fidele." },
    { title: "Moteur de fidelite", desc: "Recontacte automatiquement vos anciens clients avec des conseils, des suivis et des rappels de reservation. Garde votre agenda plein sans effort." },
    { title: "14 langues", desc: "La seule plateforme du secteur concue pour une main-d'oeuvre multilingue. Disponible en anglais, espagnol, portugais, francais, arabe, chinois, hindi, coreen, turc, allemand, italien, neerlandais, roumain et suedois." },
    { title: "Tableau de bord analytique", desc: "Tendances de revenus, statistiques de chantiers, repartition des clients. Sachez exactement comment va votre activite en un coup d'oeil." },
  ],
  es: [
    { title: 'Reservas con IA Dispatch', desc: 'Responde a nuevos leads en menos de 90 segundos mientras trabajas. Ningun competidor hace esto.' },
    { title: 'GigWrench Lens', desc: 'Apunta tu camara a cualquier pieza. Obten identificacion al instante, alternativas de proveedores y agregala a una factura. Unico de GigWrench.' },
    { title: 'Rastreo GPS en vivo', desc: 'Los clientes ven exactamente donde estas y cuando vas a llegar. Elimina las llamadas de "ya vienes?".' },
    { title: 'Facturacion inteligente', desc: 'Crea facturas profesionales y envia un enlace de pago de Stripe en menos de un minuto. Se acabo perseguir pagos.' },
    { title: 'CRM de clientes', desc: 'Cada cliente, cada trabajo, cada nota en un solo lugar. Sabe quien te debe dinero y quien es cliente frecuente.' },
    { title: 'Motor de fidelidad', desc: 'Contacta automaticamente a clientes anteriores con consejos, seguimientos y recordatorios de reserva. Manten tu calendario lleno sin esfuerzo.' },
    { title: '14 idiomas', desc: 'La unica plataforma del sector construida para una fuerza laboral multilingue. Disponible en ingles, espanol, portugues, frances, arabe, chino, hindi, coreano, turco, aleman, italiano, neerlandes, rumano y sueco.' },
    { title: 'Panel de analiticas', desc: 'Tendencias de ingresos, estadisticas de trabajos, desglose de clientes. Sabe exactamente como va tu negocio de un vistazo.' },
  ],
}

// ─── COMPARISON ───────────────────────────────────────────────────────────────
type CompareRow = { feature: string; gw: string | boolean; thumb: string | boolean; angi: string | boolean; hcp: string | boolean }
const COMPARE_ROWS: Record<string, CompareRow[]> = {
  en: [
    { feature: 'Monthly price', gw: '$19 flat', thumb: '$300-500', angi: '$300+', hcp: '$149+' },
    { feature: 'Lead fees', gw: 'None', thumb: '$5-150 per lead', angi: '$15-85 per lead', hcp: 'None' },
    { feature: 'AI booking agent', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'AI part identification', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Live GPS tracking', gw: true, thumb: false, angi: false, hcp: 'Add-on' },
    { feature: 'Invoicing built in', gw: true, thumb: false, angi: false, hcp: true },
    { feature: '14 languages', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'ID verification', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Loyalty sequences', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Setup fee', gw: 'None', thumb: 'None', angi: 'None', hcp: 'None' },
  ],
  de: [
    { feature: "Monatspreis", gw: "$19 pauschal", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Lead-Gebühren", gw: "Keine", thumb: "$5-150 pro Lead", angi: "$15-85 pro Lead", hcp: "Keine" },
    { feature: "KI-Buchungsagent", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "KI-Teileerkennung", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Live-GPS-Tracking", gw: true, thumb: false, angi: false, hcp: "Zusatz" },
    { feature: "Integrierte Rechnungen", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 Sprachen", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "ID-Verifizierung", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Treuesequenzen", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Einrichtungsgebühr", gw: "Keine", thumb: "Keine", angi: "Keine", hcp: "Keine" },
  ],
  it: [
    { feature: "Prezzo mensile", gw: "$19 fisso", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Costi per lead", gw: "Nessuno", thumb: "$5-150 per lead", angi: "$15-85 per lead", hcp: "Nessuno" },
    { feature: "Agente di prenotazione IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Identificazione pezzi IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Tracciamento GPS dal vivo", gw: true, thumb: false, angi: false, hcp: "Aggiuntivo" },
    { feature: "Fatturazione integrata", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 lingue", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Verifica identità", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Sequenze di fedeltà", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Costo di attivazione", gw: "Nessuno", thumb: "Nessuno", angi: "Nessuno", hcp: "Nessuno" },
  ],
  nl: [
    { feature: "Maandprijs", gw: "$19 vast", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Lead-kosten", gw: "Geen", thumb: "$5-150 per lead", angi: "$15-85 per lead", hcp: "Geen" },
    { feature: "AI-boekingsagent", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI-onderdeelherkenning", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Live GPS-tracking", gw: true, thumb: false, angi: false, hcp: "Add-on" },
    { feature: "Ingebouwd factureren", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 talen", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "ID-verificatie", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Loyaliteitsreeksen", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Installatiekosten", gw: "Geen", thumb: "Geen", angi: "Geen", hcp: "Geen" },
  ],
  ro: [
    { feature: "Preț lunar", gw: "$19 fix", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Taxe pe lead", gw: "Niciuna", thumb: "$5-150 pe lead", angi: "$15-85 pe lead", hcp: "Niciuna" },
    { feature: "Agent de programare IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Identificare piese IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Urmărire GPS în timp real", gw: true, thumb: false, angi: false, hcp: "Supliment" },
    { feature: "Facturare integrată", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 limbi", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Verificare identitate", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Secvențe de fidelitate", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Taxă de configurare", gw: "Niciuna", thumb: "Niciuna", angi: "Niciuna", hcp: "Niciuna" },
  ],
  sv: [
    { feature: "Månadspris", gw: "$19 fast", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Lead-avgifter", gw: "Inga", thumb: "$5-150 per lead", angi: "$15-85 per lead", hcp: "Inga" },
    { feature: "AI-bokningsagent", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI-delidentifiering", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Live GPS-spårning", gw: true, thumb: false, angi: false, hcp: "Tillägg" },
    { feature: "Inbyggd fakturering", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 språk", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "ID-verifiering", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Lojalitetssekvenser", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Installationsavgift", gw: "Inga", thumb: "Inga", angi: "Inga", hcp: "Inga" },
  ],
  tr: [
    { feature: "Aylık fiyat", gw: "$19 sabit", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Müşteri adayı ücretleri", gw: "Yok", thumb: "aday başına $5-150", angi: "aday başına $15-85", hcp: "Yok" },
    { feature: "AI rezervasyon ajanı", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI parça tanıma", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Canlı GPS takibi", gw: true, thumb: false, angi: false, hcp: "Ek" },
    { feature: "Dahili faturalama", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 dil", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Kimlik doğrulama", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Sadakat dizileri", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Kurulum ücreti", gw: "Yok", thumb: "Yok", angi: "Yok", hcp: "Yok" },
  ],
  ar: [
    { feature: "السعر الشهري", gw: "$19 ثابت", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "رسوم العملاء المحتملين", gw: "لا شيء", thumb: "$5-150 لكل عميل", angi: "$15-85 لكل عميل", hcp: "لا شيء" },
    { feature: "وكيل حجز بالذكاء الاصطناعي", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "تعريف القطع بالذكاء الاصطناعي", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "تتبع GPS مباشر", gw: true, thumb: false, angi: false, hcp: "إضافة" },
    { feature: "فوترة مدمجة", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 لغة", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "التحقق من الهوية", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "تسلسلات الولاء", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "رسوم الإعداد", gw: "لا شيء", thumb: "لا شيء", angi: "لا شيء", hcp: "لا شيء" },
  ],
  zh: [
    { feature: "月费", gw: "$19 统一", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "潜在客户费用", gw: "无", thumb: "每个潜在客户 $5-150", angi: "每个潜在客户 $15-85", hcp: "无" },
    { feature: "AI 预约助手", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI 零件识别", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "实时 GPS 追踪", gw: true, thumb: false, angi: false, hcp: "附加" },
    { feature: "内置开票", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 种语言", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "身份验证", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "忠诚度序列", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "设置费", gw: "无", thumb: "无", angi: "无", hcp: "无" },
  ],
  hi: [
    { feature: "Monthly price", gw: "$19 flat", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Lead fees", gw: "Koi nahi", thumb: "$5-150 per lead", angi: "$15-85 per lead", hcp: "Koi nahi" },
    { feature: "AI booking agent", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI part identification", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Live GPS tracking", gw: true, thumb: false, angi: false, hcp: "Add-on" },
    { feature: "Invoicing built in", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 bhashayein", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "ID verification", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Loyalty sequences", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Setup fee", gw: "Koi nahi", thumb: "Koi nahi", angi: "Koi nahi", hcp: "Koi nahi" },
  ],
  ko: [
    { feature: "월 요금", gw: "$19 정액", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "리드 수수료", gw: "없음", thumb: "리드당 $5-150", angi: "리드당 $15-85", hcp: "없음" },
    { feature: "AI 예약 에이전트", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "AI 부품 식별", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "실시간 GPS 추적", gw: true, thumb: false, angi: false, hcp: "추가 옵션" },
    { feature: "청구 기능 내장", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14개 언어", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "신원 인증", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "로열티 시퀀스", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "설치 비용", gw: "없음", thumb: "없음", angi: "없음", hcp: "없음" },
  ],
  pt: [
    { feature: "Preco mensal", gw: "$19 fixo", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Custo por lead", gw: "Nenhum", thumb: "$5-150 por lead", angi: "$15-85 por lead", hcp: "Nenhum" },
    { feature: "Agente de reservas IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Identificacao de pecas IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Rastreamento GPS ao vivo", gw: true, thumb: false, angi: false, hcp: "Adicional" },
    { feature: "Faturamento integrado", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 idiomas", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Verificacao de identidade", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Sequencias de fidelidade", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Taxa de instalacao", gw: "Nenhum", thumb: "Nenhum", angi: "Nenhum", hcp: "Nenhum" },
  ],
  fr: [
    { feature: "Prix mensuel", gw: "$19 fixe", thumb: "$300-500", angi: "$300+", hcp: "$149+" },
    { feature: "Frais par lead", gw: "Aucun", thumb: "$5-150 par lead", angi: "$15-85 par lead", hcp: "Aucun" },
    { feature: "Agent de reservation IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Identification de pieces IA", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Suivi GPS en direct", gw: true, thumb: false, angi: false, hcp: "Option" },
    { feature: "Facturation integree", gw: true, thumb: false, angi: false, hcp: true },
    { feature: "14 langues", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Verification d'identite", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Sequences de fidelite", gw: true, thumb: false, angi: false, hcp: false },
    { feature: "Frais d'installation", gw: "Aucun", thumb: "Aucun", angi: "Aucun", hcp: "Aucun" },
  ],
  es: [
    { feature: 'Precio mensual', gw: '$19 fijo', thumb: '$300-500', angi: '$300+', hcp: '$149+' },
    { feature: 'Costo por lead', gw: 'Ninguno', thumb: '$5-150 por lead', angi: '$15-85 por lead', hcp: 'Ninguno' },
    { feature: 'Agente de reservas IA', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Identificacion de piezas IA', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Rastreo GPS en vivo', gw: true, thumb: false, angi: false, hcp: 'Complemento' },
    { feature: 'Facturacion integrada', gw: true, thumb: false, angi: false, hcp: true },
    { feature: '14 idiomas', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Verificacion de identidad', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Secuencias de fidelidad', gw: true, thumb: false, angi: false, hcp: false },
    { feature: 'Costo de instalacion', gw: 'Ninguno', thumb: 'Ninguno', angi: 'Ninguno', hcp: 'Ninguno' },
  ],
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
type Faq = { q: string; a: string }
const FAQ_PROS: Record<string, Faq[]> = {
  en: [
    { q: 'How much does GigWrench cost?', a: '$19 per month, flat. No lead fees, no commissions, no hidden charges. Cancel any time.' },
    { q: 'How does Dispatch work when I am on a job?', a: 'When a customer texts or fills out your booking page, Dispatch replies within 90 seconds, collects their details, asks about the problem, and notifies you. You never miss a lead even when your hands are full.' },
    { q: 'Do I need to be a tech expert to use GigWrench?', a: 'No. If you can send a text, you can use GigWrench. The interface is built for Pros, not software engineers.' },
    { q: 'Does GigWrench take a cut of my earnings?', a: 'Never. Your earnings are yours. We charge a flat monthly fee. Stripe processes payments directly to your account.' },
    { q: 'What is GigWrench Lens?', a: 'Lens uses your phone camera and AI to identify any part instantly. It shows you what the part is, where to source it, and lets you add it to an invoice in one tap. No other platform offers this.' },
    { q: 'What languages is GigWrench available in?', a: 'English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian, and Swedish. The full app and booking pages work in all 14 languages.' },
  ],
  de: [
    { q: "Wie viel kostet GigWrench?", a: "$19 pro Monat, pauschal. Keine Lead-Gebühren, keine Provisionen, keine versteckten Kosten. Jederzeit kündbar." },
    { q: "Wie funktioniert Dispatch, während ich arbeite?", a: "Wenn ein Kunde schreibt oder Ihre Buchungsseite ausfüllt, antwortet Dispatch innerhalb von 90 Sekunden, erfasst die Daten, fragt nach dem Problem und benachrichtigt Sie. Sie verpassen nie einen Lead, selbst wenn Ihre Hände voll sind." },
    { q: "Muss ich ein Technikexperte sein, um GigWrench zu nutzen?", a: "Nein. Wenn Sie eine SMS senden können, können Sie GigWrench nutzen. Die Oberfläche ist für Pros gemacht, nicht für Softwareentwickler." },
    { q: "Nimmt GigWrench einen Teil meiner Einnahmen?", a: "Niemals. Ihre Einnahmen gehören Ihnen. Wir berechnen eine feste monatliche Gebühr. Stripe wickelt Zahlungen direkt auf Ihr Konto ab." },
    { q: "Was ist GigWrench Lens?", a: "Lens nutzt Ihre Handykamera und KI, um jedes Teil sofort zu erkennen. Es zeigt, was das Teil ist, wo Sie es beziehen, und fügt es mit einem Tippen zur Rechnung hinzu. Keine andere Plattform bietet das." },
    { q: "In welchen Sprachen ist GigWrench verfügbar?", a: "Englisch, Spanisch, Portugiesisch, Französisch, Arabisch, Chinesisch, Hindi, Koreanisch, Türkisch, Deutsch, Italienisch, Niederländisch, Rumänisch und Schwedisch. Die komplette App und die Buchungsseiten funktionieren in allen 14 Sprachen." },
  ],
  it: [
    { q: "Quanto costa GigWrench?", a: "$19 al mese, tariffa fissa. Nessun costo per lead, nessuna commissione, nessun costo nascosto. Disdici quando vuoi." },
    { q: "Come funziona Dispatch mentre sono al lavoro?", a: "Quando un cliente scrive o compila la tua pagina di prenotazione, Dispatch risponde entro 90 secondi, raccoglie i dati, chiede del problema e ti avvisa. Non perdi mai un lead, anche con le mani occupate." },
    { q: "Devo essere un esperto di tecnologia per usare GigWrench?", a: "No. Se sai inviare un messaggio, sai usare GigWrench. L'interfaccia è fatta per i Pro, non per gli ingegneri del software." },
    { q: "GigWrench trattiene una parte dei miei guadagni?", a: "Mai. I tuoi guadagni sono tuoi. Applichiamo una quota mensile fissa. Stripe elabora i pagamenti direttamente sul tuo conto." },
    { q: "Che cos'è GigWrench Lens?", a: "Lens usa la fotocamera del telefono e l'IA per identificare qualsiasi pezzo all'istante. Ti mostra cos'è il pezzo, dove reperirlo e ti permette di aggiungerlo a una fattura con un tocco. Nessun'altra piattaforma lo offre." },
    { q: "In quali lingue è disponibile GigWrench?", a: "Inglese, spagnolo, portoghese, francese, arabo, cinese, hindi, coreano, turco, tedesco, italiano, olandese, rumeno e svedese. L'app completa e le pagine di prenotazione funzionano in tutte le 14 lingue." },
  ],
  nl: [
    { q: "Hoeveel kost GigWrench?", a: "$19 per maand, vast. Geen lead-kosten, geen commissies, geen verborgen kosten. Altijd opzegbaar." },
    { q: "Hoe werkt Dispatch terwijl ik aan het werk ben?", a: "Wanneer een klant een bericht stuurt of uw boekingspagina invult, reageert Dispatch binnen 90 seconden, verzamelt de gegevens, vraagt naar het probleem en stelt u op de hoogte. U mist nooit een lead, zelfs niet met volle handen." },
    { q: "Moet ik een tech-expert zijn om GigWrench te gebruiken?", a: "Nee. Als u een sms kunt sturen, kunt u GigWrench gebruiken. De interface is gemaakt voor Pros, niet voor software-ingenieurs." },
    { q: "Neemt GigWrench een deel van mijn inkomsten?", a: "Nooit. Uw inkomsten zijn van u. Wij rekenen een vast maandtarief. Stripe verwerkt betalingen rechtstreeks naar uw rekening." },
    { q: "Wat is GigWrench Lens?", a: "Lens gebruikt uw telefooncamera en AI om elk onderdeel direct te identificeren. Het toont wat het onderdeel is, waar u het vindt, en laat u het met één tik aan een factuur toevoegen. Geen ander platform biedt dit." },
    { q: "In welke talen is GigWrench beschikbaar?", a: "Engels, Spaans, Portugees, Frans, Arabisch, Chinees, Hindi, Koreaans, Turks, Duits, Italiaans, Nederlands, Roemeens en Zweeds. De volledige app en boekingspagina werken in alle 14 talen." },
  ],
  ro: [
    { q: "Cât costă GigWrench?", a: "$19 pe lună, fix. Fără taxe pe lead, fără comisioane, fără costuri ascunse. Anulezi oricând." },
    { q: "Cum funcționează Dispatch când sunt la lucru?", a: "Când un client îți scrie sau completează pagina de programare, Dispatch răspunde în 90 de secunde, adună datele, întreabă despre problemă și te anunță. Nu pierzi niciodată un lead, chiar și cu mâinile ocupate." },
    { q: "Trebuie să fiu expert în tehnologie ca să folosesc GigWrench?", a: "Nu. Dacă poți trimite un mesaj, poți folosi GigWrench. Interfața e făcută pentru Pro, nu pentru ingineri software." },
    { q: "GigWrench îmi ia o parte din câștiguri?", a: "Niciodată. Câștigurile tale sunt ale tale. Percepem o taxă lunară fixă. Stripe procesează plățile direct în contul tău." },
    { q: "Ce este GigWrench Lens?", a: "Lens folosește camera telefonului și IA pentru a identifica orice piesă instant. Îți arată ce este piesa, de unde o iei și îți permite să o adaugi pe o factură cu o atingere. Nicio altă platformă nu oferă asta." },
    { q: "În ce limbi este disponibil GigWrench?", a: "Engleză, spaniolă, portugheză, franceză, arabă, chineză, hindi, coreeană, turcă, germană, italiană, olandeză, română și suedeză. Aplicația completă și paginile de programare funcționează în toate cele 14 limbi." },
  ],
  sv: [
    { q: "Vad kostar GigWrench?", a: "$19 i månaden, fast pris. Inga lead-avgifter, inga provisioner, inga dolda kostnader. Avsluta när du vill." },
    { q: "Hur fungerar Dispatch när jag är på ett jobb?", a: "När en kund skriver eller fyller i din bokningssida svarar Dispatch inom 90 sekunder, samlar in uppgifterna, frågar om problemet och meddelar dig. Du missar aldrig en lead, även med händerna fulla." },
    { q: "Måste jag vara teknikexpert för att använda GigWrench?", a: "Nej. Kan du skicka ett sms kan du använda GigWrench. Gränssnittet är byggt för proffs, inte för mjukvaruingenjörer." },
    { q: "Tar GigWrench en del av mina intäkter?", a: "Aldrig. Dina intäkter är dina. Vi tar en fast månadsavgift. Stripe hanterar betalningar direkt till ditt konto." },
    { q: "Vad är GigWrench Lens?", a: "Lens använder telefonens kamera och AI för att identifiera vilken del som helst direkt. Den visar vad delen är, var du hittar den och låter dig lägga till den på en faktura med ett tryck. Ingen annan plattform erbjuder detta." },
    { q: "Vilka språk finns GigWrench på?", a: "Engelska, spanska, portugisiska, franska, arabiska, kinesiska, hindi, koreanska, turkiska, tyska, italienska, nederländska, rumänska och svenska. Hela appen och bokningssidorna fungerar på alla 14 språk." },
  ],
  tr: [
    { q: "GigWrench ne kadar?", a: "Aylık $19, sabit. Müşteri adayı ücreti yok, komisyon yok, gizli ücret yok. İstediğiniz zaman iptal edin." },
    { q: "Ben iş üzerindeyken Dispatch nasıl çalışır?", a: "Bir müşteri mesaj attığında veya rezervasyon sayfanızı doldurduğunda, Dispatch 90 saniye içinde yanıtlar, bilgileri toplar, sorunu sorar ve sizi bilgilendirir. Elleriniz dolu olsa bile asla müşteri adayı kaçırmazsınız." },
    { q: "GigWrench kullanmak için teknoloji uzmanı olmam gerekir mi?", a: "Hayır. Mesaj atabiliyorsanız GigWrench'i kullanabilirsiniz. Arayüz, yazılım mühendisleri için değil, Pro'lar için tasarlandı." },
    { q: "GigWrench kazancımdan pay alır mı?", a: "Asla. Kazancınız sizindir. Sabit bir aylık ücret alırız. Stripe ödemeleri doğrudan hesabınıza işler." },
    { q: "GigWrench Lens nedir?", a: "Lens, telefonunuzun kamerasını ve yapay zekayı kullanarak herhangi bir parçayı anında tanır. Parçanın ne olduğunu, nereden bulacağınızı gösterir ve tek dokunuşla faturaya eklemenizi sağlar. Başka hiçbir platform bunu sunmaz." },
    { q: "GigWrench hangi dillerde sunulur?", a: "İngilizce, İspanyolca, Portekizce, Fransızca, Arapça, Çince, Hintçe, Korece, Türkçe, Almanca, İtalyanca, Felemenkçe, Rumence ve İsveççe. Uygulamanın tamamı ve rezervasyon sayfaları 14 dilin tümünde çalışır." },
  ],
  ar: [
    { q: "كم تكلفة GigWrench؟", a: "$19 شهريا، ثابت. بدون رسوم على العملاء المحتملين، بدون عمولات، بدون رسوم خفية. ألغ في أي وقت." },
    { q: "كيف يعمل Dispatch عندما أكون مشغولا بعمل؟", a: "عندما يرسل عميل رسالة أو يملأ صفحة الحجز، يرد Dispatch خلال 90 ثانية، ويجمع بياناته، ويسأل عن المشكلة، ويخطرك. لا تفوت عميلا حتى لو كانت يداك مشغولتين." },
    { q: "هل أحتاج أن أكون خبيرا تقنيا لاستخدام GigWrench؟", a: "لا. إذا كنت تستطيع إرسال رسالة نصية، يمكنك استخدام GigWrench. الواجهة مصممة للمحترفين، لا لمهندسي البرمجيات." },
    { q: "هل يأخذ GigWrench جزءا من أرباحي؟", a: "أبدا. أرباحك لك. نتقاضى رسما شهريا ثابتا. يعالج Stripe المدفوعات مباشرة إلى حسابك." },
    { q: "ما هو GigWrench Lens؟", a: "يستخدم Lens كاميرا هاتفك والذكاء الاصطناعي لتعريف أي قطعة فورا. يريك ما هي القطعة وأين تجدها ويتيح إضافتها إلى فاتورة بلمسة واحدة. لا توفر أي منصة أخرى هذا." },
    { q: "بأي لغات يتوفر GigWrench؟", a: "الإنجليزية والإسبانية والبرتغالية والفرنسية والعربية والصينية والهندية والكورية والتركية والألمانية والإيطالية والهولندية والرومانية والسويدية. التطبيق الكامل وصفحات الحجز تعمل بـ 14 لغة." },
  ],
  zh: [
    { q: "GigWrench 多少钱？", a: "每月 $19，统一收费。没有潜在客户费、没有佣金、没有隐藏费用。随时取消。" },
    { q: "我在工作时 Dispatch 如何运作？", a: "当客户发短信或填写您的预约页面时，Dispatch 会在 90 秒内回复、收集信息、询问问题并通知您。即使您腾不出手也不会错过潜在客户。" },
    { q: "使用 GigWrench 需要懂技术吗？", a: "不需要。只要会发短信，就会用 GigWrench。界面是为专业人士设计的，而不是软件工程师。" },
    { q: "GigWrench 会抽取我的收入吗？", a: "绝不。您的收入归您所有。我们只收取固定月费。Stripe 将款项直接结算到您的账户。" },
    { q: "什么是 GigWrench Lens？", a: "Lens 用您手机的相机和 AI 即时识别任何零件。它告诉您零件是什么、去哪里采购，并让您一键添加到发票。没有其他平台提供此功能。" },
    { q: "GigWrench 提供哪些语言？", a: "英语、西班牙语、葡萄牙语、法语、阿拉伯语、中文、印地语、韩语、土耳其语、德语、意大利语、荷兰语、罗马尼亚语和瑞典语。完整应用和预约页面支持全部 14 种语言。" },
  ],
  hi: [
    { q: "GigWrench ka kitna kharch hai?", a: "$19 per month, flat. Koi lead fees nahi, koi commission nahi, koi chhipa charge nahi. Kabhi bhi cancel karen." },
    { q: "Jab main kaam par hota hoon to Dispatch kaise kaam karta hai?", a: "Jab customer message karta hai ya aapka booking page bharta hai, Dispatch 90 second mein jawab deta hai, details leta hai, problem poochta hai, aur aapko bata deta hai. Haath bhare hone par bhi aap lead nahi khote." },
    { q: "GigWrench use karne ke liye tech expert hona zaroori hai?", a: "Nahi. Agar aap text bhej sakte hain, to GigWrench use kar sakte hain. Interface Pros ke liye bana hai, software engineers ke liye nahi." },
    { q: "Kya GigWrench meri kamai ka hissa leta hai?", a: "Kabhi nahi. Aapki kamai aapki hai. Hum ek flat monthly fee lete hain. Stripe payments seedhe aapke account mein process karta hai." },
    { q: "GigWrench Lens kya hai?", a: "Lens aapke phone camera aur AI se kisi bhi part ko turant pehchanta hai. Batata hai part kya hai, kahan se milega, aur ek tap mein invoice mein jod deta hai. Koi aur platform yeh nahi deta." },
    { q: "GigWrench kin bhashaon mein uplabdh hai?", a: "English, Spanish, Portuguese, French, Arabic, Chinese, Hindi, Korean, Turkish, German, Italian, Dutch, Romanian aur Swedish. Poora app aur booking pages saari 14 bhashaon mein kaam karte hain." },
  ],
  ko: [
    { q: "GigWrench 비용은 얼마인가요?", a: "월 $19 정액입니다. 리드 수수료, 커미션, 숨은 비용이 없습니다. 언제든 해지할 수 있습니다." },
    { q: "작업 중일 때 Dispatch는 어떻게 작동하나요?", a: "고객이 문자를 보내거나 예약 페이지를 작성하면 Dispatch가 90초 이내에 응답하고, 정보를 수집하고, 문제를 묻고, 알려줍니다. 손이 바빠도 리드를 놓치지 않습니다." },
    { q: "GigWrench를 쓰려면 기술 전문가여야 하나요?", a: "아니요. 문자를 보낼 수 있다면 GigWrench를 쓸 수 있습니다. 소프트웨어 엔지니어가 아니라 Pro를 위해 만든 화면입니다." },
    { q: "GigWrench가 제 수입의 일부를 가져가나요?", a: "절대 아닙니다. 수입은 모두 당신의 것입니다. 정액 월 요금만 받습니다. Stripe가 결제를 당신 계좌로 직접 처리합니다." },
    { q: "GigWrench Lens란 무엇인가요?", a: "Lens는 휴대폰 카메라와 AI로 어떤 부품이든 즉시 식별합니다. 부품이 무엇인지, 어디서 구하는지 보여주고, 한 번의 탭으로 청구서에 추가합니다. 다른 어떤 플랫폼에도 없는 기능입니다." },
    { q: "GigWrench는 어떤 언어로 제공되나요?", a: "영어, 스페인어, 포르투갈어, 프랑스어, 아랍어, 중국어, 힌디어, 한국어, 터키어, 독일어, 이탈리아어, 네덜란드어, 루마니아어, 스웨덴어. 전체 앱과 예약 페이지가 14개 언어로 작동합니다." },
  ],
  pt: [
    { q: "Quanto custa o GigWrench?", a: "$19 por mes, fixo. Sem taxas por lead, sem comissoes, sem cobrancas ocultas. Cancele quando quiser." },
    { q: "Como o Dispatch funciona quando estou trabalhando?", a: "Quando um cliente manda mensagem ou preenche sua pagina de agendamento, o Dispatch responde em menos de 90 segundos, coleta os dados, pergunta sobre o problema e avisa voce. Voce nunca perde um lead, mesmo de maos ocupadas." },
    { q: "Preciso ser especialista em tecnologia para usar o GigWrench?", a: "Nao. Se voce sabe enviar uma mensagem de texto, sabe usar o GigWrench. A interface foi feita para Pros, nao para engenheiros de software." },
    { q: "O GigWrench fica com parte dos meus ganhos?", a: "Nunca. Seus ganhos sao seus. Cobramos uma taxa mensal fixa. O Stripe processa os pagamentos direto para a sua conta." },
    { q: "O que e o GigWrench Lens?", a: "O Lens usa a camera do seu celular e IA para identificar qualquer peca na hora. Mostra o que e a peca, onde encontra-la e permite adiciona-la a uma fatura com um toque. Nenhuma outra plataforma oferece isso." },
    { q: "Em quais idiomas o GigWrench esta disponivel?", a: "Ingles, espanhol, portugues, frances, arabe, chines, hindi, coreano, turco, alemao, italiano, holandes, romeno e sueco. O app completo e as paginas de agendamento funcionam nos 14 idiomas." },
  ],
  fr: [
    { q: "Combien coute GigWrench?", a: "19$ par mois, forfait fixe. Pas de frais par lead, pas de commissions, pas de frais caches. Annulez quand vous voulez." },
    { q: "Comment Dispatch fonctionne quand je suis sur un chantier?", a: "Quand un client envoie un message ou remplit votre page de reservation, Dispatch repond en moins de 90 secondes, recueille ses informations, pose des questions sur le probleme et vous previent. Vous ne ratez jamais un lead, meme les mains prises." },
    { q: "Faut-il etre un expert en technologie pour utiliser GigWrench?", a: "Non. Si vous savez envoyer un SMS, vous savez utiliser GigWrench. L'interface est concue pour les Pros, pas pour les ingenieurs." },
    { q: "GigWrench prend-il une part de mes revenus?", a: "Jamais. Vos revenus sont a vous. Nous facturons un forfait mensuel fixe. Stripe traite les paiements directement sur votre compte." },
    { q: "Qu'est-ce que GigWrench Lens?", a: "Lens utilise la camera de votre telephone et l'IA pour identifier toute piece instantanement. Il vous montre la piece, ou la trouver, et vous permet de l'ajouter a une facture en un geste. Aucune autre plateforme ne propose cela." },
    { q: "Dans quelles langues GigWrench est-il disponible?", a: "Anglais, espagnol, portugais, francais, arabe, chinois, hindi, coreen, turc, allemand, italien, neerlandais, roumain et suedois. L'application complete et les pages de reservation fonctionnent dans les 14 langues." },
  ],
  es: [
    { q: 'Cuanto cuesta GigWrench?', a: '$19 al mes, tarifa fija. Sin costos por lead, sin comisiones, sin cargos ocultos. Cancela cuando quieras.' },
    { q: 'Como funciona Dispatch cuando estoy trabajando?', a: 'Cuando un cliente te escribe o llena tu pagina de reservas, Dispatch responde en menos de 90 segundos, recoge sus datos, pregunta por el problema y te avisa. Nunca pierdes un lead aunque tengas las manos ocupadas.' },
    { q: 'Necesito ser experto en tecnologia para usar GigWrench?', a: 'No. Si sabes enviar un mensaje de texto, sabes usar GigWrench. La interfaz esta hecha para Pros, no para ingenieros de software.' },
    { q: 'GigWrench se queda con parte de mis ganancias?', a: 'Nunca. Tus ganancias son tuyas. Cobramos una tarifa mensual fija. Stripe procesa los pagos directamente a tu cuenta.' },
    { q: 'Que es GigWrench Lens?', a: 'Lens usa la camara de tu telefono e IA para identificar cualquier pieza al instante. Te muestra que es la pieza, donde conseguirla y te permite agregarla a una factura con un toque. Ninguna otra plataforma ofrece esto.' },
    { q: 'En que idiomas esta disponible GigWrench?', a: 'Ingles, espanol, portugues, frances, arabe, chino, hindi, coreano, turco, aleman, italiano, neerlandes, rumano y sueco. La app completa y las paginas de reserva funcionan en los 14 idiomas.' },
  ],
}

const FAQ_CUSTOMERS: Record<string, Faq[]> = {
  en: [
    { q: 'How do I find and book a Pro?', a: 'Visit app.gigwrench.app and use Find a Pro to browse verified Pros near you. You can also book directly through a Pro\'s personal booking link.' },
    { q: 'Are Pros on GigWrench verified?', a: 'Yes. Pros go through government ID verification and selfie liveness checks before they are listed. You can see their verification badge on their profile.' },
    { q: 'Will I know when my Pro is on the way?', a: 'Yes. Once a Pro activates GPS tracking on their way to you, you get a live link showing their location and estimated arrival time.' },
    { q: 'Is my payment safe?', a: 'Yes. All payments are processed through Stripe, the same payment infrastructure used by Amazon, Google, and Shopify. GigWrench never stores your card details.' },
    { q: 'What if I need to cancel or reschedule?', a: 'Contact your Pro directly through the booking confirmation. Cancellation policies are set by each Pro individually.' },
  ],
  de: [
    { q: "Wie finde und buche ich einen Pro?", a: "Besuchen Sie app.gigwrench.app und nutzen Sie Pro finden, um verifizierte Pros in Ihrer Nähe zu durchsuchen. Sie können auch direkt über den persönlichen Buchungslink eines Pros buchen." },
    { q: "Sind die Pros auf GigWrench verifiziert?", a: "Ja. Pros durchlaufen eine Ausweisprüfung und einen Selfie-Lebendigkeitscheck, bevor sie gelistet werden. Das Verifizierungsabzeichen sehen Sie in ihrem Profil." },
    { q: "Erfahre ich, wann mein Pro unterwegs ist?", a: "Ja. Sobald ein Pro auf dem Weg zu Ihnen das GPS-Tracking aktiviert, erhalten Sie einen Live-Link mit Standort und geschätzter Ankunftszeit." },
    { q: "Ist meine Zahlung sicher?", a: "Ja. Alle Zahlungen laufen über Stripe, dieselbe Infrastruktur wie bei Amazon, Google und Shopify. GigWrench speichert Ihre Kartendaten nie." },
    { q: "Was, wenn ich stornieren oder verschieben muss?", a: "Kontaktieren Sie Ihren Pro direkt über die Buchungsbestätigung. Stornobedingungen legt jeder Pro selbst fest." },
  ],
  it: [
    { q: "Come trovo e prenoto un Pro?", a: "Vai su app.gigwrench.app e usa Trova un Pro per sfogliare i Pro verificati vicino a te. Puoi anche prenotare direttamente tramite il link di prenotazione personale di un Pro." },
    { q: "I Pro su GigWrench sono verificati?", a: "Sì. I Pro passano la verifica d'identità con documento ufficiale e un controllo di vitalità con selfie prima di essere elencati. Vedi il badge di verifica sul loro profilo." },
    { q: "Saprò quando il mio Pro è in arrivo?", a: "Sì. Quando un Pro attiva il tracciamento GPS mentre viene da te, ricevi un link dal vivo con la posizione e l'orario di arrivo stimato." },
    { q: "Il mio pagamento è sicuro?", a: "Sì. Tutti i pagamenti passano da Stripe, la stessa infrastruttura usata da Amazon, Google e Shopify. GigWrench non memorizza mai i dati della tua carta." },
    { q: "E se devo annullare o riprogrammare?", a: "Contatta direttamente il tuo Pro tramite la conferma di prenotazione. Le politiche di annullamento sono stabilite da ogni Pro." },
  ],
  nl: [
    { q: "Hoe vind en boek ik een Pro?", a: "Ga naar app.gigwrench.app en gebruik Vind een Pro om geverifieerde Pros bij u in de buurt te bekijken. U kunt ook rechtstreeks boeken via de persoonlijke boekingslink van een Pro." },
    { q: "Zijn Pros op GigWrench geverifieerd?", a: "Ja. Pros doorlopen een ID-verificatie en een selfie-levendigheidscontrole voordat ze worden vermeld. U ziet hun verificatiebadge op hun profiel." },
    { q: "Weet ik wanneer mijn Pro onderweg is?", a: "Ja. Zodra een Pro onderweg naar u GPS-tracking inschakelt, krijgt u een live link met hun locatie en geschatte aankomsttijd." },
    { q: "Is mijn betaling veilig?", a: "Ja. Alle betalingen lopen via Stripe, dezelfde infrastructuur die Amazon, Google en Shopify gebruiken. GigWrench bewaart nooit uw kaartgegevens." },
    { q: "Wat als ik moet annuleren of verzetten?", a: "Neem rechtstreeks contact op met uw Pro via de boekingsbevestiging. Annuleringsvoorwaarden worden door elke Pro zelf bepaald." },
  ],
  ro: [
    { q: "Cum găsesc și rezerv un Pro?", a: "Intră pe app.gigwrench.app și folosește Găsește un Pro pentru a vedea Pro verificați din apropiere. Poți rezerva și direct prin linkul personal de programare al unui Pro." },
    { q: "Pro de pe GigWrench sunt verificați?", a: "Da. Pro trec printr-o verificare de identitate cu act oficial și o verificare de vitalitate prin selfie înainte de a fi listați. Vezi insigna de verificare pe profilul lor." },
    { q: "Voi ști când Pro-ul meu e pe drum?", a: "Da. Imediat ce un Pro activează urmărirea GPS în drum spre tine, primești un link live cu locația și ora estimată de sosire." },
    { q: "Plata mea e sigură?", a: "Da. Toate plățile trec prin Stripe, aceeași infrastructură folosită de Amazon, Google și Shopify. GigWrench nu stochează niciodată datele cardului tău." },
    { q: "Ce fac dacă trebuie să anulez sau să reprogramez?", a: "Contactează-ți Pro-ul direct prin confirmarea programării. Politicile de anulare sunt stabilite de fiecare Pro." },
  ],
  sv: [
    { q: "Hur hittar och bokar jag ett proffs?", a: "Gå till app.gigwrench.app och använd Hitta ett proffs för att bläddra bland verifierade proffs nära dig. Du kan också boka direkt via ett proffs personliga bokningslänk." },
    { q: "Är proffsen på GigWrench verifierade?", a: "Ja. Proffs genomgår ID-verifiering och en selfie-livskontroll innan de listas. Du ser deras verifieringsmärke på profilen." },
    { q: "Får jag veta när mitt proffs är på väg?", a: "Ja. När ett proffs aktiverar GPS-spårning på väg till dig får du en live-länk med position och beräknad ankomsttid." },
    { q: "Är min betalning säker?", a: "Ja. Alla betalningar går via Stripe, samma infrastruktur som Amazon, Google och Shopify använder. GigWrench lagrar aldrig dina kortuppgifter." },
    { q: "Vad händer om jag måste avboka eller boka om?", a: "Kontakta ditt proffs direkt via bokningsbekräftelsen. Avbokningsvillkor sätts av varje proffs." },
  ],
  tr: [
    { q: "Nasıl Pro bulup rezervasyon yaparım?", a: "app.gigwrench.app adresine gidin ve yakınınızdaki doğrulanmış Pro'lara göz atmak için Pro Bul'u kullanın. Bir Pro'nun kişisel rezervasyon bağlantısıyla doğrudan da rezervasyon yapabilirsiniz." },
    { q: "GigWrench'teki Pro'lar doğrulanmış mı?", a: "Evet. Pro'lar listelenmeden önce resmi kimlik doğrulaması ve selfie canlılık kontrolünden geçer. Doğrulama rozetini profillerinde görebilirsiniz." },
    { q: "Pro'mun yolda olduğunu öğrenecek miyim?", a: "Evet. Bir Pro size gelirken GPS takibini açtığında, konumunu ve tahmini varış süresini gösteren canlı bir bağlantı alırsınız." },
    { q: "Ödemem güvenli mi?", a: "Evet. Tüm ödemeler, Amazon, Google ve Shopify'ın kullandığı altyapının aynısı olan Stripe üzerinden işlenir. GigWrench kart bilgilerinizi asla saklamaz." },
    { q: "İptal etmem veya yeniden planlamam gerekirse?", a: "Rezervasyon onayı üzerinden Pro'nuzla doğrudan iletişime geçin. İptal politikaları her Pro tarafından ayrı ayrı belirlenir." },
  ],
  ar: [
    { q: "كيف أجد محترفا وأحجزه؟", a: "ادخل إلى app.gigwrench.app واستخدم ابحث عن محترف لتصفح المحترفين الموثقين قربك. يمكنك أيضا الحجز مباشرة عبر رابط الحجز الشخصي لأي محترف." },
    { q: "هل المحترفون على GigWrench موثقون؟", a: "نعم. يمر المحترفون بالتحقق من الهوية بوثيقة رسمية وفحص الحيوية بصورة ذاتية قبل إدراجهم. يمكنك رؤية شارة التوثيق في ملفهم." },
    { q: "هل سأعرف متى يكون محترفي في الطريق؟", a: "نعم. عندما يفعل المحترف تتبع GPS في طريقه إليك، تحصل على رابط مباشر يظهر موقعه ووقت الوصول المتوقع." },
    { q: "هل دفعتي آمنة؟", a: "نعم. تعالج كل المدفوعات عبر Stripe، البنية نفسها التي تستخدمها Amazon وGoogle وShopify. لا يخزن GigWrench بيانات بطاقتك أبدا." },
    { q: "ماذا لو احتجت الإلغاء أو إعادة الجدولة؟", a: "تواصل مع محترفك مباشرة عبر تأكيد الحجز. سياسات الإلغاء يحددها كل محترف على حدة." },
  ],
  zh: [
    { q: "我如何找到并预约专业人士？", a: "访问 app.gigwrench.app，用查找专业人士浏览您附近已验证的专业人士。您也可以通过专业人士的个人预约链接直接预约。" },
    { q: "GigWrench 上的专业人士经过验证吗？", a: "是的。专业人士在上架前都要通过政府身份证件验证和自拍活体检测。您可以在其资料上看到验证徽章。" },
    { q: "我会知道专业人士何时在路上吗？", a: "会。专业人士在前往您处时开启 GPS 追踪后，您会收到显示其位置和预计到达时间的实时链接。" },
    { q: "我的付款安全吗？", a: "安全。所有付款都通过 Stripe 处理，与 Amazon、Google 和 Shopify 使用的支付基础设施相同。GigWrench 绝不存储您的银行卡信息。" },
    { q: "如果我需要取消或改期怎么办？", a: "通过预约确认直接联系您的专业人士。取消政策由每位专业人士各自设定。" },
  ],
  hi: [
    { q: "Main Pro kaise dhoondhun aur book karun?", a: "app.gigwrench.app par jaayein aur Find a Pro se apne paas ke verified Pros dekhein. Aap kisi Pro ke personal booking link se seedhe bhi book kar sakte hain." },
    { q: "Kya GigWrench par Pros verified hain?", a: "Haan. Pros ko list hone se pehle government ID verification aur selfie liveness check se guzarna padta hai. Aap unke profile par verification badge dekh sakte hain." },
    { q: "Kya mujhe pata chalega ki mera Pro kab raaste mein hai?", a: "Haan. Jab Pro aapke paas aate hue GPS tracking on karta hai, aapko ek live link milta hai jo unki location aur estimated arrival time dikhata hai." },
    { q: "Kya mera payment safe hai?", a: "Haan. Saare payments Stripe se process hote hain, wahi infrastructure jo Amazon, Google aur Shopify use karte hain. GigWrench kabhi aapke card details store nahi karta." },
    { q: "Agar mujhe cancel ya reschedule karna ho to?", a: "Booking confirmation se apne Pro se seedhe sampark karen. Cancellation policy har Pro alag se tay karta hai." },
  ],
  ko: [
    { q: "Pro를 어떻게 찾고 예약하나요?", a: "app.gigwrench.app에 접속해 Pro 찾기로 근처의 인증된 Pro를 둘러보세요. Pro의 개인 예약 링크로 바로 예약할 수도 있습니다." },
    { q: "GigWrench의 Pro는 인증되나요?", a: "네. Pro는 목록에 오르기 전에 정부 발급 신분증 인증과 셀피 라이브니스 확인을 거칩니다. 프로필에서 인증 배지를 볼 수 있습니다." },
    { q: "Pro가 언제 오는지 알 수 있나요?", a: "네. Pro가 당신에게 오는 길에 GPS 추적을 켜면 위치와 예상 도착 시간을 보여주는 실시간 링크를 받습니다." },
    { q: "결제가 안전한가요?", a: "네. 모든 결제는 Amazon, Google, Shopify가 쓰는 것과 동일한 Stripe 결제 인프라로 처리됩니다. GigWrench는 카드 정보를 저장하지 않습니다." },
    { q: "취소하거나 일정을 변경해야 하면요?", a: "예약 확인을 통해 Pro에게 직접 연락하세요. 취소 정책은 각 Pro가 개별적으로 정합니다." },
  ],
  pt: [
    { q: "Como encontro e agendo um Pro?", a: "Acesse app.gigwrench.app e use Encontrar um Pro para ver Pros verificados perto de voce. Voce tambem pode agendar direto pelo link pessoal de agendamento de um Pro." },
    { q: "Os Pros no GigWrench sao verificados?", a: "Sim. Os Pros passam por verificacao de identidade com documento oficial e checagem de vivacidade por selfie antes de aparecer na lista. Voce ve o selo de verificacao no perfil." },
    { q: "Vou saber quando meu Pro estiver a caminho?", a: "Sim. Quando um Pro ativa o rastreamento GPS a caminho de voce, voce recebe um link ao vivo com a localizacao e o horario estimado de chegada." },
    { q: "Meu pagamento e seguro?", a: "Sim. Todos os pagamentos passam pelo Stripe, a mesma infraestrutura usada por Amazon, Google e Shopify. O GigWrench nunca guarda os dados do seu cartao." },
    { q: "E se eu precisar cancelar ou remarcar?", a: "Fale direto com seu Pro pela confirmacao do agendamento. As politicas de cancelamento sao definidas por cada Pro." },
  ],
  fr: [
    { q: "Comment trouver et reserver un Pro?", a: "Allez sur app.gigwrench.app et utilisez Trouver un Pro pour parcourir les Pros verifies pres de chez vous. Vous pouvez aussi reserver directement via le lien de reservation personnel d'un Pro." },
    { q: "Les Pros sur GigWrench sont-ils verifies?", a: "Oui. Les Pros passent une verification d'identite avec piece officielle et un controle de presence par selfie avant d'etre listes. Vous voyez leur badge de verification sur leur profil." },
    { q: "Saurai-je quand mon Pro est en route?", a: "Oui. Des qu'un Pro active le suivi GPS en venant chez vous, vous recevez un lien en direct montrant sa position et l'heure d'arrivee estimee." },
    { q: "Mon paiement est-il securise?", a: "Oui. Tous les paiements passent par Stripe, la meme infrastructure que celle utilisee par Amazon, Google et Shopify. GigWrench ne stocke jamais les details de votre carte." },
    { q: "Et si je dois annuler ou reprogrammer?", a: "Contactez votre Pro directement via la confirmation de reservation. Les politiques d'annulation sont definies par chaque Pro." },
  ],
  es: [
    { q: 'Como encuentro y reservo un Pro?', a: 'Entra a app.gigwrench.app y usa Buscar un Pro para ver Pros verificados cerca de ti. Tambien puedes reservar directamente con el enlace de reservas de un Pro.' },
    { q: 'Los Pros en GigWrench estan verificados?', a: 'Si. Los Pros pasan por verificacion de identidad con documento oficial y prueba de vida con selfie antes de aparecer en la lista. Puedes ver su insignia de verificacion en su perfil.' },
    { q: 'Sabre cuando mi Pro va en camino?', a: 'Si. Cuando un Pro activa el rastreo GPS de camino a ti, recibes un enlace en vivo que muestra su ubicacion y la hora estimada de llegada.' },
    { q: 'Es seguro mi pago?', a: 'Si. Todos los pagos se procesan a traves de Stripe, la misma infraestructura de pagos que usan Amazon, Google y Shopify. GigWrench nunca guarda los datos de tu tarjeta.' },
    { q: 'Que pasa si necesito cancelar o reprogramar?', a: 'Contacta a tu Pro directamente desde la confirmacion de la reserva. Cada Pro define sus propias politicas de cancelacion.' },
  ],
}

// ─── LANGUAGE PICKER MODAL ───────────────────────────────────────────────────
function LanguagePicker({ onSelect }: { onSelect: (code: string) => void }) {
  const [seconds, setSeconds] = useState(6)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          onSelect('en')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [onSelect])

  const c = COPY.en
  const radius = 22
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - seconds / 6)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(7,9,13,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="bg-[#0F1520] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
              </svg>
            </div>
            <span className="font-mono text-xl tracking-widest text-white font-bold">GIG<span className="text-yellow-400">WRENCH</span></span>
          </div>
          <h2 className="font-display text-3xl text-white tracking-wide mb-2">{c.pick_lang}</h2>
          <p className="text-white/40 text-sm font-mono leading-relaxed">{c.pick_sub}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => onSelect(l.code)}
              className="px-4 py-3 rounded-xl border border-white/8 bg-white/3 text-white/70 text-sm font-mono hover:bg-yellow-400/10 hover:border-yellow-400/30 hover:text-yellow-400 transition-all text-left">
              {l.label}
            </button>
          ))}
        </div>

        {/* Countdown skip button */}
        <div className="flex justify-center">
          <button onClick={() => onSelect('en')} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
                <circle cx="28" cy="28" r={radius} fill="none" stroke="#F5C518" strokeWidth="3"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                  strokeLinecap="round"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-yellow-400">{seconds}</span>
            </div>
            <span className="font-mono text-sm text-white/40 group-hover:text-white/70 transition-colors">{c.skip}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/6 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="text-white font-medium text-sm leading-relaxed">{q}</span>
        {open ? <ChevronUp size={16} className="text-yellow-400 flex-shrink-0"/> : <ChevronDown size={16} className="text-white/30 flex-shrink-0"/>}
      </button>
      {open && <p className="text-white/50 text-sm font-mono leading-relaxed pb-5">{a}</p>}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
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

      {showPicker && <LanguagePicker onSelect={handleLangSelect}/>}

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5" style={{ background: 'rgba(7,9,13,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
            </svg>
          </div>
          <span className="font-mono font-bold text-xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="font-mono text-sm text-white/50 hover:text-white transition-colors no-underline hidden sm:block">{c.nav_signin}</Link>
          <Link href={signupHref} className="bg-yellow-400 text-black font-mono font-bold text-xs tracking-widest px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors no-underline uppercase">{c.nav_cta}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
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

        {/* Stat pills */}
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

      {/* ── PROBLEM ── */}
      <section className="py-20 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.problem_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-6 leading-tight">{c.problem_h2}</h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-3xl">{c.problem_body}</p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.feat_label}</span>
        <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-14 leading-tight">{c.feat_h2}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURE_META.map(({ icon: Icon, color }, i) => {
            const txt = (FEATURE_TEXT[lang] || FEATURE_TEXT.en)[i]
            return (
            <div key={txt.title} className="bg-gw-bg2 border border-white/6 rounded-2xl p-6 hover:border-white/12 transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <h3 className="font-mono font-bold text-sm text-white mb-2">{txt.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed font-body">{txt.desc}</p>
            </div>
            )
          })}
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="py-24 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.compare_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-14 leading-tight">{c.compare_h2}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-4 font-mono text-xs text-white/30 uppercase tracking-widest w-[30%]">{c.table_feature}</th>
                  <th className="px-6 py-4 font-mono text-xs tracking-widest text-center">
                    <span className="text-yellow-400 font-bold">GigWrench</span>
                    <div className="text-white/20 text-[10px] font-normal mt-0.5">$19/mo</div>
                  </th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">
                    Thumbtack
                    <div className="text-white/20 text-[10px] font-normal mt-0.5">$300-500/mo</div>
                  </th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">
                    Angi
                    <div className="text-white/20 text-[10px] font-normal mt-0.5">$300+/mo</div>
                  </th>
                  <th className="px-6 py-4 font-mono text-xs text-white/30 tracking-widest text-center">
                    Housecall Pro
                    <div className="text-white/20 text-[10px] font-normal mt-0.5">$149+/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(COMPARE_ROWS[lang] || COMPARE_ROWS.en).map((row, i) => (
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

      {/* ── FAQ ── */}
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
          {faqTab === 'pro'
            ? (FAQ_PROS[lang] || FAQ_PROS.en).map(item => <FaqItem key={item.q} q={item.q} a={item.a}/>)
            : (FAQ_CUSTOMERS[lang] || FAQ_CUSTOMERS.en).map(item => <FaqItem key={item.q} q={item.q} a={item.a}/>)
          }
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <section className="py-24 px-6 md:px-12 bg-gw-bg2 border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">{c.app_label}</span>
          <h2 className="font-display text-4xl md:text-6xl text-white mt-3 mb-4 leading-tight">{c.app_h2}</h2>
          <p className="text-white/40 text-base font-mono mb-12 max-w-xl mx-auto leading-relaxed">{c.app_sub}</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* Google Play badge -- coming soon */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 opacity-60 cursor-not-allowed select-none">
              <Smartphone size={20} className="text-white/40"/>
              <div className="text-left">
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{c.coming_soon}</div>
                <div className="font-mono text-sm text-white/60 font-bold">{c.app_android}</div>
              </div>
            </div>
            {/* App Store badge -- coming soon */}
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

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
              </svg>
            </div>
            <div>
              <div className="font-mono font-bold text-base tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></div>
              <div className="font-mono text-[10px] text-white/25 tracking-wider">{c.footer_tagline}</div>
            </div>
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

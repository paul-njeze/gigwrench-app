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
  },
  es: {
    pick_lang: 'Elige tu idioma',
    pick_sub: 'GigWrench esta disponible en 10 idiomas para Pros y clientes de todo el mundo.',
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
  },
  pt: {
    pick_lang: 'Escolha seu idioma',
    pick_sub: 'GigWrench esta disponivel em 10 idiomas para Pros e clientes no mundo todo.',
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
  },
  fr: {
    pick_lang: 'Choisissez votre langue',
    pick_sub: 'GigWrench est disponible en 10 langues pour les Pros et les clients du monde entier.',
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
  },
  pl: {
    pick_lang: 'Wybierz jezyk',
    pick_sub: 'GigWrench jest dostepny w 10 jezykach dla Pros i klientow na calym swiecie.',
    skip: 'Kontynuuj po angielsku',
    nav_signin: 'Zaloguj sie',
    nav_cta: 'Zacznij za darmo',
    hero_h1_a: 'Prowadz swoj biznes',
    hero_h1_b: 'jak Pro.',
    hero_sub: 'GigWrench daje samodzielnym Pros narzedzia AI do zdobywania wiecej zlecen, szybszych platnosci i nigdy nie tracenia klientow. Wszystko za 19$ miesiecznie.',
    hero_cta1: 'Zacznij za darmo',
    hero_cta2: 'Zobacz jak dziala',
    problem_label: 'Problem',
    problem_h2: 'Samodzielna praca w rzemioslach jest trudna.',
    problem_body: 'Odbierasz telefony podczas pracy. Scigasz platnosci. Tracisz klientow gdy jestes zajety. GigWrench rozwiazuje to wszystko.',
    feat_label: 'Funkcje',
    feat_h2: 'Wszystko czego Pro potrzebuje.',
    compare_label: 'Porownanie',
    compare_h2: 'Dlaczego Pros wybieraja GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Odpowiedzi na pytania.',
    faq_pro: 'Dla Pros',
    faq_cust: 'Dla klientow',
    app_label: 'Aplikacja mobilna',
    app_h2: 'Zabierz GigWrench wszedzie.',
    app_sub: 'Natywne aplikacje na Android i iOS sa w drodze. Zarejestruj sie teraz.',
    app_android: 'Wkrotce w Google Play',
    app_ios: 'Wkrotce w App Store',
    app_beta: 'Dolacz do bety na web',
    footer_tagline: 'Zbudowane dla Pros. Zasilane AI.',
    footer_copy: '2026 GigWrench. Wszelkie prawa zastrzezone.',
  },
  ar: {
    pick_lang: 'اختر لغتك',
    pick_sub: 'GigWrench متاح بـ 10 لغات للمحترفين والعملاء حول العالم.',
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
  },
  tl: {
    pick_lang: 'Piliin ang iyong wika',
    pick_sub: 'Available ang GigWrench sa 10 wika para sa mga Pro at customer sa buong mundo.',
    skip: 'Magpatuloy sa Ingles',
    nav_signin: 'Mag-sign in',
    nav_cta: 'Magsimula nang libre',
    hero_h1_a: 'Pamahalaan ang iyong trabaho',
    hero_h1_b: 'tulad ng isang Pro.',
    hero_sub: 'Binibigyan ng GigWrench ang mga solong Pro ng mga tool na pinapagana ng AI para manalo ng mas maraming trabaho, mas mabilis na mabayaran at hindi kailanman makaligtaan ang isang lead.',
    hero_cta1: 'Magsimula nang libre',
    hero_cta2: 'Tingnan kung paano gumagana',
    problem_label: 'Ang Problema',
    problem_h2: 'Mahirap ang pagiging solo na Pro.',
    problem_body: 'Sumasagot ka ng tawag habang nagtatrabaho. Hinahabol mo ang bayad. Nawawalan ka ng mga customer kapag abala ka. Inaayos ng GigWrench ang lahat.',
    feat_label: 'Mga Feature',
    feat_h2: 'Lahat ng kailangan ng isang Pro.',
    compare_label: 'Paghahambing',
    compare_h2: 'Bakit pinipili ng mga Pro ang GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Mga sagot sa iyong mga tanong.',
    faq_pro: 'Para sa mga Pro',
    faq_cust: 'Para sa mga Customer',
    app_label: 'Mobile App',
    app_h2: 'Dalhin ang GigWrench saan man.',
    app_sub: 'Mga native app para sa Android at iOS ay paparating na. Mag-sign up sa web ngayon.',
    app_android: 'Paparating sa Google Play',
    app_ios: 'Paparating sa App Store',
    app_beta: 'Sumali sa beta sa web',
    footer_tagline: 'Para sa mga Pro. Pinapatakbo ng AI.',
    footer_copy: '2026 GigWrench. Lahat ng karapatan ay nakalaan.',
  },
  ru: {
    pick_lang: 'Vyberi yazyk',
    pick_sub: 'GigWrench dostup na 10 yazykakh dlya Pros i klientov po vsemu miru.',
    skip: 'Prodolzhit po-angliyski',
    nav_signin: 'Voyti',
    nav_cta: 'Nachat besplatno',
    hero_h1_a: 'Vedi svoy biznes',
    hero_h1_b: 'kak Pro.',
    hero_sub: 'GigWrench daet samostoyatelnym Pros instrumenty IA dlya polucheniya bolshe zakazov, bystrykh platezhey i nikogda ne teryat klientov. Vsego za 19 dollarov v mesyats.',
    hero_cta1: 'Nachat besplatno',
    hero_cta2: 'Uznat kak eto rabotaet',
    problem_label: 'Problema',
    problem_h2: 'Samostoyatelnaya rabota. Eto tyazhelo.',
    problem_body: 'Ty otvechaesh na zvonki vo vremya raboty. Gonishsya za platezhami. Teryaesh klientov kogda zanyt. GigWrench reshit vsyo eto.',
    feat_label: 'Funktsii',
    feat_h2: 'Vsyo chto nuzhno Pro.',
    compare_label: 'Sravneniye',
    compare_h2: 'Pochemu Pros vybrayut GigWrench.',
    faq_label: 'FAQ',
    faq_h2: 'Otvety na voprosy.',
    faq_pro: 'Dlya Pros',
    faq_cust: 'Dlya klientov',
    app_label: 'Mobilnoye prilozheniye',
    app_h2: 'Beri GigWrench s soboy.',
    app_sub: 'Nativnyye prilozhenia dlya Android i iOS skoro budut. Zaregistiriruysya na sayte seychas.',
    app_android: 'Skoro v Google Play',
    app_ios: 'Skoro v App Store',
    app_beta: 'Prisoedinitsa k bete na sayte',
    footer_tagline: 'Sozdan dlya Pros. Zasilyen AI.',
    footer_copy: '2026 GigWrench. Vse prava zashchishcheny.',
  },
  zh: {
    pick_lang: '选择您的语言',
    pick_sub: 'GigWrench 提供 10 种语言，服务全球的专业人士和客户。',
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
  },
  hi: {
    pick_lang: 'Apni bhasha chunein',
    pick_sub: 'GigWrench 10 bhashaon mein uplabdh hai, duniya bhar ke Pros aur customers ke liye.',
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
  },
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageSquare, title: 'Dispatch AI Booking', desc: 'Responds to new leads in under 90 seconds while you are on a job. No competitor does this.', color: '#3B82F6' },
  { icon: Camera, title: 'GigWrench Lens', desc: 'Point your camera at any part. Get instant identification, supplier alternatives, and add it to an invoice. Completely unique to GigWrench.', color: '#F59E0B' },
  { icon: MapPin, title: 'Live GPS Tracking', desc: 'Customers see exactly where you are and when you will arrive. Eliminates the "are you coming?" calls.', color: '#10B981' },
  { icon: FileText, title: 'Smart Invoicing', desc: 'Create professional invoices and send a Stripe payment link in under a minute. No more chasing payments.', color: '#8B5CF6' },
  { icon: Users, title: 'Customer CRM', desc: 'Every customer, every job, every note in one place. Know who owes you money and who is a repeat client.', color: '#EF4444' },
  { icon: Zap, title: 'Loyalty Engine', desc: 'Automatically reaches out to past customers with tips, check-ins, and booking nudges. Keeps your calendar full without effort.', color: '#F59E0B' },
  { icon: Globe, title: '10 Languages', desc: 'The only platform in the trades market built for the Hispanic and multilingual workforce. Available in English, Spanish, Portuguese, French, Polish, Arabic, Tagalog, Russian, Chinese, and Hindi.', color: '#06B6D4' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Revenue trends, job stats, customer breakdown. Know exactly how your business is performing at a glance.', color: '#10B981' },
]

// ─── COMPARISON ───────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: 'Monthly price', gw: '$19 flat', thumb: '$300-500', angi: '$300+', hcp: '$149+' },
  { feature: 'Lead fees', gw: 'None', thumb: '$5-150 per lead', angi: '$15-85 per lead', hcp: 'None' },
  { feature: 'AI booking agent', gw: true, thumb: false, angi: false, hcp: false },
  { feature: 'AI part identification', gw: true, thumb: false, angi: false, hcp: false },
  { feature: 'Live GPS tracking', gw: true, thumb: false, angi: false, hcp: 'Add-on' },
  { feature: 'Invoicing built in', gw: true, thumb: false, angi: false, hcp: true },
  { feature: '10+ languages', gw: true, thumb: false, angi: false, hcp: false },
  { feature: 'ID verification', gw: true, thumb: false, angi: false, hcp: false },
  { feature: 'Loyalty sequences', gw: true, thumb: false, angi: false, hcp: false },
  { feature: 'Setup fee', gw: 'None', thumb: 'None', angi: 'None', hcp: 'None' },
]

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_PROS = [
  { q: 'How much does GigWrench cost?', a: '$19 per month, flat. No lead fees, no commissions, no hidden charges. Cancel any time.' },
  { q: 'How does Dispatch work when I am on a job?', a: 'When a customer texts or fills out your booking page, Dispatch replies within 90 seconds, collects their details, asks about the problem, and notifies you. You never miss a lead even when your hands are full.' },
  { q: 'Do I need to be a tech expert to use GigWrench?', a: 'No. If you can send a text, you can use GigWrench. The interface is built for Pros, not software engineers.' },
  { q: 'Does GigWrench take a cut of my earnings?', a: 'Never. Your earnings are yours. We charge a flat monthly fee. Stripe processes payments directly to your account.' },
  { q: 'What is GigWrench Lens?', a: 'Lens uses your phone camera and AI to identify any part instantly. It shows you what the part is, where to source it, and lets you add it to an invoice in one tap. No other platform offers this.' },
  { q: 'What languages is GigWrench available in?', a: 'English, Spanish, Portuguese, French, Polish, Arabic, Tagalog, Russian, Chinese, and Hindi. The full app and booking pages work in all 14 languages.' },
]

const FAQ_CUSTOMERS = [
  { q: 'How do I find and book a Pro?', a: 'Visit app.gigwrench.app and use Find a Pro to browse verified Pros near you. You can also book directly through a Pro\'s personal booking link.' },
  { q: 'Are Pros on GigWrench verified?', a: 'Yes. Pros go through government ID verification and selfie liveness checks before they are listed. You can see their verification badge on their profile.' },
  { q: 'Will I know when my Pro is on the way?', a: 'Yes. Once a Pro activates GPS tracking on their way to you, you get a live link showing their location and estimated arrival time.' },
  { q: 'Is my payment safe?', a: 'Yes. All payments are processed through Stripe, the same payment infrastructure used by Amazon, Google, and Shopify. GigWrench never stores your card details.' },
  { q: 'What if I need to cancel or reschedule?', a: 'Contact your Pro directly through the booking confirmation. Cancellation policies are set by each Pro individually.' },
]

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
  const c = COPY[lang] || COPY.en
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
  }

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
          <Link href="/signup" className="bg-yellow-400 text-black font-mono font-bold text-xs tracking-widest px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors no-underline uppercase">{c.nav_cta}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-yellow-400/8 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
          <span className="font-mono text-xs text-yellow-400 tracking-wider uppercase">Beta now live</span>
        </div>
        <h1 className="font-display text-6xl md:text-8xl xl:text-9xl text-white leading-none tracking-wide mb-6">
          {c.hero_h1_a}<br/>
          <span className="text-yellow-400">{c.hero_h1_b}</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-10">{c.hero_sub}</p>
        <div className="flex flex-wrap gap-4 mb-16">
          <Link href="/signup" className="bg-yellow-400 text-black font-mono font-bold text-sm tracking-widest px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors no-underline uppercase inline-flex items-center gap-2">
            {c.hero_cta1}
          </Link>
          <a href="#features" className="border border-white/15 text-white/70 font-mono text-sm px-8 py-4 rounded-2xl hover:border-white/30 hover:text-white transition-colors no-underline">
            {c.hero_cta2}
          </a>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Clock, val: '<90s', label: 'Lead response' },
            { icon: DollarSign, val: '$19/mo', label: 'Flat rate, no fees' },
            { icon: Globe, val: '10', label: 'Languages' },
            { icon: Shield, val: '100%', label: 'ID verified Pros' },
            { icon: Star, val: '40M+', label: 'US solo Pros' },
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
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-gw-bg2 border border-white/6 rounded-2xl p-6 hover:border-white/12 transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <h3 className="font-mono font-bold text-sm text-white mb-2">{title}</h3>
              <p className="text-white/40 text-xs leading-relaxed font-body">{desc}</p>
            </div>
          ))}
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
                  <th className="text-left px-6 py-4 font-mono text-xs text-white/30 uppercase tracking-widest w-[30%]">Feature</th>
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
                {COMPARE_ROWS.map((row, i) => (
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
            ? FAQ_PROS.map(item => <FaqItem key={item.q} q={item.q} a={item.a}/>)
            : FAQ_CUSTOMERS.map(item => <FaqItem key={item.q} q={item.q} a={item.a}/>)
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
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Coming soon</div>
                <div className="font-mono text-sm text-white/60 font-bold">{c.app_android}</div>
              </div>
            </div>
            {/* App Store badge -- coming soon */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 opacity-60 cursor-not-allowed select-none">
              <Smartphone size={20} className="text-white/40"/>
              <div className="text-left">
                <div className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Coming soon</div>
                <div className="font-mono text-sm text-white/60 font-bold">{c.app_ios}</div>
              </div>
            </div>
          </div>

          <Link href="/signup" className="inline-flex items-center gap-2 bg-yellow-400 text-black font-mono font-bold text-sm tracking-widest px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors no-underline uppercase">
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
            <Link href="/signup" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">Sign Up</Link>
            <Link href="/login" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">Sign In</Link>
            <Link href="/terms" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">Terms</Link>
            <Link href="/privacy" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">Privacy</Link>
            <a href="mailto:paul@gigwrench.app" className="font-mono text-xs text-white/40 hover:text-white/70 transition-colors no-underline">Contact</a>
          </div>

          <div className="font-mono text-[10px] text-white/20">{c.footer_copy}</div>
        </div>
      </footer>
    </div>
  )
}

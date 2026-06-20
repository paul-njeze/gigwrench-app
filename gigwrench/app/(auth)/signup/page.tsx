'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthArtPanel from '@/components/auth/AuthArtPanel'
import { Check, X, Eye, EyeOff, Shield, AlertCircle, Wrench, Home } from 'lucide-react'
import { LANGUAGES, Language } from '@/lib/lang/index'

const LANG_ORDER: Language[] = ['en','es','pt','fr','ar','zh','hi','ko','tr','de','it','nl','ro','sv']

const UI: Record<Language, Record<string, string>> = {
  en: {
    step_lang: 'Choose your language', step_lang_sub: 'You can change this any time in settings.',
    title: 'Create Your Account', sub: 'Join GigWrench - free to start',
    role_q: 'I am joining as a...', role_pro: 'Pro - I offer services', role_cust: 'Customer - I need services',
    country_label: 'Country', currency_label: 'Currency',
    first: 'First Name', last: 'Last Name', email: 'Email Address', password: 'Password', confirm: 'Confirm Password',
    show: 'Show', hide: 'Hide', creating: 'Creating account...', create: 'Create Account',
    or: 'or continue with', google: 'Continue with Google',
    have_account: 'Already have an account?', signin: 'Sign in',
    terms_pre: 'By creating an account you agree to our', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy',
    pw_title: 'Account Security Requirements',
    pw_length: 'Minimum 12 characters', pw_upper: 'At least one uppercase letter (A-Z)',
    pw_lower: 'At least one lowercase letter (a-z)', pw_number: 'At least one number (0-9)',
    pw_special: 'At least one special character (!@#$...)', pw_no_common: 'Not a commonly used password',
    pw_no_spaces: 'No leading or trailing spaces', pw_match: 'Passwords match',
    pw_strength: 'Password strength', weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong',
    err_match: 'Passwords do not match', err_weak: 'Password does not meet requirements',
    err_email: 'Please enter a valid email address', err_generic: 'Something went wrong. Please try again.',
    err_exists: 'An account with this email already exists. Sign in instead.',
    nist_note: 'Your account is protected by enterprise-grade security standards.',
    loading_countries: 'Loading countries...',
  },
  es: {
    step_lang: 'Elige tu idioma', step_lang_sub: 'Puedes cambiarlo en cualquier momento.',
    title: 'Crea tu cuenta', sub: 'Unete a GigWrench - gratis para empezar',
    role_q: 'Me uno como...', role_pro: 'Pro - ofrezco servicios', role_cust: 'Cliente - necesito servicios',
    country_label: 'Pais', currency_label: 'Moneda',
    first: 'Nombre', last: 'Apellido', email: 'Correo electronico', password: 'Contrasena', confirm: 'Confirmar contrasena',
    show: 'Ver', hide: 'Ocultar', creating: 'Creando cuenta...', create: 'Crear cuenta',
    or: 'o continua con', google: 'Continuar con Google',
    have_account: 'Ya tienes una cuenta?', signin: 'Inicia sesion',
    terms_pre: 'Al crear una cuenta aceptas nuestros', terms: 'Terminos de servicio', and: 'y', privacy: 'Politica de privacidad',
    pw_title: 'Requisitos de seguridad', pw_length: 'Minimo 12 caracteres', pw_upper: 'Al menos una mayuscula (A-Z)',
    pw_lower: 'Al menos una minuscula (a-z)', pw_number: 'Al menos un numero (0-9)',
    pw_special: 'Al menos un caracter especial (!@#$...)', pw_no_common: 'No es una contrasena comun',
    pw_no_spaces: 'Sin espacios al inicio o al final', pw_match: 'Las contrasenas coinciden',
    pw_strength: 'Fortaleza', weak: 'Debil', fair: 'Regular', good: 'Buena', strong: 'Fuerte',
    err_match: 'Las contrasenas no coinciden', err_weak: 'La contrasena no cumple los requisitos',
    err_email: 'Ingresa un correo valido', err_generic: 'Algo salio mal. Intentalo de nuevo.',
    err_exists: 'Ya existe una cuenta con este correo. Inicia sesion.',
    nist_note: 'Tu cuenta esta protegida por estandares de seguridad de nivel empresarial.',
    loading_countries: 'Cargando paises...',
  },
  pt: {
    step_lang: 'Escolha seu idioma', step_lang_sub: 'Voce pode alterar isso a qualquer momento.',
    title: 'Crie sua conta', sub: 'Entre no GigWrench - gratis para comecar',
    role_q: 'Estou entrando como...', role_pro: 'Pro - ofereco servicos', role_cust: 'Cliente - preciso de servicos',
    country_label: 'Pais', currency_label: 'Moeda',
    first: 'Nome', last: 'Sobrenome', email: 'Endereco de email', password: 'Senha', confirm: 'Confirmar senha',
    show: 'Ver', hide: 'Ocultar', creating: 'Criando conta...', create: 'Criar conta',
    or: 'ou continue com', google: 'Continuar com Google',
    have_account: 'Ja tem uma conta?', signin: 'Entrar',
    terms_pre: 'Ao criar uma conta voce concorda com nossos', terms: 'Termos de Servico', and: 'e', privacy: 'Politica de Privacidade',
    pw_title: 'Requisitos de seguranca', pw_length: 'Minimo 12 caracteres', pw_upper: 'Pelo menos uma letra maiuscula (A-Z)',
    pw_lower: 'Pelo menos uma letra minuscula (a-z)', pw_number: 'Pelo menos um numero (0-9)',
    pw_special: 'Pelo menos um caractere especial (!@#$...)', pw_no_common: 'Nao e uma senha comum',
    pw_no_spaces: 'Sem espacos no inicio ou no fim', pw_match: 'As senhas coincidem',
    pw_strength: 'Forca', weak: 'Fraca', fair: 'Regular', good: 'Boa', strong: 'Forte',
    err_match: 'As senhas nao coincidem', err_weak: 'A senha nao atende aos requisitos',
    err_email: 'Insira um email valido', err_generic: 'Algo deu errado. Tente novamente.',
    err_exists: 'Ja existe uma conta com este email. Faca login.',
    nist_note: 'Sua conta e protegida por padroes de seguranca empresarial.',
    loading_countries: 'Carregando paises...',
  },
  fr: {
    step_lang: 'Choisissez votre langue', step_lang_sub: 'Vous pouvez le modifier a tout moment.',
    title: 'Creer votre compte', sub: 'Rejoignez GigWrench - gratuit pour commencer',
    role_q: 'Je rejoins en tant que...', role_pro: 'Pro - je propose des services', role_cust: "Client - j'ai besoin de services",
    country_label: 'Pays', currency_label: 'Devise',
    first: 'Prenom', last: 'Nom', email: 'Adresse email', password: 'Mot de passe', confirm: 'Confirmer le mot de passe',
    show: 'Voir', hide: 'Masquer', creating: 'Creation du compte...', create: 'Creer un compte',
    or: 'ou continuer avec', google: 'Continuer avec Google',
    have_account: 'Vous avez deja un compte ?', signin: 'Se connecter',
    terms_pre: 'En creant un compte vous acceptez nos', terms: "Conditions d'utilisation", and: 'et', privacy: 'Politique de confidentialite',
    pw_title: 'Exigences de securite', pw_length: 'Minimum 12 caracteres', pw_upper: 'Au moins une majuscule (A-Z)',
    pw_lower: 'Au moins une minuscule (a-z)', pw_number: 'Au moins un chiffre (0-9)',
    pw_special: 'Au moins un caractere special (!@#$...)', pw_no_common: 'Pas un mot de passe courant',
    pw_no_spaces: "Pas d'espaces au debut ou a la fin", pw_match: 'Les mots de passe correspondent',
    pw_strength: 'Force', weak: 'Faible', fair: 'Moyen', good: 'Bon', strong: 'Fort',
    err_match: 'Les mots de passe ne correspondent pas', err_weak: 'Le mot de passe ne repond pas aux exigences',
    err_email: 'Veuillez entrer une adresse email valide', err_generic: "Une erreur s'est produite. Reessayez.",
    err_exists: 'Un compte avec cet email existe deja. Connectez-vous.',
    nist_note: 'Votre compte est protege par des normes de securite professionnelles.',
    loading_countries: 'Chargement des pays...',
  },
  ar: {
    step_lang: 'اختر لغتك', step_lang_sub: 'يمكنك تغيير ذلك في اي وقت.',
    title: 'انشئ حسابك', sub: 'انضم الى GigWrench - مجاني للبدء',
    role_q: 'انضم بصفتي...', role_pro: 'محترف - اقدم خدمات', role_cust: 'عميل - احتاج خدمات',
    country_label: 'الدولة', currency_label: 'العملة',
    first: 'الاسم الاول', last: 'اسم العائلة', email: 'البريد الالكتروني', password: 'كلمة المرور', confirm: 'تاكيد كلمة المرور',
    show: 'اظهار', hide: 'اخفاء', creating: 'جاري انشاء الحساب...', create: 'انشاء حساب',
    or: 'او تابع مع', google: 'المتابعة مع Google',
    have_account: 'لديك حساب بالفعل?', signin: 'تسجيل الدخول',
    terms_pre: 'بانشاء حساب فانت توافق على', terms: 'شروط الخدمة', and: 'و', privacy: 'سياسة الخصوصية',
    pw_title: 'متطلبات الامان', pw_length: '12 حرفا على الاقل', pw_upper: 'حرف كبير واحد على الاقل (A-Z)',
    pw_lower: 'حرف صغير واحد على الاقل (a-z)', pw_number: 'رقم واحد على الاقل (0-9)',
    pw_special: 'رمز خاص واحد على الاقل (!@#$...)', pw_no_common: 'ليست كلمة مرور شائعة',
    pw_no_spaces: 'بدون مسافات في البداية او النهاية', pw_match: 'كلمات المرور متطابقة',
    pw_strength: 'القوة', weak: 'ضعيفة', fair: 'متوسطة', good: 'جيدة', strong: 'قوية',
    err_match: 'كلمات المرور غير متطابقة', err_weak: 'كلمة المرور لا تلبي المتطلبات',
    err_email: 'الرجاء ادخال بريد الكتروني صالح', err_generic: 'حدث خطا ما. حاول مرة اخرى.',
    err_exists: 'يوجد حساب بهذا البريد بالفعل. سجل دخولك.',
    nist_note: 'حسابك محمي بمعايير امان احترافية.',
    loading_countries: 'جاري تحميل الدول...',
  },
  zh: {
    step_lang: '选择您的语言', step_lang_sub: '您可以随时在设置中更改。',
    title: '创建您的账户', sub: '加入 GigWrench - 免费开始',
    role_q: '我以...身份加入', role_pro: '专业人士 - 我提供服务', role_cust: '客户 - 我需要服务',
    country_label: '国家', currency_label: '货币',
    first: '名字', last: '姓氏', email: '电子邮件', password: '密码', confirm: '确认密码',
    show: '显示', hide: '隐藏', creating: '正在创建账户...', create: '创建账户',
    or: '或继续使用', google: '使用 Google 继续',
    have_account: '已有账户?', signin: '登录',
    terms_pre: '创建账户即表示您同意我们的', terms: '服务条款', and: '和', privacy: '隐私政策',
    pw_title: '账户安全要求', pw_length: '至少12个字符', pw_upper: '至少一个大写字母 (A-Z)',
    pw_lower: '至少一个小写字母 (a-z)', pw_number: '至少一个数字 (0-9)',
    pw_special: '至少一个特殊字符 (!@#$...)', pw_no_common: '不是常用密码',
    pw_no_spaces: '开头或结尾不能有空格', pw_match: '密码匹配',
    pw_strength: '强度', weak: '弱', fair: '一般', good: '良好', strong: '强',
    err_match: '密码不匹配', err_weak: '密码不符合要求',
    err_email: '请输入有效的电子邮件地址', err_generic: '出了点问题，请重试。',
    err_exists: '该邮筱已注册账户，请登录。',
    nist_note: '您的账户受企业级安全标准保护。',
    loading_countries: '正在加载国家...',
  },
  hi: {
    step_lang: 'अपनी भाषा चुनें', step_lang_sub: 'आप इसे किसी भी समय बदल सकते हैं।',
    title: 'अपना खाता बनाएं', sub: 'GigWrench से जुड़ें - शुरू करें मुफ्त',
    role_q: 'मैं शामिल हो रहा हूं...', role_pro: 'Pro - मैं सेवाएं प्रदान करता हूं', role_cust: 'ग्राहक - मुझे सेवाएं चाहिए',
    country_label: 'देश', currency_label: 'मुद्रा',
    first: 'पहला नाम', last: 'अंतिम नाम', email: 'ईमेल पता', password: 'पासवर्ड', confirm: 'पासवर्ड की पुष्टि करें',
    show: 'दिखाएं', hide: 'छुपाएं', creating: 'खाता बना रहे हैं...', create: 'खाता बनाएं',
    or: 'या जारी रखें', google: 'Google से जारी रखें',
    have_account: 'पहले से खाता है?', signin: 'साइन इन करें',
    terms_pre: 'खाता बनाकर आप हमारी', terms: 'सेवा की शर्तें', and: 'और', privacy: 'गोपनीयता नीति',
    pw_title: 'सुरक्षा आवश्यकताएं', pw_length: 'न्यूनतम 12 अक्षर', pw_upper: 'कम से कम एक बड़ा अक्षर (A-Z)',
    pw_lower: 'कम से कम एक छोटा अक्षर (a-z)', pw_number: 'कम से कम एक संख्या (0-9)',
    pw_special: 'कम से कम एक विशेष वर्ण (!@#$...)', pw_no_common: 'सामान्य पासवर्ड नहीं',
    pw_no_spaces: 'शुरू या अंत में स्पेस नहीं', pw_match: 'पासवर्ड मेल खाते हैं',
    pw_strength: 'ताकत', weak: 'कमजोर', fair: 'ठीक', good: 'अच्छा', strong: 'मजबूत',
    err_match: 'पासवर्ड मेल नहीं खाते', err_weak: 'पासवर्ड आवश्यकताएं पूरी नहीं होतीं',
    err_email: 'कृपया एक वैध ईमेल दर्ज करें', err_generic: 'कुछ गलत हो गया। दोबारा कोशिश करें।',
    err_exists: 'इस ईमेल से पहले से खाता है। साइन इन करें।',
    nist_note: 'आपका खाता उद्यम-स्तरीय सुरक्षा मानकों द्वारा सुरक्षिت है।',
    loading_countries: 'देश लोड हो रहे हैं...',
  },
  ko: {
    step_lang: '언어를 선택하세요', step_lang_sub: '설정에서 언제든지 변경할 수 있습니다.',
    title: '계정 만들기', sub: 'GigWrench 가입 - 무료로 시작',
    role_q: '가입 유형을 선택하세요', role_pro: 'Pro - 서비스를 제공합니다', role_cust: '고객 - 서비스가 필요합니다',
    country_label: '국가', currency_label: '통화',
    first: '이름', last: '성', email: '이메일 주소', password: '비밀번호', confirm: '비밀번호 확인',
    show: '표시', hide: '숨기기', creating: '계정 생성 중...', create: '계정 만들기',
    or: '또는 계속', google: 'Google로 계속',
    have_account: '이미 계정이 있나요?', signin: '로그인',
    terms_pre: '계정을 만들면 당사의', terms: '서비스 약관', and: '의', privacy: '개인정보 처리방침',
    pw_title: '보안 요구사항', pw_length: '최소 12자', pw_upper: '대문자 하나 이상 (A-Z)',
    pw_lower: '소문자 하나 이상 (a-z)', pw_number: '숫자 하나 이상 (0-9)',
    pw_special: '특수문자 하나 이상 (!@#$...)', pw_no_common: '일반적인 비밀번호 아님',
    pw_no_spaces: '앞뒤 공백 없음', pw_match: '비밀번호 일치',
    pw_strength: '강도', weak: '약함', fair: '보통', good: '좋음', strong: '강함',
    err_match: '비밀번호가 일치하지 않습니다', err_weak: '비밀번호가 요구사항을 충족하지 않습니다',
    err_email: '유효한 이메일을 입력하세요', err_generic: '오류가 발생했습니다. 다시 시도하세요.',
    err_exists: '이 이메일로 이미 계정이 있습니다. 로그인하세요.',
    nist_note: '귀하의 계정은 기업 수준의 보안 표준으로 보호됩니다.',
    loading_countries: '국가 로딩 중...',
  },
  tr: {
    step_lang: 'Dilinizi secin', step_lang_sub: 'Bunu ayarlardan istediginiz zaman degistirebilirsiniz.',
    title: 'Hesabinizi olusturun', sub: "GigWrench'e katilin - ucretsiz baslayin",
    role_q: 'Olarak katiliyorum...', role_pro: 'Pro - hizmet sunuyorum', role_cust: 'Musteri - hizmet ihtiyacim var',
    country_label: 'Ulke', currency_label: 'Para birimi',
    first: 'Ad', last: 'Soyad', email: 'E-posta adresi', password: 'Sifre', confirm: 'Sifreyi onayla',
    show: 'Goster', hide: 'Gizle', creating: 'Hesap olusturuluyor...', create: 'Hesap olustur',
    or: 'veya devam et', google: 'Google ile devam et',
    have_account: 'Zaten hesabiniz var mi?', signin: 'Giris yap',
    terms_pre: 'Hesap olusturarak kabul ediyorsunuz', terms: 'Kullanim Sartlari', and: 've', privacy: 'Gizlilik Politikasi',
    pw_title: 'Guvenlik gereksinimleri', pw_length: 'Minimum 12 karakter', pw_upper: 'En az bir buyuk harf (A-Z)',
    pw_lower: 'En az bir kucuk harf (a-z)', pw_number: 'En az bir rakam (0-9)',
    pw_special: 'En az bir ozel karakter (!@#$...)', pw_no_common: 'Yaygin bir sifre degil',
    pw_no_spaces: 'Basta veya sonda bosluk yok', pw_match: 'Sifreler eslesiyor',
    pw_strength: 'Guc', weak: 'Zayif', fair: 'Orta', good: 'Iyi', strong: 'Guclu',
    err_match: 'Sifreler eslesmiyor', err_weak: 'Sifre gereksinimleri karsilanmiyor',
    err_email: 'Gecerli bir e-posta adresi girin', err_generic: 'Bir seyler yanlis gitti. Tekrar deneyin.',
    err_exists: 'Bu e-posta ile zaten bir hesap var. Giris yapin.',
    nist_note: 'Hesabiniz kurumsal duzeyde guvenlik standartlariyla korunmaktadir.',
    loading_countries: 'Ulkeler yukleniyor...',
  },
  de: {
    step_lang: 'Sprache wahlen', step_lang_sub: 'Sie konnen dies jederzeit in den Einstellungen andern.',
    title: 'Konto erstellen', sub: 'GigWrench beitreten - kostenlos starten',
    role_q: 'Ich trete bei als...', role_pro: 'Pro - ich biete Dienste an', role_cust: 'Kunde - ich benotige Dienste',
    country_label: 'Land', currency_label: 'Wahrung',
    first: 'Vorname', last: 'Nachname', email: 'E-Mail-Adresse', password: 'Passwort', confirm: 'Passwort bestatigen',
    show: 'Anzeigen', hide: 'Verbergen', creating: 'Konto wird erstellt...', create: 'Konto erstellen',
    or: 'oder weiter mit', google: 'Mit Google fortfahren',
    have_account: 'Haben Sie bereits ein Konto?', signin: 'Anmelden',
    terms_pre: 'Mit der Kontoerstellung stimmen Sie unseren', terms: 'Nutzungsbedingungen', and: 'und', privacy: 'Datenschutzrichtlinie',
    pw_title: 'Sicherheitsanforderungen', pw_length: 'Mindestens 12 Zeichen', pw_upper: 'Mindestens ein Grossbuchstabe (A-Z)',
    pw_lower: 'Mindestens ein Kleinbuchstabe (a-z)', pw_number: 'Mindestens eine Zahl (0-9)',
    pw_special: 'Mindestens ein Sonderzeichen (!@#$...)', pw_no_common: 'Kein gangiges Passwort',
    pw_no_spaces: 'Keine Leerzeichen am Anfang oder Ende', pw_match: 'Passworter stimmen uberein',
    pw_strength: 'Starke', weak: 'Schwach', fair: 'Mittel', good: 'Gut', strong: 'Stark',
    err_match: 'Passworter stimmen nicht uberein', err_weak: 'Passwort erfullt nicht die Anforderungen',
    err_email: 'Bitte geben Sie eine gultige E-Mail-Adresse ein', err_generic: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    err_exists: 'Ein Konto mit dieser E-Mail existiert bereits. Bitte melden Sie sich an.',
    nist_note: 'Ihr Konto ist durch professionelle Sicherheitsstandards geschutzt.',
    loading_countries: 'Lander werden geladen...',
  },
  it: {
    step_lang: 'Scegli la tua lingua', step_lang_sub: 'Puoi cambiarlo in qualsiasi momento nelle impostazioni.',
    title: 'Crea il tuo account', sub: 'Unisciti a GigWrench - gratis per iniziare',
    role_q: 'Mi unisco come...', role_pro: 'Pro - offro servizi', role_cust: 'Cliente - ho bisogno di servizi',
    country_label: 'Paese', currency_label: 'Valuta',
    first: 'Nome', last: 'Cognome', email: 'Indirizzo email', password: 'Password', confirm: 'Conferma password',
    show: 'Mostra', hide: 'Nascondi', creating: 'Creazione account...', create: 'Crea account',
    or: 'o continua con', google: 'Continua con Google',
    have_account: 'Hai gia un account?', signin: 'Accedi',
    terms_pre: 'Creando un account accetti i nostri', terms: 'Termini di servizio', and: 'e', privacy: 'Informativa sulla privacy',
    pw_title: 'Requisiti di sicurezza', pw_length: 'Minimo 12 caratteri', pw_upper: 'Almeno una lettera maiuscola (A-Z)',
    pw_lower: 'Almeno una lettera minuscola (a-z)', pw_number: 'Almeno un numero (0-9)',
    pw_special: 'Almeno un carattere speciale (!@#$...)', pw_no_common: 'Non e una password comune',
    pw_no_spaces: "Nessuno spazio all'inizio o alla fine", pw_match: 'Le password corrispondono',
    pw_strength: 'Forza', weak: 'Debole', fair: 'Discreta', good: 'Buona', strong: 'Forte',
    err_match: 'Le password non corrispondono', err_weak: 'La password non soddisfa i requisiti',
    err_email: 'Inserisci un indirizzo email valido', err_generic: 'Qualcosa e andato storto. Riprova.',
    err_exists: 'Esiste gia un account con questa email. Accedi.',
    nist_note: 'Il tuo account e protetto da standard di sicurezza professionali.',
    loading_countries: 'Caricamento paesi...',
  },
  nl: {
    step_lang: 'Kies uw taal', step_lang_sub: 'U kunt dit op elk moment wijzigen in de instellingen.',
    title: 'Maak uw account aan', sub: 'Doe mee met GigWrench - gratis beginnen',
    role_q: 'Ik doe mee als...', role_pro: 'Pro - ik bied diensten aan', role_cust: 'Klant - ik heb diensten nodig',
    country_label: 'Land', currency_label: 'Valuta',
    first: 'Voornaam', last: 'Achternaam', email: 'E-mailadres', password: 'Wachtwoord', confirm: 'Wachtwoord bevestigen',
    show: 'Tonen', hide: 'Verbergen', creating: 'Account aanmaken...', create: 'Account aanmaken',
    or: 'of doorgaan met', google: 'Doorgaan met Google',
    have_account: 'Heeft u al een account?', signin: 'Aanmelden',
    terms_pre: 'Door een account aan te maken gaat u akkoord met onze', terms: 'Servicevoorwaarden', and: 'en', privacy: 'Privacybeleid',
    pw_title: 'Beveiligingsvereisten', pw_length: 'Minimaal 12 tekens', pw_upper: 'Minimaal een hoofdletter (A-Z)',
    pw_lower: 'Minimaal een kleine letter (a-z)', pw_number: 'Minimaal een cijfer (0-9)',
    pw_special: 'Minimaal een speciaal teken (!@#$...)', pw_no_common: 'Geen veelgebruikt wachtwoord',
    pw_no_spaces: 'Geen spaties aan het begin of einde', pw_match: 'Wachtwoorden komen overeen',
    pw_strength: 'Sterkte', weak: 'Zwak', fair: 'Matig', good: 'Goed', strong: 'Sterk',
    err_match: 'Wachtwoorden komen niet overeen', err_weak: 'Wachtwoord voldoet niet aan de vereisten',
    err_email: 'Voer een geldig e-mailadres in', err_generic: 'Er is iets misgegaan. Probeer het opnieuw.',
    err_exists: 'Er bestaat al een account met dit e-mailadres. Meld u aan.',
    nist_note: 'Uw account is beschermd door professionele beveiligingsnormen.',
    loading_countries: 'Landen laden...',
  },
  ro: {
    step_lang: 'Alege-ti limba', step_lang_sub: 'Poti schimba asta oricand din setari.',
    title: 'Creeaza-ti contul', sub: 'Alatura-te GigWrench - gratis pentru inceput',
    role_q: 'Ma alatur ca...', role_pro: 'Pro - ofer servicii', role_cust: 'Client - am nevoie de servicii',
    country_label: 'Tara', currency_label: 'Moneda',
    first: 'Prenume', last: 'Nume', email: 'Adresa de email', password: 'Parola', confirm: 'Confirma parola',
    show: 'Arata', hide: 'Ascunde', creating: 'Se creeaza contul...', create: 'Creeaza cont',
    or: 'sau continua cu', google: 'Continua cu Google',
    have_account: 'Ai deja un cont?', signin: 'Conecteaza-te',
    terms_pre: 'Prin crearea unui cont esti de acord cu', terms: 'Termenii de serviciu', and: 'si', privacy: 'Politica de confidentialitate',
    pw_title: 'Cerinte de securitate', pw_length: 'Minimum 12 caractere', pw_upper: 'Cel putin o litera mare (A-Z)',
    pw_lower: 'Cel putin o litera mica (a-z)', pw_number: 'Cel putin o cifra (0-9)',
    pw_special: 'Cel putin un caracter special (!@#$...)', pw_no_common: 'Nu e o parola comuna',
    pw_no_spaces: 'Fara spatii la inceput sau la sfarsit', pw_match: 'Parolele se potrivesc',
    pw_strength: 'Putere', weak: 'Slab', fair: 'Mediu', good: 'Bun', strong: 'Puternic',
    err_match: 'Parolele nu se potrivesc', err_weak: 'Parola nu indeplineste cerintele',
    err_email: 'Introduceti o adresa de email valida', err_generic: 'Ceva a mers prost. Incercati din nou.',
    err_exists: 'Exista deja un cont cu acest email. Conectati-va.',
    nist_note: 'Contul tau este protejat de standarde de securitate la nivel enterprise.',
    loading_countries: 'Se incarca tarile...',
  },
  sv: {
    step_lang: 'Valj ditt sprak', step_lang_sub: 'Du kan andra detta nar som helst i installningarna.',
    title: 'Skapa ditt konto', sub: 'Gå med i GigWrench - gratis att borja',
    role_q: 'Jag ansluter som...', role_pro: 'Pro - jag erbjuder tjanster', role_cust: 'Kund - jag behover tjanster',
    country_label: 'Land', currency_label: 'Valuta',
    first: 'Fornamn', last: 'Efternamn', email: 'E-postadress', password: 'Losenord', confirm: 'Bekrafta losenord',
    show: 'Visa', hide: 'Dold', creating: 'Skapar konto...', create: 'Skapa konto',
    or: 'eller fortsatt med', google: 'Fortsatt med Google',
    have_account: 'Har du redan ett konto?', signin: 'Logga in',
    terms_pre: 'Genom att skapa ett konto godkanner du vara', terms: 'Anvandningsvillkor', and: 'och', privacy: 'Integritetspolicy',
    pw_title: 'Sakerhetsrav', pw_length: 'Minst 12 tecken', pw_upper: 'Minst en stor bokstav (A-Z)',
    pw_lower: 'Minst en liten bokstav (a-z)', pw_number: 'Minst en siffra (0-9)',
    pw_special: 'Minst ett specialtecken (!@#$...)', pw_no_common: 'Inte ett vanligt losenord',
    pw_no_spaces: 'Inga mellanslag i borjan eller slutet', pw_match: 'Losenorden stammer overens',
    pw_strength: 'Styrka', weak: 'Svagt', fair: 'Okej', good: 'Bra', strong: 'Starkt',
    err_match: 'Losenorden stammer inte overens', err_weak: 'Losenordet uppfyller inte kraven',
    err_email: 'Ange en giltig e-postadress', err_generic: 'Nagot gick fel. Forsok igen.',
    err_exists: 'Det finns redan ett konto med denna e-post. Logga in.',
    nist_note: 'Ditt konto skyddas av sakerhetsstandarder pa foretagsniva.',
    loading_countries: 'Laddar lander...',
  },
}

const COMMON_PASSWORDS = new Set([
  'password','password1','password123','123456789','12345678','qwerty123',
  'iloveyou','admin123','letmein1','welcome1','monkey123','dragon123',
  'master123','hello123','shadow123','sunshine','princess','football',
  'baseball','superman','batman123','trustno1','passw0rd','gigwrench',
])

const PW_CHECKS = [
  { key: 'length',   labelKey: 'pw_length',   test: (pw: string) => pw.length >= 12 },
  { key: 'upper',    labelKey: 'pw_upper',    test: (pw: string) => /[A-Z]/.test(pw) },
  { key: 'lower',    labelKey: 'pw_lower',    test: (pw: string) => /[a-z]/.test(pw) },
  { key: 'number',   labelKey: 'pw_number',   test: (pw: string) => /[0-9]/.test(pw) },
  { key: 'special',  labelKey: 'pw_special',  test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pw) },
  { key: 'common',   labelKey: 'pw_no_common', test: (pw: string) => !COMMON_PASSWORDS.has(pw.toLowerCase()) },
  { key: 'spaces',   labelKey: 'pw_no_spaces', test: (pw: string) => pw === pw.trim() },
]

function getStrength(pw: string) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pw)) score++
  if (!COMMON_PASSWORDS.has(pw.toLowerCase())) score++
  return Math.min(4, Math.floor(score / 1.75))
}

const STRENGTH_CONFIG = [
  { color: 'bg-red-500',    textKey: 'weak' },
  { color: 'bg-orange-400', textKey: 'fair' },
  { color: 'bg-yellow-400', textKey: 'good' },
  { color: 'bg-green-400',  textKey: 'strong' },
]

type CountryRow = { country_code: string; country_name: string; currency_code: string; currency_symbol: string }

export default function SignupPage() {
  const [langChosen, setLangChosen] = useState(false)
  const [lang, setLang] = useState<Language>('en')
  const [role, setRole] = useState('pro')
  const [country, setCountry] = useState('US')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [currencySymbol, setCurrencySymbol] = useState('$')
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const router = useRouter()
  const ui = UI[lang] || UI.en

  // On mount: read lang from URL param first (set by landing page), then localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlLang = params.get('lang') as Language | null
    if (urlLang && UI[urlLang]) {
      setLang(urlLang)
      setLangChosen(true)
      localStorage.setItem('gw_lang', urlLang)
      return
    }
    const saved = localStorage.getItem('gw_lang') as Language | null
    if (saved && UI[saved]) {
      setLang(saved)
      setLangChosen(true)
    }
  }, [])

  // Load countries from Supabase country_currencies table
  useEffect(() => {
    async function loadCountries() {
      const supabase = createClient()
      const { data } = await supabase
        .from('country_currencies')
        .select('country_code, country_name, currency_code, currency_symbol')
        .order('country_name', { ascending: true })
      if (data && data.length > 0) {
        setCountries(data as CountryRow[])
        // Set default currency from US row
        const us = (data as CountryRow[]).find(c => c.country_code === 'US')
        if (us) { setCurrencyCode(us.currency_code); setCurrencySymbol(us.currency_symbol) }
      }
      setCountriesLoading(false)
    }
    loadCountries()
  }, [])

  // When country changes, auto-populate currency
  function handleCountryChange(code: string) {
    setCountry(code)
    const row = countries.find(c => c.country_code === code)
    if (row) { setCurrencyCode(row.currency_code); setCurrencySymbol(row.currency_symbol) }
  }

  function chooseLang(code: Language) {
    setLang(code)
    localStorage.setItem('gw_lang', code)
    setLangChosen(true)
  }

  const pwResults = PW_CHECKS.map(c => ({ ...c, passed: c.test(password) }))
  const confirmPassed = confirm.length > 0 && password === confirm
  const allPwPassed = pwResults.every(r => r.passed)
  const strength = getStrength(password)
  const strengthConfig = STRENGTH_CONFIG[strength - 1]
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { prompt: 'select_account', access_type: 'offline' },
      },
    })
    if (err) { setError(ui.err_generic); setGoogleLoading(false) }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!emailValid) { setError(ui.err_email); return }
    if (!allPwPassed) { setError(ui.err_weak); return }
    if (!confirmPassed) { setError(ui.err_match); return }
    if (!agreedTerms) { setError('Please agree to the Terms of Service and Privacy Policy.'); return }
    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          language: lang,
          country,
          currency_code: currencyCode,
          currency_symbol: currencySymbol,
          signup_method: 'email',
          signup_at: new Date().toISOString(),
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    })
    if (signUpError) {
      setLoading(false)
      if (signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already exists')) {
        setError(ui.err_exists)
      } else {
        setError(ui.err_generic)
      }
      return
    }
    if (data.user?.confirmed_at) { router.push('/dashboard'); return }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  // LANGUAGE SELECTION SCREEN
  if (!langChosen) {
    return (
      <div className="min-h-screen bg-[#07090D] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center mb-10">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mr-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
              </svg>
            </div>
            <span className="font-display text-2xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
          </div>
          <h2 className="text-center text-white text-2xl font-bold mb-2">Choose your language</h2>
          <p className="text-center text-white/40 text-sm font-mono mb-8">You can change this any time in settings.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {LANG_ORDER.map(code => {
              const meta = LANGUAGES[code]
              return (
                <button
                  key={code}
                  onClick={() => chooseLang(code)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-[#131C28] hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all text-left"
                >
                  <span className="text-xl">{meta.flag}</span>
                  <span className="text-white/70 text-sm font-medium">{meta.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // MAIN SIGNUP FORM
  return (
    <div className="relative min-h-screen bg-[#07090D]">
    <AuthArtPanel />
    <div className="relative z-10 min-h-screen flex flex-col">
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
        <div className="flex gap-0.5 flex-wrap justify-end p-1.5 rounded-xl bg-[#07090D]/60 backdrop-blur-md border border-white/12 shadow-lg">
          {LANG_ORDER.map(code => {
            const meta = LANGUAGES[code]
            return (
              <button key={code} onClick={() => chooseLang(code)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${lang === code ? 'bg-yellow-400 text-black font-bold' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                title={meta.label}>{meta.flag}</button>
            )
          })}
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center lg:justify-start px-4 lg:px-16 py-12">
        <div className="w-full max-w-lg bg-[#07090D]/72 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="font-display text-5xl tracking-wider text-white mb-2">{ui.title}</h1>
            <p className="text-white/50 font-mono text-sm">{ui.sub}</p>
          </div>
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">{ui.role_q}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['pro', 'customer']).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${role === r ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#131C28] border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${role === r ? 'border-yellow-400 bg-yellow-400' : 'border-white/25'}`}>
                    {role === r && <div className="w-1.5 h-1.5 rounded-full bg-black"/>}
                  </div>
                  <div>
                    <div className="text-xs font-medium flex items-center justify-center">{r === 'pro' ? <Wrench size={14}/> : <Home size={14}/>}</div>
                    <div className="text-xs font-mono mt-0.5">{r === 'pro' ? ui.role_pro : ui.role_cust}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-60 mb-4">
            {googleLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"/> : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
              </svg>
            )}
            {googleLoading ? '...' : ui.google}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8"/>
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">{ui.or}</span>
            <div className="flex-1 h-px bg-white/8"/>
          </div>
          <form onSubmit={handleSignup} className="flex flex-col gap-4" autoComplete="on">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.first} <span className="text-yellow-400">*</span></label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name"
                  className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20" placeholder="John"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.last} <span className="text-yellow-400">*</span></label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required autoComplete="family-name"
                  className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20" placeholder="Smith"/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.email} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                  className={`w-full bg-[#131C28] border rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-white/20 ${email.length > 0 ? emailValid ? 'border-green-500/40 focus:border-green-500/60' : 'border-red-500/40 focus:border-red-500/60' : 'border-white/8 focus:border-yellow-400/40'}`}
                  placeholder="you@email.com"/>
                {email.length > 0 && <div className="absolute right-3 top-1/2 -translate-y-1/2">{emailValid ? <Check size={14} className="text-green-400"/> : <X size={14} className="text-red-400"/>}</div>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.password} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setPwFocused(true)} required autoComplete="new-password"
                  className="w-full bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 pr-20 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors" placeholder="Min. 12 characters"/>
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 font-mono text-[9px]">
                  {showPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= i && strengthConfig ? strengthConfig.color : 'bg-white/10'}`}/>)}
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${strengthConfig?.color.replace('bg-', 'text-') || 'text-white/30'}`}>{(ui as Record<string,string>)[strengthConfig?.textKey ?? ''] || ''}</span>
                </div>
              )}
            </div>
            {(pwFocused || password.length > 0) && (
              <div className="bg-[#0C1520] border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={13} className="text-yellow-400"/>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-yellow-400/80">{ui.pw_title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {pwResults.map(({ key, labelKey, passed }) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${passed ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5 border border-white/15'}`}>
                        {passed ? <Check size={9} className="text-green-400"/> : <div className="w-1 h-1 rounded-full bg-white/20"/>}
                      </div>
                      <span className={`font-mono text-[11px] transition-colors duration-200 ${passed ? 'text-green-400' : 'text-white/40'}`}>{(ui as Record<string,string>)[labelKey]}</span>
                    </div>
                  ))}
                  {confirm.length > 0 && (
                    <div className="flex items-center gap-2.5 mt-1 pt-1 border-t border-white/6">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${confirmPassed ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/10 border border-red-500/20'}`}>
                        {confirmPassed ? <Check size={9} className="text-green-400"/> : <X size={9} className="text-red-400"/>}
                      </div>
                      <span className={`font-mono text-[11px] ${confirmPassed ? 'text-green-400' : 'text-red-400'}`}>{ui.pw_match}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/6">
                  <AlertCircle size={10} className="text-white/20 flex-shrink-0"/>
                  <span className="font-mono text-[9px] text-white/20">{ui.nist_note}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.confirm} <span className="text-yellow-400">*</span></label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password"
                  className={`w-full bg-[#131C28] border rounded-lg px-4 py-3 pr-12 text-white text-sm outline-none transition-colors ${confirm.length > 0 ? confirmPassed ? 'border-green-500/40' : 'border-red-500/40' : 'border-white/8 focus:border-yellow-400/40'}`}
                  placeholder="************"/>
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showConfirm ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.country_label} <span className="text-yellow-400">*</span></label>
                {countriesLoading ? (
                  <div className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white/30 text-sm font-mono">{ui.loading_countries}</div>
                ) : (
                  <select value={country} onChange={e => handleCountryChange(e.target.value)} required
                    className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors appearance-none">
                    {countries.map(c => (
                      <option key={c.country_code} value={c.country_code}>{c.country_name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">{ui.currency_label}</label>
                <div className="bg-[#0C1520] border border-white/6 rounded-lg px-4 py-3 text-white/50 text-sm font-mono flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">{currencySymbol}</span>
                  <span>{currencyCode}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-1">
              <button type="button" onClick={() => setAgreedTerms(!agreedTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreedTerms ? 'bg-yellow-400 border-yellow-400' : 'border-white/25 bg-transparent hover:border-white/50'}`}>
                {agreedTerms && <Check size={11} className="text-black"/>}
              </button>
              <p className="text-white/35 text-xs font-mono leading-relaxed">
                {ui.terms_pre}{' '}
                <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.terms}</Link>
                {' '}{ui.and}{' '}
                <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.privacy}</Link>
              </p>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0"/>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !allPwPassed || !confirmPassed || !emailValid || !agreedTerms}
              className="bg-yellow-400 text-black font-display text-xl tracking-widest py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1">
              {loading ? ui.creating : ui.create}
            </button>
          </form>
          <p className="text-center text-white/30 text-sm mt-6 font-mono">
            {ui.have_account}{' '}
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">{ui.signin}</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

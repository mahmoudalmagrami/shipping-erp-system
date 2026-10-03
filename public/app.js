// ============================================================================
// i18n Dictionary (العربية & English)
// ============================================================================
const translations = {
  ar: {
    pageTitle: "نظام إدارة الشحن والترحيل المالي",
    appTitle: "نظام الشحن والترحيل المالي",
    versionBadge: "نسخة الإنتاج v1.0",
    appSubtitle: "إدارة متكاملة للطلبات الأولية، الترحيل لبوالص الموردين، والقيود المحاسبية التلقائية",
    refreshBtn: "تحديث الأرصدة",
    serverOnline: "الخادم متصل",
    liveSyncActive: "مزامنة لحظية",
    liveSyncUpdated: "تم التحديث لحظياً",

    // KPIs
    kpiCashBox: "الصندوق الرئيسي",
    kpiCashBoxDesc: "جاهز للقبض النقدي",
    kpiBank: "حساب الصراف / البنك",
    kpiBankDesc: "الحوالات والإيداعات",
    kpiSales: "إجمالي المبيعات",
    kpiSalesDesc: "عن الطلبات الأولية",
    kpiPayables: "مستحقات الموردين",
    kpiPayablesDesc: "للشحنات المرحّلة",
    kpiProfit: "صافي الربح المحقق",
    marginLabel: "هامش الربح المحقق:",

    // Tabs
    tabBooking: "1. حجز طلب أولي جديد",
    tabDispatch: "2. محطة الترحيل للنهائي (بوالص الموردين)",
    tabOrders: "3. سجل كافة الشحنات",
    tabPricing: "4. مصفوفة الشرائح والوجهات",
    tabLedger: "5. القيود المحاسبية واليومية",

    // Booking Tab
    bookingHeading: "حجز طلب أولي من العميل (Initial Booking)",
    bookingSubheading: "تسجيل بيانات المرسل، المستلم، الوزن، والوجهة. يؤثر مباشرة على الصندوق أو الصراف وحساب العميل والمبيعات.",
    bookingSerialBadge: "📌 رقم تسلسلي مستقل يتولد تلقائياً لكل طلب",
    senderSectionTitle: "بيانات المرسل (العميل)",
    customerSelectLabel: "اسم العميل المسجل (اختياري)",
    newCustomerOption: "-- عميل نقدي جديد / إدخال يدوي --",
    senderNameLabel: "اسم المرسل الكامل *",
    senderNamePlaceholder: "مثال: مؤسسة النور التجارية",
    senderPhoneLabel: "رقم هاتف المرسل *",
    paymentTypeLabel: "طريقة السداد والتأثير المالي الفوري *",
    payCash: "💵 نقداً بالصندوق (يزيد الصندوق فوراً)",
    payBank: "🏦 تحويل عبر الصراف / البنك (يزيد حساب الصراف فوراً)",
    payCredit: "📝 آجل على الحساب (يثبت مديونية على العميل)",

    receiverSectionTitle: "بيانات المستلم والوجهة الجغرافية",
    receiverNameLabel: "اسم المستلم الكامل *",
    receiverNamePlaceholder: "مثال: John Miller أو عمر فاروق",
    receiverPhoneLabel: "رقم هاتف المستلم *",
    zoneSelectLabel: "منطقة وجهة خدمة الشحن *",
    receiverAddressLabel: "العنوان التفصيلي والرمز البريدي *",
    receiverAddressPlaceholder: "المدينة، الشارع، المبنى، الرمز البريدي",

    pricingSectionTitle: "محرك الأوزان والشرائح اللحظي",
    actualWeightLabel: "الوزن الفعلي (كجم) *",
    dimensionsLabel: "الأبعاد (اختياري لحساب الوزن الحجمي سم)",
    dimLength: "طول",
    dimWidth: "عرض",
    dimHeight: "ارتفاع",
    rateVolWeightLabel: "الوزن الحجمي التقديري:",
    rateChargeableWeightLabel: "الوزن القابل للفوترة (المعتمد):",
    rateTierNameLabel: "الشريحة المطبقة:",
    rateTotalSalesLabel: "إجمالي قيمة المبيعات:",
    saveOrderBtn: "حفظ الطلب الأولي وتوليد القيد المالي",
    savingOrderBtn: "جاري الحفظ وتوليد القيد المالي...",

    // Dispatch Tab
    dispatchHeading: "محطة الترحيل للنهائي (Carrier Dispatch)",
    dispatchSubheading: "يتم استيراد الطلب الأولي مباشرة هنا، وإدخال رقم بوليصة المورد المسلمة منه، ليولد النظام فوراً قيد استحقاق للمورد ويحسب صافي ربح الشحنة.",
    colOrderNumber: "رقم الطلب الأولي",
    colSender: "المرسل",
    colReceiverZone: "المستلم والوجهة",
    colWeight: "الوزن المفوتر",
    colSalesAmount: "مبلغ البيع المحصل",
    colPaymentMethod: "طريقة السداد",
    colAction: "إجراء الترحيل للنهائي",
    dispatchBtnText: "إدخال بوليصة المورد والترحيل",
    noPendingOrders: "لا توجد طلبات أولية معلقة بالمستودع حالياً. كافة الطلبات تم ترحيلها!",

    // Dispatch Modal
    dispatchModalTitle: "تسليم الشحنة للناقل وإدخال بوليصة المورد",
    dispatchOrderLabel: "الطلب الأولي المختار",
    dispatchCarrierLabel: "الناقل / المورد الخارجي *",
    selectCarrierOption: "-- اختر شركة الشحن / المورد --",
    dispatchWaybillLabel: "رقم البوليصة الواردة من المورد (AWB) *",
    dispatchCostLabel: "تكلفة الشحن المستحقة للمورد ($) *",
    dispatchNote: "⚠️ بمجرد التأكيد، سيتم قيد استحقاق مالي مباشر في حساب المورد وإقفال الطلب كشحنة نهائية.",
    cancelBtn: "إلغاء",
    confirmDispatchBtn: "✓ تأكيد الترحيل النهائي وتوليد القيد",

    // All Orders Tab
    allOrdersHeading: "سجل الشحنات والبحث الشامل",
    allOrdersSubheading: "استعراض كافة الشحنات الأولية والمرحلة نهائياً مع بوالص الموردين وهوامش الأرباح.",
    searchPlaceholder: "بحث برقم الطلب، البوليصة، العميل...",
    filterAll: "كافة الحالات",
    filterPending: "طلبات أولية معلقة",
    filterDispatched: "مرحلة نهائياً",
    colSales: "المبيعات",
    colCarrier: "الناقل / المورد",
    colWaybill: "بوليصة المورد",
    colCost: "تكلفة المورد",
    colProfit: "صافي الربح",
    colStatus: "الحالة",
    statusInitial: "طلب أولي معلق",
    statusFinal: "مرحل نهائي",
    notAssigned: "لم يسند بعد",
    noResults: "لا توجد نتائج مطابقة",

    // Pricing Tab
    pricingHeading: "مصفوفة تسعير الخدمات وشرائح الأوزان حسب الوجهات",
    pricingSubheading: "الشرائح المعتمدة برمجياً لحساب تكاليف وأسعار الشحن للعملاء والموردين.",

    // Ledger Tab
    ledgerHeading: "سجل القيود المحاسبية الآلية المزدوجة (General Ledger)",
    ledgerSubheading: "القيود المالية التي تولدت آلياً لحظة حفظ الطلب الأولي ولحظة ترحيل بوليصة المورد.",
    debitLabel: "مدين:",
    creditLabel: "دائن:",
    noJournals: "لا توجد قيود مسجلة بعد.",

    // Badges & Pay types
    cashBadge: "نقداً (الصندوق)",
    bankBadge: "صراف / بنك",
    creditBadge: "آجل على العميل",
    pendingSuffix: "معلق",

    // Alerts
    orderSuccessTitle: "✅ نجاح العملية!",
    orderSuccessDesc: "تم إنشاء الطلب الأولي بنجاح وتوليد القيد المالي.",
    dispatchSuccessTitle: "✅ تم الترحيل بنجاح!",
    dispatchSuccessDesc: "تم قيد استحقاق المورد وحساب صافي الربح للشحنة.",
    validationError: "⚠️ يرجى التأكد من ملء الحقول الإلزامية بدقة.",

    // Auth & RBAC
    loginModalTitle: "تسجيل الدخول وإدارة الصلاحيات (RBAC)",
    loginModalSubtitle: "اختر أحد الأدوار الوظيفية للتجربة أو أدخل بيانات الدخول",
    quickLoginTitle: "⚡ تسجيل دخول سريع لتجربة الصلاحيات:",
    orManualLogin: "أو الدخول اليدوي",
    usernameLabel: "اسم المستخدم",
    passwordLabel: "كلمة المرور",
    loginBtnText: "تسجيل الدخول للنظام",
    switchUserBtn: "تبديل المستخدم",
    logoutBtn: "تسجيل خروج",
    guestUser: "زائر (غير مسجل)",
    pleaseLogin: "يرجى تسجيل الدخول",
    loginSuccessMsg: "تم تسجيل الدخول بنجاح",
    roleAdmin: "المدير العام",
    roleCashier: "كاشير الاستقبال",
    roleWarehouse: "مسؤول المستودع",
    roleAccountant: "المحاسب المالي",
    networkError: "خطأ في الشبكة أو الخادم:"
  },

  en: {
    pageTitle: "Shipping & Financial Posting ERP",
    appTitle: "Shipping & Financial Posting ERP",
    versionBadge: "Production v1.0",
    appSubtitle: "End-to-end Initial Booking, Carrier Waybill Dispatch & Real-Time Double-Entry Accounting",
    refreshBtn: "Refresh Balances",
    serverOnline: "Server Online",
    liveSyncActive: "Live Sync",
    liveSyncUpdated: "Live Updated",

    // KPIs
    kpiCashBox: "Main Cash Drawer",
    kpiCashBoxDesc: "Available Cash on Hand",
    kpiBank: "Bank & Exchange Vault",
    kpiBankDesc: "Transfers & Bank Deposits",
    kpiSales: "Total Sales Revenue",
    kpiSalesDesc: "From Initial Bookings",
    kpiPayables: "Carrier Payables",
    kpiPayablesDesc: "For Dispatched Shipments",
    kpiProfit: "Realized Gross Profit",
    marginLabel: "Realized Profit Margin:",

    // Tabs
    tabBooking: "1. Initial Booking",
    tabDispatch: "2. Carrier Dispatch & Waybill",
    tabOrders: "3. All Shipments Log",
    tabPricing: "4. Pricing Matrix & Zones",
    tabLedger: "5. General Ledger & Journals",

    // Booking Tab
    bookingHeading: "Client Initial Booking",
    bookingSubheading: "Enter sender, receiver, weight, and destination. Instantly impacts Cash Drawer / Bank, Client account, and Sales.",
    bookingSerialBadge: "📌 Independent unique serial generated automatically",
    senderSectionTitle: "Sender (Client) Information",
    customerSelectLabel: "Registered Client (Optional)",
    newCustomerOption: "-- New Walk-in Client / Manual Entry --",
    senderNameLabel: "Sender Full Name *",
    senderNamePlaceholder: "e.g. Al-Noor Trading Co.",
    senderPhoneLabel: "Sender Phone Number *",
    paymentTypeLabel: "Payment Method & Instant Financial Impact *",
    payCash: "💵 Cash in Drawer (Increases Cash immediately)",
    payBank: "🏦 Bank / Exchange Transfer (Increases Bank immediately)",
    payCredit: "📝 On Account / Credit (Posts AR to Client)",

    receiverSectionTitle: "Receiver & Destination Information",
    receiverNameLabel: "Receiver Full Name *",
    receiverNamePlaceholder: "e.g. John Miller or Omar Farooq",
    receiverPhoneLabel: "Receiver Phone Number *",
    zoneSelectLabel: "Destination Shipping Zone *",
    receiverAddressLabel: "Detailed Address & Postal Code *",
    receiverAddressPlaceholder: "City, Street, Building, Postal Code",

    pricingSectionTitle: "Live Weight & Tier Rating Engine",
    actualWeightLabel: "Actual Weight (kg) *",
    dimensionsLabel: "Dimensions (Optional for Volumetric kg)",
    dimLength: "L",
    dimWidth: "W",
    dimHeight: "H",
    rateVolWeightLabel: "Est. Volumetric Weight:",
    rateChargeableWeightLabel: "Chargeable (Billable) Weight:",
    rateTierNameLabel: "Applied Tier:",
    rateTotalSalesLabel: "Total Sales Price:",
    saveOrderBtn: "Save Initial Booking & Post Journal Entry",
    savingOrderBtn: "Saving & Posting Journal...",

    // Dispatch Tab
    dispatchHeading: "Final Carrier Dispatch Station",
    dispatchSubheading: "Initial orders are imported here automatically. Enter the Carrier's Waybill (AWB) to record carrier payable liability and compute net profit.",
    colOrderNumber: "Initial Order #",
    colSender: "Sender",
    colReceiverZone: "Receiver & Zone",
    colWeight: "Billable Wt",
    colSalesAmount: "Sales Collected",
    colPaymentMethod: "Payment Method",
    colAction: "Final Dispatch Action",
    dispatchBtnText: "Assign Carrier Waybill & Dispatch",
    noPendingOrders: "No pending initial orders in warehouse. All shipments dispatched!",

    // Dispatch Modal
    dispatchModalTitle: "Carrier Handover & Supplier Waybill Entry",
    dispatchOrderLabel: "Selected Order",
    dispatchCarrierLabel: "Carrier / Supplier *",
    selectCarrierOption: "-- Select Carrier / Supplier --",
    dispatchWaybillLabel: "Supplier Air Waybill Number (AWB) *",
    dispatchCostLabel: "Carrier Agreed Cost ($) *",
    dispatchNote: "⚠️ Once confirmed, a direct credit payable is posted to the carrier's account and the order is marked final.",
    cancelBtn: "Cancel",
    confirmDispatchBtn: "✓ Confirm Final Dispatch & Post Journal",

    // All Orders Tab
    allOrdersHeading: "Comprehensive Shipments Log & Search",
    allOrdersSubheading: "View all initial and dispatched shipments with supplier waybills, costs, and profit margins.",
    searchPlaceholder: "Search by Order #, Waybill, Client...",
    filterAll: "All Statuses",
    filterPending: "Pending Initial Orders",
    filterDispatched: "Dispatched to Final",
    colSales: "Sales",
    colCarrier: "Carrier / Supplier",
    colWaybill: "Supplier AWB",
    colCost: "Carrier Cost",
    colProfit: "Net Profit",
    colStatus: "Status",
    statusInitial: "Pending Initial",
    statusFinal: "Dispatched Final",
    notAssigned: "Unassigned",
    noResults: "No matching records found",

    // Pricing Tab
    pricingHeading: "Service Rates Matrix & Weight Tiers by Zone",
    pricingSubheading: "Official weight tiers and rates configured for customer pricing and cost evaluation.",

    // Ledger Tab
    ledgerHeading: "Automated Double-Entry General Ledger",
    ledgerSubheading: "Financial journal entries generated in real time upon booking and carrier dispatch.",
    debitLabel: "Debit:",
    creditLabel: "Credit:",
    noJournals: "No journal entries recorded yet.",

    // Badges & Pay types
    cashBadge: "Cash (Drawer)",
    bankBadge: "Bank / Transfer",
    creditBadge: "On Credit (AR)",
    pendingSuffix: "Pending",

    // Alerts
    orderSuccessTitle: "✅ Booking Created Successfully!",
    orderSuccessDesc: "Initial order recorded and financial journal entry posted.",
    dispatchSuccessTitle: "✅ Dispatched Successfully!",
    dispatchSuccessDesc: "Carrier liability posted and net profit realized.",
    validationError: "⚠️ Please check all required fields.",

    // Auth & RBAC
    loginModalTitle: "User Login & Role-Based Access Control (RBAC)",
    loginModalSubtitle: "Select a job role for quick testing or enter credentials",
    quickLoginTitle: "⚡ Quick Demo Login by Role:",
    orManualLogin: "Or Manual Login",
    usernameLabel: "Username",
    passwordLabel: "Password",
    loginBtnText: "Sign In to ERP",
    switchUserBtn: "Switch Role / User",
    logoutBtn: "Sign Out",
    guestUser: "Guest (Not logged in)",
    pleaseLogin: "Please Sign In",
    loginSuccessMsg: "Logged in successfully",
    roleAdmin: "General Admin",
    roleCashier: "Cashier Clerk",
    roleWarehouse: "Warehouse Dispatcher",
    roleAccountant: "Chief Accountant",
    networkError: "Network or Server Error:"
  }
};

// ============================================================================
// State Management
// ============================================================================
let currentLang = localStorage.getItem('shipping_app_lang') || 'ar';
let cachedZones = [];
let cachedCarriers = [];
let cachedCustomers = [];
let currentTab = 'booking';

// Helper: Translation lookup
function t(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  return translations['ar'][key] || key;
}

// Helper: HTML entity escaping to prevent XSS
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Currency formatting
function formatMoney(amount) {
  const num = Number(amount || 0);
  return num.toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' $';
}

// ============================================================================
// Language Switcher Engine
// ============================================================================
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('shipping_app_lang', lang);

  const html = document.documentElement;
  const isArabic = lang === 'ar';

  html.setAttribute('lang', lang);
  html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

  // Update switcher button
  const flagSpan = document.getElementById('langFlag');
  const textSpan = document.getElementById('langText');
  if (flagSpan && textSpan) {
    flagSpan.innerText = isArabic ? '🇬🇧' : '🇸🇦';
    textSpan.innerText = isArabic ? 'English' : 'العربية';
  }

  document.querySelectorAll('.loginLangText').forEach(el => {
    el.innerText = isArabic ? 'English' : 'العربية';
  });

  // Update all static i18n text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerText = t(key);
  });

  // Update all placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // Re-render dynamic elements
  if (cachedZones.length > 0) {
    renderZonesDropdown(cachedZones);
    renderZonesMatrix(cachedZones);
  }
  if (cachedCarriers.length > 0) {
    renderCarriersDropdown(cachedCarriers);
  }
  if (cachedCustomers.length > 0) {
    renderCustomersDropdown(cachedCustomers);
  }

  // Refresh data with current language formatting
  refreshAllData();
  triggerRateCalculation();
}

function toggleLanguage() {
  const target = currentLang === 'ar' ? 'en' : 'ar';
  setLanguage(target);
}

// ============================================================================
// Authentication & RBAC Engine
// ============================================================================
let authToken = sessionStorage.getItem('shipping_auth_token') || null;
let currentUser = null;
try {
  currentUser = JSON.parse(sessionStorage.getItem('shipping_auth_user') || 'null');
} catch (e) {
  currentUser = null;
}

// Wrapper for fetch with Bearer token authentication
async function authFetch(url, options = {}) {
  const headers = options.headers || {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  options.headers = headers;

  const res = await fetch(url, options);
  if (res.status === 401) {
    logoutUser(false);
    openLoginModal();
    throw new Error(t('pleaseLogin'));
  }

  // Ensure response is valid JSON or readable error
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.message) errMsg = errJson.message;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return res;
}

function openLoginModal() {
  document.documentElement.classList.remove('is-authenticated');
  const loginEl = document.getElementById('loginScreen') || document.getElementById('loginModal');
  loginEl?.classList.remove('hidden');
  document.getElementById('appDashboard')?.classList.add('hidden');
  document.getElementById('loginErrorBox')?.classList.add('hidden');
}

function closeLoginModal() {
  document.documentElement.classList.add('is-authenticated');
  const loginEl = document.getElementById('loginScreen') || document.getElementById('loginModal');
  loginEl?.classList.add('hidden');
  document.getElementById('appDashboard')?.classList.remove('hidden');
}

async function quickLogin(username, password, showAlert = true) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(r => r.json());

    if (!res.success) {
      alert(res.message);
      return;
    }

    authToken = res.data.token;
    currentUser = res.data.user;
    sessionStorage.setItem('shipping_auth_token', authToken);
    sessionStorage.setItem('shipping_auth_user', JSON.stringify(currentUser));

    applyRoleUI(currentUser.role);
    closeLoginModal();

    if (showAlert) {
      alert(`✅ ${t('loginSuccessMsg')}\n${currentUser.fullName} [${currentUser.role.toUpperCase()}]`);
    }

    await loadMetadata();
    await refreshAllData();
    triggerRateCalculation();
    startLiveSync();
  } catch (err) {
    console.error('Quick login error:', err);
  }
}

async function handleManualLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginErrorBox');
  errBox.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json());

    if (!res.success) {
      errBox.innerText = res.message;
      errBox.classList.remove('hidden');
      return;
    }

    authToken = res.data.token;
    currentUser = res.data.user;
    sessionStorage.setItem('shipping_auth_token', authToken);
    sessionStorage.setItem('shipping_auth_user', JSON.stringify(currentUser));

    applyRoleUI(currentUser.role);
    closeLoginModal();
    await loadMetadata();
    await refreshAllData();
    triggerRateCalculation();
    startLiveSync();
  } catch (err) {
    errBox.innerText = err.message;
    errBox.classList.remove('hidden');
  }
}

function logoutUser(promptModal = true) {
  stopLiveSync();
  authToken = null;
  currentUser = null;
  sessionStorage.removeItem('shipping_auth_token');
  sessionStorage.removeItem('shipping_auth_user');
  localStorage.removeItem('shipping_auth_token');
  localStorage.removeItem('shipping_auth_user');

  // مسح وتصفير الأرقام المالية الحساسة فوراً من الذاكرة والشاشة
  if (document.getElementById('kpi-cash-box')) document.getElementById('kpi-cash-box').innerText = '0.00 $';
  if (document.getElementById('kpi-bank')) document.getElementById('kpi-bank').innerText = '0.00 $';
  if (document.getElementById('kpi-sales')) document.getElementById('kpi-sales').innerText = '0.00 $';
  if (document.getElementById('kpi-payables')) document.getElementById('kpi-payables').innerText = '0.00 $';
  if (document.getElementById('kpi-profit')) document.getElementById('kpi-profit').innerText = '0.00 $';
  if (document.getElementById('kpi-margin')) document.getElementById('kpi-margin').innerText = `${t('marginLabel')} 0%`;

  const nameEl = document.getElementById('userNameDisplay');
  const roleEl = document.getElementById('userRoleBadge');
  if (nameEl) nameEl.innerText = t('guestUser');
  if (roleEl) roleEl.innerText = t('pleaseLogin');

  openLoginModal();
}

function applyRoleUI(role = 'admin') {
  if (!currentUser) return;

  const roleTitles = {
    admin: { ar: 'المدير العام', en: 'Administrator', badgeClass: 'text-emerald-300' },
    cashier: { ar: 'كاشير الاستقبال', en: 'Cashier', badgeClass: 'text-amber-300' },
    warehouse: { ar: 'مسؤول المستودع', en: 'Warehouse Dispatcher', badgeClass: 'text-orange-300' },
    accountant: { ar: 'المحاسب المالي', en: 'Chief Accountant', badgeClass: 'text-cyan-300' }
  };

  const info = roleTitles[role] || roleTitles['admin'];
  const title = currentLang === 'ar' ? info.ar : info.en;

  const nameEl = document.getElementById('userNameDisplay');
  const roleEl = document.getElementById('userRoleBadge');
  if (nameEl) nameEl.innerText = currentUser.fullName || currentUser.username;
  if (roleEl) {
    roleEl.innerText = `${title} (${role})`;
    roleEl.className = `text-[10px] font-bold ${info.badgeClass}`;
  }

  // 1. التحكم في ظهور التبويبات (Tab Visibility)
  const allTabs = ['booking', 'dispatch', 'orders', 'pricing', 'ledger'];
  let allowedTabs = allTabs;
  let defaultTab = 'booking';

  if (role === 'cashier') {
    allowedTabs = ['booking', 'orders'];
    defaultTab = 'booking';
  } else if (role === 'warehouse') {
    allowedTabs = ['dispatch', 'orders'];
    defaultTab = 'dispatch';
  } else if (role === 'accountant') {
    allowedTabs = ['orders', 'pricing', 'ledger'];
    defaultTab = 'ledger';
  }

  allTabs.forEach(tId => {
    const btn = document.getElementById(`tab-btn-${tId}`);
    if (btn) {
      if (allowedTabs.includes(tId)) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    }
  });

  // 2. إخفاء وإظهار بطاقات KPIs المالية الحساسة حسب الدور
  // الكاشير لا يرى مستحقات الموردين ولا أرباح الشركة
  const payablesKpi = document.getElementById('kpi-payables')?.closest('.bg-white');
  const profitKpi = document.getElementById('kpi-profit')?.closest('.bg-white');

  if (role === 'cashier') {
    if (payablesKpi) payablesKpi.classList.add('hidden');
    if (profitKpi) profitKpi.classList.add('hidden');
  } else {
    if (payablesKpi) payablesKpi.classList.remove('hidden');
    if (profitKpi) profitKpi.classList.remove('hidden');
  }

  // Switch to allowed default tab if current tab is forbidden
  if (!allowedTabs.includes(currentTab)) {
    switchTab(defaultTab);
  }
}

// ============================================================================
// Initialization & Data Fetching
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setLanguage(currentLang);

  // إذا كان المستخدم مسجل مسبقاً، يستمر في حسابه فوراً ولا يخرج أبداً عند تحديث الصفحة
  if (currentUser && authToken) {
    closeLoginModal(); // إخفاء شاشة تسجيل الدخول وإظهار لوحة العمليات
    applyRoleUI(currentUser.role);
    try {
      await loadMetadata();
      await refreshAllData();
      triggerRateCalculation();
      startLiveSync();
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  } else {
    // إذا لم يكن مسجل دخول فقط، تفتح شاشة تسجيل الدخول
    openLoginModal();
  }
});

async function loadMetadata() {
  try {
    const [zonesRes, carriersRes, customersRes] = await Promise.all([
      authFetch('/api/pricing/zones').then(r => r.json()),
      authFetch('/api/carriers').then(r => r.json()),
      authFetch('/api/customers').then(r => r.json())
    ]);

    if (zonesRes.success) {
      cachedZones = zonesRes.data;
      renderZonesDropdown(cachedZones);
      renderZonesMatrix(cachedZones);
    }

    if (carriersRes.success) {
      cachedCarriers = carriersRes.data;
      renderCarriersDropdown(cachedCarriers);
    }

    if (customersRes.success) {
      cachedCustomers = customersRes.data;
      renderCustomersDropdown(cachedCustomers);
    }
  } catch (err) {
    console.error('Failed to load initial metadata:', err);
    console.warn('Metadata fetch issue:', err.message);
  }
}

async function refreshAllData() {
  await Promise.all([
    loadFinancialKPIs(),
    loadPendingOrders(),
    loadAllOrders(),
    loadLedger()
  ]);
}

// ============================================================================
// Financial KPIs
// ============================================================================
async function loadFinancialKPIs() {
  try {
    const res = await authFetch('/api/accounting/summary').then(r => r.json());
    if (res.success && res.data.kpi) {
      const kpi = res.data.kpi;
      document.getElementById('kpi-cash-box').innerText = formatMoney(kpi.cashBox);
      document.getElementById('kpi-bank').innerText = formatMoney(kpi.bankExchange);
      document.getElementById('kpi-sales').innerText = formatMoney(kpi.totalSales);
      document.getElementById('kpi-payables').innerText = formatMoney(kpi.accountsPayableCarriers);
      document.getElementById('kpi-profit').innerText = formatMoney(kpi.grossProfit);
      document.getElementById('kpi-margin').innerText = `${t('marginLabel')} ${kpi.profitMarginPct}%`;

      const pendingCount = res.data.counts.pendingOrders;
      document.getElementById('pending-badge').innerText = `${pendingCount} ${t('pendingSuffix')}`;
    }
  } catch (err) {
    console.error('Failed to load KPIs:', err);
  }
}

// ============================================================================
// Dropdown Rendering (Bilingual)
// ============================================================================
function renderZonesDropdown(zones) {
  const select = document.getElementById('destinationZoneSelect');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '';

  zones.forEach(z => {
    const opt = document.createElement('option');
    opt.value = z.id;
    const name = currentLang === 'ar' ? z.name_ar : (z.name_en || z.name_ar);
    opt.innerText = `${name} (${z.zone_code})`;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

function renderCarriersDropdown(carriers) {
  const select = document.getElementById('dispatchCarrierSelect');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = `<option value="">${t('selectCarrierOption')}</option>`;

  carriers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    const name = currentLang === 'ar' ? c.name : (c.name_en || c.name);
    opt.innerText = `${name} [${formatMoney(c.current_balance)}]`;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

function renderCustomersDropdown(customers) {
  const select = document.getElementById('registeredCustomerSelect');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = `<option value="">${t('newCustomerOption')}</option>`;

  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = `${c.full_name} (${c.customer_code})`;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

function onSelectRegisteredCustomer() {
  const custId = document.getElementById('registeredCustomerSelect').value;
  if (!custId) {
    document.getElementById('senderName').value = '';
    document.getElementById('senderPhone').value = '';
    return;
  }
  const cust = cachedCustomers.find(c => String(c.id) === String(custId));
  if (cust) {
    document.getElementById('senderName').value = cust.full_name;
    document.getElementById('senderPhone').value = cust.phone;
  }
}

// ============================================================================
// Real-time Pricing Calculation
// ============================================================================
let calcDebounce = null;
function triggerRateCalculation() {
  clearTimeout(calcDebounce);
  calcDebounce = setTimeout(async () => {
    const zoneId = Number(document.getElementById('destinationZoneSelect')?.value);
    const actualWeight = parseFloat(document.getElementById('actualWeight')?.value) || 0.1;
    const length = parseFloat(document.getElementById('dimLength')?.value) || 0;
    const width = parseFloat(document.getElementById('dimWidth')?.value) || 0;
    const height = parseFloat(document.getElementById('dimHeight')?.value) || 0;

    if (!zoneId) return;

    try {
      const res = await authFetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, actualWeight, length, width, height })
      }).then(r => r.json());

      if (res.success && res.data) {
        const d = res.data;
        const kgUnit = currentLang === 'ar' ? ' كجم' : ' kg';
        document.getElementById('rateVolWeight').innerText = d.volumetricWeight.toFixed(2) + kgUnit;
        document.getElementById('rateChargeableWeight').innerText = d.chargeableWeight.toFixed(2) + kgUnit;
        document.getElementById('rateTierName').innerText = d.tierName;
        document.getElementById('rateTotalSales').innerText = formatMoney(d.totalSalesPrice);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }, 400);
}

// ============================================================================
// Submit Initial Order
// ============================================================================
async function submitInitialOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('saveOrderBtn');
  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> ${t('savingOrderBtn')}`;

  const customerId = document.getElementById('registeredCustomerSelect').value ? Number(document.getElementById('registeredCustomerSelect').value) : null;
  const senderName = document.getElementById('senderName').value;
  const senderPhone = document.getElementById('senderPhone').value;
  const paymentType = document.getElementById('paymentType').value;

  const receiverName = document.getElementById('receiverName').value;
  const receiverPhone = document.getElementById('receiverPhone').value;
  const receiverAddress = document.getElementById('receiverAddress').value;
  const zoneId = Number(document.getElementById('destinationZoneSelect').value);

  const actualWeight = parseFloat(document.getElementById('actualWeight').value) || 0.1;
  const length = parseFloat(document.getElementById('dimLength').value) || 0;
  const width = parseFloat(document.getElementById('dimWidth').value) || 0;
  const height = parseFloat(document.getElementById('dimHeight').value) || 0;

  try {
    const res = await authFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        receiverAddress,
        zoneId,
        actualWeight,
        dimensions: { length, width, height },
        paymentType
      })
    }).then(r => r.json());

    if (!res.success) {
      alert(`${t('validationError')}\n${res.message}`);
      return;
    }

    alert(`${t('orderSuccessTitle')}\n${res.message}\n${formatMoney(res.data.totalSalesAmount)}`);
    
    // Reset Form & Calculations
    document.getElementById('orderForm').reset();
    document.getElementById('actualWeight').value = '2.5';
    if (cachedZones.length > 0) {
      document.getElementById('destinationZoneSelect').value = cachedZones[0].id;
    }
    triggerRateCalculation();

    await refreshAllData();
    switchTab('dispatch');

  } catch (err) {
    alert(`${t('networkError')} ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>💾</span> ${t('saveOrderBtn')}`;
  }
}

// ============================================================================
// Pending Orders & Carrier Dispatch
// ============================================================================
function updatePendingBadge(count) {
  const badge = document.getElementById('pending-badge');
  if (badge) {
    badge.innerText = `${count} ${t('pendingSuffix')}`;
  }
}

function renderPendingOrdersTable(orders) {
  const tbody = document.getElementById('pendingOrdersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 font-semibold">
          ${t('noPendingOrders')}
        </td>
      </tr>
    `;
    return;
  }

  const kgUnit = currentLang === 'ar' ? ' كجم' : ' kg';

  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';

    let payBadge = '';
    if (order.payment_type === 'cash') payBadge = `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">${t('cashBadge')}</span>`;
    else if (order.payment_type === 'bank') payBadge = `<span class="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-bold">${t('bankBadge')}</span>`;
    else payBadge = `<span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">${t('creditBadge')}</span>`;

    const zoneName = currentLang === 'ar' ? order.zone_name : (order.zone_name_en || order.zone_name);

    tr.innerHTML = `
      <td class="py-3 px-4 font-black text-indigo-700 font-mono">${escapeHtml(order.order_number)}</td>
      <td class="py-3 px-4 font-bold text-slate-800">${escapeHtml(order.sender_name)}</td>
      <td class="py-3 px-4 text-slate-600">${escapeHtml(order.receiver_name)} <span class="text-xs text-indigo-500 font-bold">(${escapeHtml(zoneName)})</span></td>
      <td class="py-3 px-4 font-black text-slate-800">${order.chargeable_weight} ${kgUnit}</td>
      <td class="py-3 px-4 font-black text-blue-700">${formatMoney(order.total_sales_amount)}</td>
      <td class="py-3 px-4">${payBadge}</td>
      <td class="py-3 px-4 text-center">
        <button type="button" class="dispatch-trigger-btn px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 mx-auto"
          data-id="${order.id}"
          data-number="${escapeHtml(order.order_number)}"
          data-sender="${escapeHtml(order.sender_name)}"
          data-sales="${order.total_sales_amount}">
          <span>🚚</span> ${t('dispatchBtnText')}
        </button>
      </td>
    `;

    tr.querySelector('.dispatch-trigger-btn')?.addEventListener('click', function() {
      openDispatchForm(
        Number(this.dataset.id),
        this.dataset.number,
        this.dataset.sender,
        Number(this.dataset.sales)
      );
    });

    tbody.appendChild(tr);
  });
}

async function loadPendingOrders() {
  try {
    const res = await authFetch('/api/orders/pending-dispatch').then(r => r.json());
    if (res.success && res.data) {
      renderPendingOrdersTable(res.data);
      updatePendingBadge(res.data.length);
    }
  } catch (err) {
    console.error('Failed to load pending orders:', err);
  }
}

// ============================================================================
// Real-Time Live Synchronization (Auto-refresh between users)
// ============================================================================
let liveSyncTimer = null;
let lastSyncState = {
  pendingCount: null,
  totalOrders: null,
  totalSales: null,
  payables: null,
  grossProfit: null
};

function flashLiveSyncBadge() {
  const badge = document.getElementById('liveSyncIndicator');
  const text = document.getElementById('liveSyncText');
  const dot = document.getElementById('liveSyncDot');
  if (badge && text) {
    text.innerText = t('liveSyncUpdated');
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400 transition-all duration-300 scale-105';
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-300 rtl:ml-1.5 ltr:mr-1.5 animate-ping';

    setTimeout(() => {
      text.innerText = t('liveSyncActive');
      badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all duration-300';
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-cyan-400 rtl:ml-1.5 ltr:mr-1.5';
    }, 1800);
  }
}

function startLiveSync() {
  stopLiveSync();

  // Periodic heartbeat sync every 3000ms
  liveSyncTimer = setInterval(async () => {
    // Only sync if logged in and browser tab is visible
    if (!authToken || document.hidden) return;

    try {
      const [summaryRes, pendingRes] = await Promise.all([
        authFetch('/api/accounting/summary').then(r => r.json()),
        authFetch('/api/orders/pending-dispatch').then(r => r.json())
      ]);

      if (summaryRes.success && summaryRes.data && pendingRes.success) {
        const kpi = summaryRes.data.kpi;
        const counts = summaryRes.data.counts;
        const currentPendingCount = pendingRes.data.length;

        // Detect if anything changed across the system
        const stateChanged = (
          lastSyncState.pendingCount !== null && (
            lastSyncState.pendingCount !== currentPendingCount ||
            lastSyncState.totalOrders !== counts.totalOrders ||
            lastSyncState.totalSales !== kpi.totalSales ||
            lastSyncState.payables !== kpi.accountsPayableCarriers ||
            lastSyncState.grossProfit !== kpi.grossProfit
          )
        );

        // Always update badges
        updatePendingBadge(currentPendingCount);

        if (stateChanged) {
          flashLiveSyncBadge();

          // Smoothly update KPIs
          document.getElementById('kpi-cash-box').innerText = formatMoney(kpi.cashBox);
          document.getElementById('kpi-bank').innerText = formatMoney(kpi.bankExchange);
          document.getElementById('kpi-sales').innerText = formatMoney(kpi.totalSales);
          document.getElementById('kpi-payables').innerText = formatMoney(kpi.accountsPayableCarriers);
          document.getElementById('kpi-profit').innerText = formatMoney(kpi.grossProfit);
          document.getElementById('kpi-margin').innerText = `${t('marginLabel')} ${kpi.profitMarginPct}%`;

          // If current tab is dispatch, update pending orders table smoothly
          if (currentTab === 'dispatch') {
            renderPendingOrdersTable(pendingRes.data);
          } else if (currentTab === 'orders') {
            // Avoid interrupting user if they are currently typing in search field
            const searchInput = document.getElementById('orderSearchInput');
            if (document.activeElement !== searchInput) {
              searchOrders();
            }
          } else if (currentTab === 'ledger') {
            loadLedger();
          }
        }

        // Cache state
        lastSyncState = {
          pendingCount: currentPendingCount,
          totalOrders: counts.totalOrders,
          totalSales: kpi.totalSales,
          payables: kpi.accountsPayableCarriers,
          grossProfit: kpi.grossProfit
        };
      }
    } catch (err) {
      // Quietly ignore transient heartbeat issues
    }
  }, 3000);
}

function stopLiveSync() {
  if (liveSyncTimer) {
    clearInterval(liveSyncTimer);
    liveSyncTimer = null;
  }
}

function openDispatchForm(orderId, orderNum, sender, salesAmount) {
  document.getElementById('dispatchInitialOrderId').value = orderId;
  document.getElementById('dispatchDisplayOrder').value = `${orderNum} (${sender}) - ${formatMoney(salesAmount)}`;
  document.getElementById('dispatchSupplierWaybill').value = '';
  document.getElementById('dispatchCarrierCost').value = (salesAmount * 0.6).toFixed(2);
  document.getElementById('dispatchFormBox').classList.remove('hidden');
  document.getElementById('dispatchFormBox').scrollIntoView({ behavior: 'smooth' });
}

function closeDispatchForm() {
  document.getElementById('dispatchFormBox').classList.add('hidden');
}

async function submitFinalDispatch(e) {
  e.preventDefault();
  const initialOrderId = Number(document.getElementById('dispatchInitialOrderId').value);
  const carrierId = Number(document.getElementById('dispatchCarrierSelect').value);
  const supplierWaybillNumber = document.getElementById('dispatchSupplierWaybill').value.trim();
  const carrierCost = parseFloat(document.getElementById('dispatchCarrierCost').value) || 0;

  if (!carrierId) {
    alert(t('selectCarrierOption'));
    return;
  }

  try {
    const res = await authFetch('/api/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initialOrderId,
        carrierId,
        supplierWaybillNumber,
        carrierCost
      })
    }).then(r => r.json());

    if (!res.success) {
      alert(`⚠️ ${res.message}`);
      return;
    }

    alert(`${t('dispatchSuccessTitle')}\n${res.message}\n${formatMoney(res.data.grossProfit)}`);
    closeDispatchForm();
    await refreshAllData();
    switchTab('orders');

  } catch (err) {
    alert('Network error: ' + err.message);
  }
}

// ============================================================================
// All Orders Search & Listing
// ============================================================================
async function loadAllOrders() {
  searchOrders();
}

async function searchOrders() {
  const search = document.getElementById('orderSearchInput')?.value || '';
  const status = document.getElementById('orderStatusFilter')?.value || '';

  try {
    let url = `/api/orders?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;

    const res = await authFetch(url).then(r => r.json());
    const tbody = document.getElementById('allOrdersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!res.success || res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="py-6 text-center text-slate-400">${t('noResults')}</td></tr>`;
      return;
    }

    const kgUnit = currentLang === 'ar' ? ' كجم' : ' kg';

    res.data.forEach(o => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';

      const isFinal = o.status === 'final_dispatched';
      const statusBadge = isFinal
        ? `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">${t('statusFinal')}</span>`
        : `<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">${t('statusInitial')}</span>`;

      const carrierRawName = currentLang === 'ar' ? o.carrier_name : (o.carrier_name_en || o.carrier_name);
      const carrierName = carrierRawName ? escapeHtml(carrierRawName) : `<span class="text-slate-400 text-xs">${t('notAssigned')}</span>`;
      const zoneName = currentLang === 'ar' ? o.zone_name : (o.zone_name_en || o.zone_name);
      const waybill = o.supplier_waybill_number ? `<span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">${escapeHtml(o.supplier_waybill_number)}</span>` : '<span class="text-slate-400">-</span>';
      const cost = o.carrier_cost ? formatMoney(o.carrier_cost) : '<span class="text-slate-400">-</span>';
      const profit = o.gross_profit !== null && o.gross_profit !== undefined ? `<span class="font-black text-emerald-700">${formatMoney(o.gross_profit)}</span>` : '<span class="text-slate-400">-</span>';

      tr.innerHTML = `
        <td class="py-3 px-3 font-mono font-black text-slate-900">${escapeHtml(o.order_number)}</td>
        <td class="py-3 px-3 font-bold text-slate-800">${escapeHtml(o.sender_name)}</td>
        <td class="py-3 px-3 text-slate-600">${escapeHtml(o.receiver_name)} (${escapeHtml(zoneName)})</td>
        <td class="py-3 px-3 font-semibold">${o.chargeable_weight} ${kgUnit}</td>
        <td class="py-3 px-3 font-black text-blue-700">${formatMoney(o.total_sales_amount)}</td>
        <td class="py-3 px-3 font-medium text-slate-700">${carrierName}</td>
        <td class="py-3 px-3">${waybill}</td>
        <td class="py-3 px-3 text-rose-700 font-bold">${cost}</td>
        <td class="py-3 px-3">${profit}</td>
        <td class="py-3 px-3">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Failed to search orders:', err);
  }
}

// ============================================================================
// General Ledger
// ============================================================================
async function loadLedger() {
  try {
    const res = await authFetch('/api/accounting/summary').then(r => r.json());
    const container = document.getElementById('ledgerJournalsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!res.success || res.data.recentJournals.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-slate-400">${t('noJournals')}</div>`;
      return;
    }

    res.data.recentJournals.forEach(j => {
      const card = document.createElement('div');
      card.className = 'bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2';

      let linesHtml = '';
      j.lines.forEach(l => {
        const accountName = currentLang === 'ar' ? l.account_name_ar : (l.account_name_en || l.account_name_ar);
        linesHtml += `
          <div class="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">${escapeHtml(l.account_code)}</span>
              <span class="font-bold text-slate-800">${escapeHtml(accountName)}</span>
              <span class="text-slate-400">(${escapeHtml(l.memo)})</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-black ${Number(l.debit_amount) > 0 ? 'text-emerald-700' : 'text-slate-300'}">${t('debitLabel')} ${formatMoney(l.debit_amount)}</span>
              <span class="font-black ${Number(l.credit_amount) > 0 ? 'text-rose-700' : 'text-slate-300'}">${t('creditLabel')} ${formatMoney(l.credit_amount)}</span>
            </div>
          </div>
        `;
      });

      const dateStr = new Date(j.entry_date).toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US');

      card.innerHTML = `
        <div class="flex justify-between items-center pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="font-mono font-black text-indigo-900 bg-indigo-100/70 px-2.5 py-1 rounded-md text-xs">${escapeHtml(j.entry_number)}</span>
            <span class="text-xs font-bold text-slate-700">${escapeHtml(j.description)}</span>
          </div>
          <span class="text-[11px] text-slate-400">${dateStr}</span>
        </div>
        <div class="space-y-1">
          ${linesHtml}
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Failed to load ledger:', err);
  }
}

// ============================================================================
// Pricing Matrix Cards
// ============================================================================
function renderZonesMatrix(zones) {
  const container = document.getElementById('zonesContainer');
  if (!container) return;
  container.innerHTML = '';

  const zoneColors = [
    { header: 'from-indigo-900 to-indigo-950', badge: 'text-indigo-200' },
    { header: 'from-blue-900 to-blue-950', badge: 'text-blue-200' },
    { header: 'from-teal-900 to-teal-950', badge: 'text-teal-200' },
    { header: 'from-purple-900 to-purple-950', badge: 'text-purple-200' }
  ];

  zones.forEach((z, index) => {
    const c = zoneColors[index % zoneColors.length];
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs';

    const zoneTitle = currentLang === 'ar' ? z.name_ar : (z.name_en || z.name_ar);
    const subDesc = currentLang === 'ar' ? (z.countries_list || z.description) : (z.countries_list || z.name_en);

    let tiersHtml = '';
    (z.tiers || []).forEach(t => {
      const tierTitle = currentLang === 'ar' ? t.tier_name : (t.tier_name_en || t.tier_name);
      tiersHtml += `
        <div class="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
          <span class="text-slate-600 font-semibold">${tierTitle}</span>
          <span class="font-black text-slate-900">${formatMoney(t.base_selling_price)}</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="bg-gradient-to-r ${c.header} text-white p-4">
        <h3 class="font-bold text-sm text-white">${zoneTitle}</h3>
        <p class="text-[11px] ${c.badge} mt-0.5 truncate">${subDesc}</p>
      </div>
      <div class="p-4 space-y-1">
        ${tiersHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

// ============================================================================
// Tabs Switching
// ============================================================================
function switchTab(tabId) {
  ['booking', 'dispatch', 'orders', 'pricing', 'ledger'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('hidden');
    document.getElementById(`tab-btn-${t}`).classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById(`tab-btn-${t}`).classList.add('border-transparent', 'text-slate-600');
  });

  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tabId}`).classList.add('border-indigo-600', 'text-indigo-600');
  document.getElementById(`tab-btn-${tabId}`).classList.remove('border-transparent', 'text-slate-600');

  currentTab = tabId;
  if (tabId === 'dispatch') loadPendingOrders();
  if (tabId === 'orders') loadAllOrders();
  if (tabId === 'ledger') loadLedger();
}

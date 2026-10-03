# تقرير التدقيق الفني والمعماري الشامل لنظام الشحن والترحيل المالي
**Project:** Shipping & Financial Posting ERP  
**Target Reviewer:** Claude Opus / Senior Software Architects  
**Author:** Antigravity Enterprise Architect  
**Version:** 1.0.0 (Production-Ready MVP)  
**Date:** October 2026  

---

## 1. ملخص تنفيذي (Executive Summary)
تم تصميم وبناء نظام سحابي لإدارة عمليات شركات ووكالات الشحن والخدمات اللوجستية يربط بين:
1. **العمليات التشغيلية (Operations):** دورة حياة الشحنة بدءاً من الطلب الأولي (مع تحديد الأوزان والوجهات والشرائح آلياً)، وحتى ترحيلها إلى طلب نهائي برقم بوليصة المورد/الناقل الخارجي.
2. **القيود المحاسبية التلقائية (Strict Double-Entry Accounting):** التأثير اللحظي للطلب الأولي على الصندوق/الصراف/العملاء والمبيعات، والتأثير اللحظي للطلب النهائي على مستحقات المورد وتكلفة المبيعات وصافي الأرباح.
3. **الدعم ثنائي اللغة (Bilingual Architecture):** دعم كامل ومتكافئ للغتين العربية والإنجليزية مع التبديل الفوري للاتجاه (RTL / LTR) والخطوط.

---

## 2. اللغات، بيئات التشغيل، والمكتبات المستخدمة (Tech Stack & Dependencies)

### 2.1 لغات البرمجة والترميز (Languages)
* **JavaScript (ECMAScript 2024 / Node.js ES Modules):** لغة بناء الواجهة الخلفية (Backend APIs)، نماذج الأعمال (Domain Services)، والمنطق التفاعلي للواجهة الأمامية (Frontend Vanilla JS).
* **SQL (SQLite Dialect):** لغة تعريف وهيكلة جداول البيانات (DDL)، والمعاملات المالية والاستعلامات (DML).
* **HTML5 & CSS3:** هيكلة صفحات الواجهة وتنسيقها باتجاه مزدوج (RTL/LTR).

### 2.2 بيئة التشغيل والخادم (Runtime & Engine)
* **Node.js (v24.21.0 LTS):** بيئة تشغيل عالية الأداء وخفيفة الموارد.
* **`node:sqlite` (Native Embedded Database Engine):** محرك قاعدة بيانات مدمج فائق السرعة مفعل به وضع **WAL (Write-Ahead Logging)** لضمان الاستقرار ومنع تعارض القراءة والكتابة، مع فرض فحص المفاتيح الأجنبية (`PRAGMA foreign_keys = ON`).

### 2.3 المكتبات والحزم الأساسية (Core Dependencies)
* **`express` (v4.21.2):** إطار عمل الـ HTTP Routing وخدمة الـ RESTful APIs.
* **`zod` (v3.24.2):** محرك التحقق الصارم من صحة البيانات (Schema Validation & Type Safety) لمنع المدخلات المشوهة.
* **`helmet` (v8.0.0):** تأمين ترويسات بروتوكول HTTP ضد الهجمات الشائعة (XSS, Clickjacking, MIME sniffing).
* **`cors` (v2.8.5):** إدارة ومصادقة مشاركة الموارد عبر النطاقات المختلفة بأمان.
* **Tailwind CSS Engine:** محرك التنسيق والتصميم التفاعلي المتجاوب لجميع الشاشات.

---

## 3. المعمارية الهندسية والأنماط المطبقة (Architecture & Design Patterns)

```
d:\projects\trading\
├── src/
│   ├── config/
│   │   └── database.js               # Database connection, WAL pragma, DDL schema & migrations
│   ├── domain/
│   │   └── services/
│   │       ├── PricingCalculator.js  # Weight rating engine (Volumetric, chargeable, tiers)
│   │       └── AccountingEngine.js   # Invariant double-entry bookkeeping engine
│   ├── repositories/
│   │   └── OrderRepository.js        # Relational queries and lookups
│   ├── use-cases/
│   │   ├── CreateInitialOrder.js     # Booking logic, independent numbering, sales posting
│   │   ├── DispatchToFinal.js        # Carrier waybill assignment, liability posting, profit
│   │   ├── CalculateRate.js          # Real-time pricing calculator
│   │   └── GetFinancialSummary.js    # Financial metrics, P&L, journals, and balances
│   ├── api/
│   │   ├── middlewares/
│   │   │   └── errorHandler.js       # Centralized error handler with Zod & business mapping
│   │   └── routes/                   # RESTful endpoints (orders, dispatch, pricing, accounting, ...)
│   └── server.js                     # Server bootstrap & daemon runner
├── public/                           # Bilingual Single Page Application
│   ├── index.html                    # Responsive RTL/LTR structure with data-i18n
│   └── app.js                        # i18n dictionary, reactive state, live calc & modals
├── test-integration.js               # End-to-end automated accounting & workflow test suite
└── package.json
```

### الأنماط المعمارية المعتمدة (Architectural Patterns):
1. **Clean Architecture / Domain-Driven Design (DDD Lite):**
   - فصل كامل لمنطق العمليات والحسابات في طبقة النطاق (`domain/services`) بعيداً عن بروتوكولات الويب وواجهات العرض.
2. **حالات الاستخدام المستقلة (Use Cases / Single Responsibility):**
   - كل عملية تشغيلية تمثل فئة مستقلة بذاتها (`CreateInitialOrderUseCase`, `DispatchToFinalUseCase`).
3. **المعاملات الذرية المحمية (ACID Transactions):**
   - استخدام `BEGIN TRANSACTION` و `COMMIT` مع `ROLLBACK` تلقائي لمنع أي قيد غير مكتمل.
4. **توازن القيد المزدوج الإلزامي (Double-Entry Balance Invariant):**
   - فحص رياضي صارم: $\sum \text{Debits} - \sum \text{Credits} = 0$ قبل إدراج أي طرف في اليومية العامة.

---

## 4. تدقيق دورة العمل والأثر المالي (Financial Workflow Audit)

| الحدث التشغيلي | الحساب المدين (Debit) | الحساب الدائن (Credit) | الأثر في النظام |
| :--- | :--- | :--- | :--- |
| **حجز طلب أولي (دفع نقدي)** | `1010 - الصندوق الرئيسي` | `4100 - إيرادات مبيعات الشحن` | زيادة فورية في رصيد الصندوق والمبيعات |
| **حجز طلب أولي (تحويل/صراف)** | `1020 - حساب الصراف والبنك` | `4100 - إيرادات مبيعات الشحن` | زيادة فورية في حساب الصراف والمبيعات |
| **حجز طلب أولي (آجل على الحساب)** | `1100 - ذمم العملاء (AR)` | `4100 - إيرادات مبيعات الشحن` | إثبات مديونية على العميل والمبيعات |
| **الترحيل للنهائي ببوليصة المورد** | `5100 - تكلفة مبيعات الشحن (COGS)` | `2100 - ذمم الموردين (AP)` | إثبات استحقاق للناقل وتحديد تكلفة الشحنة |
| **احتساب الربح الفوري** | تلقائي: $\text{Gross Profit} = \text{سعر بيع الطلب الأولي} - \text{تكلفة بوليصة المورد}$ | يظهر لحظياً في مؤشرات الأداء وكشف الشحنة |

---

## 5. نتائج الاختبارات الآلية (Verification & Integration Testing)
تم تنفيذ اختبار تكاملي مؤتمت عبر ملف [`test-integration.js`](file:///d:/projects/trading/test-integration.js):
- **حساب الأوزان:** تطابق معادلة الوزن الحجمي بدقة (الفعلي مقابل الحجمي $\frac{L \times W \times H}{5000}$).
- **التأثير المالي للطلب الأولي:** زيادة الصندوق والمبيعات بنسبة 100%.
- **التأثير المالي للطلب النهائي:** زيادة مستحقات المورد واحتساب صافي الربح بدقة.
- **حماية تكرار البوالص:** منع تكرار نفس رقم بوليصة المورد، ومنع إعادة ترحيل الشحنة المنتهية.

---

## 6. اقتراحات التطوير والتحسين الشاملة (Recommendations for Claude Opus Review)

نقدم فيما يلي مجموعة من الاقتراحات المقسمة حسب المحاور الهندسية والوظيفية لمقارنتها ومناقشتها مع Claude Opus:

### 6.1 تحسينات المعمارية وقواعد البيانات (Architecture & DB Scalability)
1. **نمط مستودع البيانات التجريدي (Database Agnostic / Repository Pattern):**
   - *الوضع الحالي:* النظام يعمل على SQLite مدمج عالي السرعة بوضع WAL وهو كافٍ ومثالي للعمل المكتبي والشبكات المحلية.
   - *الاقتراح:* تجريد طبقة قاعدة البيانات لدعم التبديل السلس بين **SQLite** و **PostgreSQL / MySQL** عبر متغير بيئة واحد (`DB_DIALECT=postgres`) لتسهيل التوسع السحابي واستيعاب ملايين السجلات في المستقبل.
2. **دعم العملات المتعددة وأسعار الصرف (Multi-Currency & FX Engine):**
   - شركات الشحن الدولية غالباً ما تشتري الخدمة بالدولار ($) وتبيع للعميل المحلي بالريال السعودي أو العملة المحلية.
   - *الاقتراح:* إضافة جدول أسعار الصرف اليومية وتسجيل العملة الأصلية والعملة المقابلة في القيد المحاسبي.

### 6.2 تحسينات محاسبية وتشغيلية (Accounting & Operations Features)
3. **سندات الصرف والقبض لتسوية الموردين والعملاء (Payment & Receipt Vouchers):**
   - *الوضع الحالي:* النظام يثبت مديونية العميل واستحقاق المورد بدقة.
   - *الاقتراح:* إضافة شاشة مستقلة لـ:
     - **سداد المورد:** صرف مالي من الصندوق/البنك لسداد مستحقات شركة الشحن (قيد: مدين للمورد / دائن للصندوق).
     - **تحصيل من العميل الآجل:** قبض نقدي/بنكي لتخفيض مديونية العميل (قيد: مدين للصندوق / دائن لذمم العميل).
4. **دعم التعديلات والإلغاء مع الحفاظ على عدم قابلية الحذف (Accounting Immutability):**
   - في المحاسبة الاحترافية، لا تُحذف القيود، بل يتم عمل **إشعار تسوية دائن/مدين (Credit/Debit Note)** أو قيد عكسي معتمد من المشرف.
   - *الاقتراح:* بناء ميزة "إلغاء الشحنة بقيد عكسي معتمد".
5. **طباعة ملصقات الباركود بمقاس الطابعات الحرارية (Thermal Labels Printing 4×6"):**
   - إضافة ميزة توليد ملصق شحن حراري جاهز للطباعة المباشرة على طابعات الباركود (Zebra / Xprinter) بمقاس 4×6 إنش يحتوي على الباركود وQR Code وبيانات المستلم ورقم البوليصة.

### 6.3 تحسينات تجربة المستخدم والأتمتة (UX & Automations)
6. **ربط رسائل واتساب و SMS التلقائية للعميل (WhatsApp Webhook / API):**
   - بمجرد ترحيل الشحنة للنهائي وإدخال بوليصة المورد، يتم إرسال رسالة واتساب تلقائية للمستلم والمرسل تحتوي على: "تم شحن طردكم عبر [DHL] ورقم التتبع الخاص بكم هو: [AWB-XXXX]".
7. **الربط الإلكتروني المباشر مع واجهات الناقلين (Carrier APIs Integration):**
   - إمكانية استدعاء APIs لشركات الشحن الكبرى (مثل DHL Express API أو Aramex API) لتوليد البوليصة تلقائياً بنقرة زر دون الحاجة لكتابتها يدوياً.

### 6.4 تحسينات الأمان والامتثال (Security & Governance)
8. **نظام الصلاحيات والأدوار (Role-Based Access Control - RBAC):**
   - إضافة نظام مصادقة JWT وصلاحيات:
     - *أمين الصندوق (Cashier):* حجز الطلبات والقبض النقدي فقط.
     - *مسؤول المستودع (Dispatcher):* استلام الطرود والترحيل للموردين.
     - *المحاسب (Accountant):* الاطلاع على القيود وتسوية الموردين.
     - *المدير العام (Admin):* كامل الصلاحيات وتعديل مصفوفة الأسعار.
9. **سجل تدقيق الأنشطة الرقابي (Audit Log Trail):**
   - تسجيل أي عملية إدخال أو ترحيل مصحوبة بـ: تاريخ ووقت التنفيذ، هوية المستخدم، وعنوان IP.
10. **تقييد وتحديد معدل الطلبات (Rate Limiting):**
    - استخدام `express-rate-limit` لحماية الـ APIs من هجمات الإغراق أو التخمين.

---

## 7. خاتمة وتوجيه للمراجع (Note for Claude Opus)
هذا النظام تم بناؤه وفق معايير صارمة تجمع بين سهولة التشغيل السريع وحصانة القيود المحاسبية. نرحب بملاحظاتكم حول:
- كفاءة نموذج البيانات (Schema Normalization).
- هندسة محرك القيد المزدوج.
- أي ثغرات أو تحسينات إضافية ترونها في مسار العمليات.

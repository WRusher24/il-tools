/**
 * Seed data — migrated 1:1 from the legacy `generate_site.py` monolith.
 * Content lives here as typed records instead of ad-hoc dicts inside a
 * script, and is upserted idempotently by `src/db/seed.ts`.
 */

export interface ToolSeed {
  slug: string;
  name: string;
  category: string;
  target: string;
  startingPriceIls: number;
  freeTierAvailable: boolean;
  hasMobileApp: boolean;
  ecommerceIntegration: string;
  hebrewSupport: string;
  hasApi: boolean;
  israelVatSupport: string;
  affiliateLink: string;
  description: string;
}

export interface GuideSeed {
  slug: string;
  title: string;
  description: string;
  content: string;
  readingMinutes: number;
}

export const TOOL_SEEDS: ToolSeed[] = [
  {
    slug: "morning",
    name: "Morning (חשבונית ירוקה)",
    category: "Invoicing & Expenses",
    target: "Freelancers & Exempt Dealers",
    startingPriceIls: 35,
    freeTierAvailable: true,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (WooCommerce, Shopify)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/morning",
    description:
      "Morning (לשעבר חשבונית ירוקה) היא אחת הפלטפורמות המובילות בישראל לניהול עסק, הפקת חשבוניות דיגיטליות, סליקת אשראי וניהול הוצאות לעצמאים ועסקים קטנים.",
  },
  {
    slug: "icount",
    name: "iCount",
    category: "Full Business Management",
    target: "Freelancers to Companies",
    startingPriceIls: 30,
    freeTierAvailable: false,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (Advanced API & Make)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes (Automated 'חשבוניות ישראל')",
    affiliateLink: "https://your-affiliate-link.com/icount",
    description:
      "iCount היא מערכת ניהול עסקי והנהלת חשבונות מתקדמת המותאמת לעצמאים ולחברות, הכוללת אוטומציות חכמות, ממשק API פתוח ותמיכה מלאה בתקנות רשות המסים.",
  },
  {
    slug: "ezcount",
    name: "Ezcount",
    category: "Digital Invoicing & Cleardata",
    target: "Micro-businesses & E-commerce",
    startingPriceIls: 25,
    freeTierAvailable: false,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (Plugins & API)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/ezcount",
    description:
      "Ezcount מתמחה בהפקת חשבוניות מהירות ופיתוח פתרונות סליקה לאתרי מסחר אלקטרוני, חנויות אונליין ועצמאים המחפשים פשטות ויעילות.",
  },
  {
    slug: "sumit",
    name: "Sumit (סאמיט)",
    category: "Invoicing, Billing & Payments",
    target: "Freelancers & Small Business",
    startingPriceIls: 19,
    freeTierAvailable: true,
    hasMobileApp: true,
    ecommerceIntegration: "Yes",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/sumit",
    description:
      "Sumit מציעה פתרונות מתקדמים לחיוב לקוחות, ניהול מועדוני לקוח, סליקת אשראי והפקת חשבוניות במסלולים גמישים במיוחד לעצמאים.",
  },
  {
    slug: "rivhit",
    name: "Rivhit (ריווחית)",
    category: "Traditional Accounting & Online",
    target: "Small Businesses to Enterprises",
    startingPriceIls: 30,
    freeTierAvailable: false,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (iCredit API)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/rivhit",
    description:
      "Rivhit היא אחת המערכות הוותיקות והחזקות בשוק הישראלי, המשלבת הנהלת חשבונות מסורתית יחד עם כלים אונליין מתקדמים לעסקים בכל סדר גודל.",
  },
  {
    slug: "invoice4u",
    name: "Invoice4u",
    category: "Cloud Invoicing & Clearing",
    target: "Freelancers & Authorized Dealers",
    startingPriceIls: 29,
    freeTierAvailable: true,
    hasMobileApp: true,
    ecommerceIntegration: "Yes",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/invoice4u",
    description:
      "Invoice4u מספקת פתרון ענן מתקדם להפקת חשבוניות, ניהול הוצאות, סליקת אשראי ועבודה חלקה מול רואי חשבון.",
  },
  {
    slug: "cardcom",
    name: "Cardcom (קארדקום)",
    category: "Payment Gateway & Invoicing",
    target: "E-commerce & Businesses",
    startingPriceIls: 40,
    freeTierAvailable: false,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (Full Plugins)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/cardcom",
    description:
      "Cardcom מתמחה בסליקת אשראי מתקדמת, פתרונות חיוב דיגיטליים (Apple Pay, Bit) והפקת חשבוניות אוטומטיות לחנויות אונליין.",
  },
  {
    slug: "tranzila",
    name: "Tranzila (טרנזילה)",
    category: "Advanced Payments & Billing",
    target: "Medium to Large Businesses",
    startingPriceIls: 50,
    freeTierAvailable: false,
    hasMobileApp: true,
    ecommerceIntegration: "Yes (Advanced)",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/tranzila",
    description:
      "Tranzila היא מערכת סליקה ותשלומים מהוותיקות והמאובטחות בישראל, המספקת פתרונות חיוב מורכבים ומסמכים חשבונאיים לעסקים גדולים.",
  },
  {
    slug: "takbull",
    name: "Takbull (תקבול)",
    category: "Billing & Automation",
    target: "Businesses & Organizations",
    startingPriceIls: 25,
    freeTierAvailable: false,
    hasMobileApp: false,
    ecommerceIntegration: "Yes",
    hebrewSupport: "Full (RTL)",
    hasApi: true,
    israelVatSupport: "Yes",
    affiliateLink: "https://your-affiliate-link.com/takbull",
    description:
      "Takbull מאגדת פתרונות גבייה, סליקה, הפקת מסמכים ואוטומציות מתקדמות תחת קורת גג אחת לעסקים ולחברות.",
  },
];

export const GUIDE_SEEDS: GuideSeed[] = [
  {
    slug: "how-to-open-osek-patur",
    title: "איך פותחים עוסק פטור לבד? מדריך מקיף לשנת 2026",
    description:
      'מדריך שלב אחר שלב לפתיחת תיק עוסק פטור במס הכנסה, מע"מ וביטוח לאומי לבד, חסכון בעלויות ואיזה תוכנות יעזרו לך בדרך.',
    readingMinutes: 6,
    content: `
      <h2>למה כדאי לפתוח עוסק פטור לבד?</h2>
      <p>
        פתיחת עוסק פטור בישראל היא תהליך פשוט יחסית שרבים בוחרים לעשות בעצמם כדי לחסוך את עלויות רואה החשבון בשלבים הראשונים של העסק. עם הכלים הדיגיטליים הנכונים, אפשר לנהל את התיק, להפיק חשבוניות ירוקות ודיווחים באופן עצמאי לחלוטין.
      </p>
      <h2>שלב 1: רישום במע"מ (מס ערך מוסף)</h2>
      <p>
        התחנה הראשונה היא סניף מע"מ המקומי לאזור מגוריך (או באופן דיגיטלי במערכות רשות המסים). יש להצטייד בצילום תעודת זהות, ספח, אישור ניהול חשבון בנק (או צק) וטופס פתיחת תיק עוסק פטור (טופס 821). מחזור ההכנסות המקסימלי לעוסק פטור מעודכן מעת לעת (עומד סביב 120,000 ש"ח בשנה).
      </p>
      <h2>שלב 2: פתיחת תיק במס הכנסה</h2>
      <p>
        לאחר מע"מ, יש לפתוח תיק במס הכנסה (פקיד השומה). ניתן לעשות זאת לרוב במקביל או מיד לאחר מכן. בשלב זה תוגדר מקדמת מס הכנסה (לרוב 0% או אחוז נמוך לעסקים בתחילת דרכם).
      </p>
      <h2>שלב 3: רישום בביטוח הלאומי</h2>
      <p>
        חובה לדווח לביטוח הלאומי על פתיחת העסק תוך זמן קצר מיום פתיחתו. יקבעו לך מקדמות חודשיות בהתאם להערכת ההכנסות שלך. אם מדובר עבודה נוספת לצד שכירות, חשוב לעדכן זאת כדי למנוע כפילויות.
      </p>
      <h2>הכלי החשוב ביותר: תוכנת הנהלת חשבונות דיגיטלית</h2>
      <p>
        מרגע שהעסק פתוח, חובה עליך להפיק קבלות וחשבוניות לכל הכנסה. מערכות כמו Morning, iCount או Ezcount מאפשרות לעסקים פטורים להפיק מסמכים דיגיטליים חתומים בקלות ובזול.
      </p>
    `,
  },
  {
    slug: "digital-invoices-israel-rules",
    title: "חוק חשבוניות ישראל (מספר הקצאה): מה שכל עצמאי חייב לדעת",
    description: "הכל על רפורמת חשבוניות ישראל ואיך היא משפיעה על העסק שלך.",
    readingMinutes: 4,
    content: `
      <h2>מהי רפורמת "חשבוניות ישראל"?</h2>
      <p>
        רפורמת חשבוניות ישראל של רשות המסים נועדה להילחם בהון השחור ובחשבוניות פיקטיביות. במסגרת הרפורמה, עסקאות B2B (עסק מול עסק) מעל סכומי סף מסוימים דורשות קבלת "מספר הקצאה" בזמן אמת ממערכות רשות המסים כתנאי לקיזוז מע"מ.
      </p>
      <h2>למי זה רלוונטי?</h2>
      <p>
        הרפורמה חלה על חשבוניות מס בין עסקים (B2B) החל מסכומי הסף שנקבעו בחוק, ומדרגת את חובת קבלת מספר ההקצאה לפי גובה העסקה. עוסקים פטורים המעסיקים לקוחות עסקיים צריכים לוודא שהמערכת שלהם מחוברת לשירות ההקצאות של רשות המסים.
      </p>
      <h2>איך מתכוננים?</h2>
      <p>
        בחרו מערכת הנהלת חשבונות בעלת חיבור מלא ואוטומטי לקבלת מספרי הקצאה בזמן אמת, ודאו שהחשבוניות מופקות דרך ענן מאובטח, והקפידו על שמירת תיעוד דיגיטלי מסודר לכל עסקה.
      </p>
    `,
  },
  {
    slug: "recognized-expenses-freelancers",
    title: "הוצאות מוכרות לעצמאים: המדריך המלא להפחתת מס",
    description: "גלו אילו הוצאות ניתן לדרוש כעצמאי בישראל ואיך לחסוך במס.",
    readingMinutes: 5,
    content: `
      <h2>מהי הוצאה מוכרת?</h2>
      <p>
        הוצאה מוכרת היא כל הוצאה שהוצאה בייצור הכנסה לעסק. ככל שיש לך יותר הוצאות מוכרות חוקיות, כך הרווח החייב במס שלך קטן.
      </p>
      <h2>דוגמאות להוצאות נפוצות</h2>
      <p>
        שכירות ואחזקת משרד (או חלק יחסי מהדירה בעבודה מהבית), ציוד מחשוב ותוכנות, טלפון ואינטרנט, נסיעות והשתלמויות מקצועיות, שירותי ראיית חשבון וביטוחים עסקיים.
      </p>
      <h2>איך מנהלים הוצאות נכון?</h2>
      <p>
        שמרו קבלות דיגיטליות לכל הוצאה, צלמו חשבוניות מיד עם קבלתן באפליקציה ייעודית, והפרידו בין כרטיס האשראי העסקי לפרטי כדי למנוע בלבול בדו"ח השנתי.
      </p>
    `,
  },
];

/** Head-to-head comparison pairs (slug = `${a}-vs-${b}`). */
export const COMPARISON_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["morning", "icount"],
  ["ezcount", "sumit"],
  ["morning", "ezcount"],
];

/** Demo accounts for local RBAC exploration; passwords overridable via env. */
export const DEMO_USERS = [
  {
    email: "admin@il-tools.co.il",
    name: "דנה (מנהלת)",
    role: "admin" as const,
    envKey: "SEED_ADMIN_PASSWORD",
    fallbackPassword: "Admin12345!",
  },
  {
    email: "premium@il-tools.co.il",
    name: "יובל (פרימיום)",
    role: "premium" as const,
    envKey: "SEED_PREMIUM_PASSWORD",
    fallbackPassword: "Premium12345!",
  },
  {
    email: "free@il-tools.co.il",
    name: "נועה (חינם)",
    role: "free" as const,
    envKey: "SEED_FREE_PASSWORD",
    fallbackPassword: "Free12345!",
  },
];

/** Historical feed rows — only inserted when the activity table is empty. */
export const ACTIVITY_SEEDS = [
  {
    type: "affiliate_click",
    actorName: "אורח",
    message: "עבר לאתר הרשמי של Morning דרך קישור ההשוואה",
    toolSlug: "morning",
  },
  {
    type: "compare_view",
    actorName: "אורח",
    message: "צפה בהשוואה Morning מול iCount",
    toolSlug: null,
  },
  {
    type: "affiliate_click",
    actorName: "אורח",
    message: "עבר לאתר הרשמי של Sumit",
    toolSlug: "sumit",
  },
];

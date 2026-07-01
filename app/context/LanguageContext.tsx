"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type Lang = "en" | "ar";

interface LanguageContextValue {
  lang: Lang;
  isRTL: boolean;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/* ─── Full translations ─── */
const translations: Record<Lang, Record<string, string>> = {
  en: {
    /* ── Navbar ── */
    nav_home: "Home",
    nav_products: "Products",
    nav_collection: "Collection",
    nav_about: "About Us",
    nav_blog: "Blog",
    nav_contact: "Contact",
    nav_dashboard: "Dashboard",
    nav_cart: "View Cart",

    /* ── Announcement bar ── */
    ann_1: "✦ 10% OFF YOUR FIRST ORDER | USE CODE: LUXE10 ✦",
    ann_2: "✦ FREE SHIPPING ON ALL EGYPTIAN ORDERS ABOVE 1500 EGP ✦",
    ann_3: "✦ EXPERIENCE THE ART OF INVISIBLE BEAUTY ✦",

    /* ── Hero ── */
    hero_eyebrow: "Luxury Niche Perfumery · Est. 2016",
    hero_title_1: "The Art of",
    hero_title_2: "Invisible",
    hero_title_3: "Beauty",
    hero_subtitle:
      "Crafted from the world's rarest botanical essences. Each Maison Luxe fragrance is a 90-day macerated masterpiece — long-lasting, deeply complex, unforgettable.",
    hero_btn_primary: "Explore Collection ✦",
    hero_btn_secondary: "Our Story →",
    hero_stat_fragrances: "Fragrances",
    hero_stat_longevity: "Longevity",
    hero_stat_years: "Years Crafting",
    hero_longevity_label: "Longevity",
    hero_longevity_val: "12hr+",
    hero_collection_label: "Collection",
    hero_collection_val: "Niche",
    hero_scroll: "Scroll",

    /* ── Trust bar ── */
    trust_niche: "Niche Concentration",
    trust_niche_sub: "Extrait de Parfum grade",
    trust_longevity: "12+ Hours Longevity",
    trust_longevity_sub: "Guaranteed performance",
    trust_box: "Velvet Gift Box",
    trust_box_sub: "Luxury packaging included",
    trust_shipping: "Free Shipping",
    trust_shipping_sub: "On orders above 1500 EGP",
    trust_returns: "14-Day Returns",
    trust_returns_sub: "Hassle-free policy",

    /* ── Categories ── */
    cat_eyebrow: "✦ Olfactory Families",
    cat_title: "Shop by Collection",
    cat_desc: "From smoky Oud to luminous Citrus — four distinct olfactory worlds, each a masterpiece.",
    cat_explore: "Explore →",

    /* ── Featured Products ── */
    prod_eyebrow: "✦ Signature Creations",
    prod_title: "Bestsellers",
    prod_view_all: "View All Products →",
    prod_no_fragrances: "No fragrances yet",
    prod_no_fragrances_desc: "Visit the Dashboard to add your first premium perfume.",
    prod_go_dashboard: "Go to Dashboard",
    prod_added: "✓ Added!",
    prod_in_cart: "✓ In Cart",
    prod_add: "+ Cart",
    prod_details: "Details →",
    prod_luxury: "Luxury",

    /* ── Process ── */
    proc_eyebrow: "✦ Our Craft",
    proc_title: "From Seed to Bottle",
    proc_desc: "Every Maison Luxe fragrance undergoes a meticulous four-stage creation ritual that spans months, not days.",
    proc_step: "STEP",
    proc_read_story: "Read Our Full Story →",

    proc_step1_title: "Ethical Sourcing",
    proc_step1_desc: "We travel the world to hand-select raw botanicals at their precise peak potency — roses before dawn, oud at dusk.",
    proc_step2_title: "90-Day Maceration",
    proc_step2_desc: "Every blend ages in climate-controlled dark vaults for 90 days, allowing the molecules to bond and create deep complexity.",
    proc_step3_title: "Molecular Tuning",
    proc_step3_desc: "Master perfumers analyze each batch via chromatography, fine-tuning the balance of top, heart and base notes.",
    proc_step4_title: "Artisan Bottling",
    proc_step4_desc: "Each bottle is hand-filled, hand-sealed with 24K gold foil, and nestled in our signature velvet gift box.",

    /* ── Notes / Ingredients ── */
    notes_eyebrow: "✦ Rarest Ingredients",
    notes_title_1: "The World's Finest",
    notes_title_2: "Raw Materials",
    notes_desc: "We traverse continents to source only the most exceptional botanical essences. No synthetic shortcuts — only nature's finest, highly concentrated extractions.",
    notes_read_btn: "Read About Ingredients →",

    note1_name: "Indian Oud",
    note1_origin: "Assam, India",
    note1_desc: "Derived from infected Aquilaria heartwood. Deep, resinous, smoky.",
    note2_name: "Bulgarian Rose",
    note2_origin: "Rose Valley, Bulgaria",
    note2_desc: "Hand-picked at dawn. Rich, velvety, honeyed.",
    note3_name: "Madagascar Vanilla",
    note3_origin: "Toamasina, Madagascar",
    note3_desc: "Sun-dried pods. Sweet, cozy, subtly smoky.",
    note4_name: "Italian Bergamot",
    note4_origin: "Calabria, Italy",
    note4_desc: "Cold-pressed peel. Crisp, citrusy, uplifting.",
    note5_name: "Haitian Vetiver",
    note5_origin: "Haiti",
    note5_desc: "Earthy roots. Woody, smoky, deeply grounding.",
    note6_name: "Turkish Rose Absolute",
    note6_origin: "Isparta, Turkey",
    note6_desc: "Solvent-extracted. Intensely floral, warm, complex.",

    /* ── Brand Story ── */
    story_eyebrow: "✦ Our Heritage",
    story_title_1: "Crafted in Egypt,",
    story_title_2: "Inspired by the Stars",
    story_p1: "Established in Egypt, Maison Luxe was born from a desire to bridge royal Eastern heritage with modern French sophistication. A perfume is not simply a scent — it is an invisible statement of who you are.",
    story_p2: "Every ingredient undergoes high-performance chromatography to guarantee exceptional purity, achieving the projection and sillage that commands presence in any room.",
    story_btn_about: "Learn About Us",
    story_btn_blog: "Perfume Journal →",

    /* ── Testimonials ── */
    test_eyebrow: "✦ Olfactory Feedback",
    test_title: "What Our Clients Say",
    test_role: "Verified Buyer",
    test1_text: "Noir Oud is my signature scent. The longevity is unreal — 10+ hours and still going strong. I get compliments at every meeting.",
    test1_name: "Sherif M.",
    test1_product: "Noir Oud",
    test2_text: "Rose Musk is a masterpiece. Smells so fresh yet warm. The packaging is stunning — perfect for gifting. Already re-ordered!",
    test2_name: "Mariam A.",
    test2_product: "Rose Musk",
    test3_text: "I was skeptical about local perfumery, but Maison Luxe completely blew me away. The sillage rivals high-end French houses.",
    test3_name: "Tarek H.",
    test3_product: "Oriental Spice",

    /* ── VIP Banner ── */
    vip_eyebrow: "✦ VIP Concierge",
    vip_title: "Find Your Olfactory Identity",
    vip_desc: "Unsure which notes resonate with your chemistry? Book a private scent consultation with our master perfumers.",
    vip_btn: "Book Private Session →",

    /* ── Newsletter ── */
    news_eyebrow: "✦ Join the Circle",
    news_title: "Receive Olfactory Stories",
    news_desc: "Be the first to know about new collection releases, private sales, and master perfumer insights. No spam, ever.",
    news_placeholder: "Your email address",
    news_btn: "Subscribe",
    news_success: "✓ Welcome to the Maison Luxe Circle!",

    /* ── Footer ── */
    footer_desc: "Fine fragrances crafted for those who appreciate the extraordinary. Every bottle tells an olfactory story of passion, luxury, and invisible beauty.",
    footer_collection: "Collection",
    footer_company: "Company",
    footer_shopping: "Shopping",
    footer_support: "Support",
    footer_all_fragrances: "All Fragrances",
    footer_oud: "Oud & Woody",
    footer_floral: "Sweet & Floral",
    footer_citrus: "Fresh & Citrus",
    footer_oriental: "Oriental Spice",
    footer_story: "Our Story",
    footer_blog: "Perfume Blog",
    footer_contact: "Contact Us",
    footer_admin: "Admin Dashboard",
    footer_cart: "My Cart",
    footer_new: "New Arrivals",
    footer_gifts: "Gift Ideas",
    footer_vip: "VIP Consultation",
    footer_shipping_policy: "Shipping Policy",
    footer_returns: "Returns & Refunds",
    footer_guide: "Fragrance Guide",
    footer_faq: "FAQ",
    footer_copyright: "All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_cookies: "Cookie Policy",
    footer_made: "Crafted with ♥ for fragrance lovers · Egypt",

    /* ── Lang toggle ── */
    lang_btn: "عربي",
  },

  ar: {
    /* ── Navbar ── */
    nav_home: "الرئيسية",
    nav_products: "المنتجات",
    nav_collection: "الكولكشن",
    nav_about: "من نحن",
    nav_blog: "المدونة",
    nav_contact: "تواصل",
    nav_dashboard: "لوحة التحكم",
    nav_cart: "عرض السلة",

    /* ── Announcement bar ── */
    ann_1: "✦ خصم ١٠٪ على أول طلب | استخدم كود: LUXE10 ✦",
    ann_2: "✦ شحن مجاني لجميع الطلبات فوق ١٥٠٠ جنيه داخل مصر ✦",
    ann_3: "✦ اختبر فن الجمال الخفي ✦",

    /* ── Hero ── */
    hero_eyebrow: "عطور نيش فاخرة · منذ ٢٠١٦",
    hero_title_1: "فن",
    hero_title_2: "الجمال",
    hero_title_3: "الخفي",
    hero_subtitle:
      "مُصنَّع من أندر مستخلصات النباتات في العالم. كل عطر من ميزون لوكس هو تحفة مُنقَّعة لمدة ٩٠ يومًا — طويل الأمد، عميق التركيب، لا يُنسى.",
    hero_btn_primary: "استكشف الكولكشن ✦",
    hero_btn_secondary: "قصتنا ←",
    hero_stat_fragrances: "عطر",
    hero_stat_longevity: "ثبات العطر",
    hero_stat_years: "سنة صناعة",
    hero_longevity_label: "الثبات",
    hero_longevity_val: "+١٢ ساعة",
    hero_collection_label: "الكولكشن",
    hero_collection_val: "نيش",
    hero_scroll: "تمرير",

    /* ── Trust bar ── */
    trust_niche: "تركيز نيش",
    trust_niche_sub: "درجة Extrait de Parfum",
    trust_longevity: "+١٢ ساعة ثبات",
    trust_longevity_sub: "أداء مضمون",
    trust_box: "صندوق هدايا مخملي",
    trust_box_sub: "تغليف فاخر مشمول",
    trust_shipping: "شحن مجاني",
    trust_shipping_sub: "للطلبات فوق ١٥٠٠ جنيه",
    trust_returns: "إرجاع خلال ١٤ يوم",
    trust_returns_sub: "سياسة بدون تعقيد",

    /* ── Categories ── */
    cat_eyebrow: "✦ عائلات شمية",
    cat_title: "تسوق حسب الكولكشن",
    cat_desc: "من العود المُدخَّن إلى الحمضيات المضيئة — أربعة عوالم شمية مختلفة، كل واحدة تحفة فنية.",
    cat_explore: "استكشف ←",

    /* ── Featured Products ── */
    prod_eyebrow: "✦ إبداعات مميزة",
    prod_title: "الأكثر مبيعًا",
    prod_view_all: "عرض جميع المنتجات ←",
    prod_no_fragrances: "لا يوجد عطور بعد",
    prod_no_fragrances_desc: "زر لوحة التحكم لإضافة أول عطر فاخر.",
    prod_go_dashboard: "اذهب للوحة التحكم",
    prod_added: "✓ تمت الإضافة!",
    prod_in_cart: "✓ في السلة",
    prod_add: "+ سلة",
    prod_details: "التفاصيل ←",
    prod_luxury: "فاخر",

    /* ── Process ── */
    proc_eyebrow: "✦ حرفتنا",
    proc_title: "من البذرة إلى الزجاجة",
    proc_desc: "كل عطر من ميزون لوكس يمر بطقس إبداعي من أربع مراحل دقيقة تمتد لأشهر، وليس أياماً.",
    proc_step: "خطوة",
    proc_read_story: "اقرأ قصتنا كاملة ←",

    proc_step1_title: "استدامة في المصادر",
    proc_step1_desc: "نجوب العالم لاختيار النباتات الخام يدوياً في ذروة قوتها — الورود قبل الفجر، والعود عند الغروب.",
    proc_step2_title: "نقع لمدة ٩٠ يوماً",
    proc_step2_desc: "كل مزيج ينضج في خزائن مظلمة مُتحكَّم بمناخها لمدة ٩٠ يوماً، مما يسمح للجزيئات بالترابط وخلق عمق استثنائي.",
    proc_step3_title: "ضبط جزيئي",
    proc_step3_desc: "يحلل محترفو العطور كل دفعة بالكروماتوغرافيا، لضبط توازن النوتات الأولى والقلبية والقاعدية.",
    proc_step4_title: "تعبئة يدوية",
    proc_step4_desc: "كل زجاجة تُملأ يدوياً، وتُختم بورق ذهب عيار ٢٤ قيراط، وتُوضع في صندوق المخمل المميز.",

    /* ── Notes / Ingredients ── */
    notes_eyebrow: "✦ أندر المكونات",
    notes_title_1: "أجود المواد",
    notes_title_2: "الخام في العالم",
    notes_desc: "نعبر القارات للحصول على أفضل المستخلصات النباتية. لا مواد صناعية — فقط أجود ما في الطبيعة، بتركيزات عالية.",
    notes_read_btn: "اقرأ عن المكونات ←",

    note1_name: "عود هندي",
    note1_origin: "آسام، الهند",
    note1_desc: "مستخرج من خشب العود المصاب. عميق، رنيني، مدخن.",
    note2_name: "وردة بلغارية",
    note2_origin: "وادي الورود، بلغاريا",
    note2_desc: "تُقطف يدوياً عند الفجر. غنية، مخملية، ممزوجة بالعسل.",
    note3_name: "فانيليا مدغشقر",
    note3_origin: "توماسينا، مدغشقر",
    note3_desc: "قرون مجففة بالشمس. حلوة، دافئة، بلمسة دخانية خفية.",
    note4_name: "برغموت إيطالي",
    note4_origin: "كالابريا، إيطاليا",
    note4_desc: "مستخرج بالضغط البارد. منعش، حمضي، مبهج.",
    note5_name: "فيتيفر هايتي",
    note5_origin: "هايتي",
    note5_desc: "جذور ترابية. خشبية، مدخنة، رسوخ عميق.",
    note6_name: "عطر الورد التركي المطلق",
    note6_origin: "إسبارطة، تركيا",
    note6_desc: "مستخرج بالمذيبات. زهري مكثف، دافئ، معقد.",

    /* ── Brand Story ── */
    story_eyebrow: "✦ إرثنا",
    story_title_1: "صُنع في مصر،",
    story_title_2: "مستوحى من النجوم",
    story_p1: "تأسست ميزون لوكس في مصر من رغبة في الجمع بين التراث الشرقي الملكي والرقي الفرنسي الحديث. العطر ليس مجرد رائحة — إنه إعلان خفي عن هويتك.",
    story_p2: "كل مكون يخضع للكروماتوغرافيا عالية الأداء لضمان النقاء الاستثنائي، مما يحقق الانتشار والأثر الشمي الذي يفرض الحضور في أي مكان.",
    story_btn_about: "تعرف علينا",
    story_btn_blog: "مجلة العطور ←",

    /* ── Testimonials ── */
    test_eyebrow: "✦ ردود شمية",
    test_title: "ماذا يقول عملاؤنا",
    test_role: "مشترٍ موثق",
    test1_text: "نوار عود هو عطري المميز. الثبات لا يُصدَّق — أكثر من ١٠ ساعات ولا يزال قوياً. أتلقى مجاملات في كل اجتماع.",
    test1_name: "شريف م.",
    test1_product: "نوار عود",
    test2_text: "روز ماسك تحفة فنية. رائحة منعشة ودافئة في آن. التغليف رائع — مثالي للهدايا. طلبت مرة أخرى بالفعل!",
    test2_name: "مريم أ.",
    test2_product: "روز ماسك",
    test3_text: "كنت متشككاً في العطارة المحلية، لكن ميزون لوكس أذهلتني تماماً. انتشاره يضاهي أبرز دور العطور الفرنسية.",
    test3_name: "طارق ح.",
    test3_product: "أورينتال سبايس",

    /* ── VIP Banner ── */
    vip_eyebrow: "✦ كونسيرج VIP",
    vip_title: "اكتشف هويتك الشمية",
    vip_desc: "لست متأكداً من النوتات التي تتناسب مع كيمياء جسمك؟ احجز استشارة عطور خاصة مع محترفينا.",
    vip_btn: "احجز جلستك الخاصة ←",

    /* ── Newsletter ── */
    news_eyebrow: "✦ انضم إلى دائرتنا",
    news_title: "احصل على قصص شمية",
    news_desc: "كن أول من يعلم بإطلاق كولكشنات جديدة وعروض خاصة وأسرار محترفي العطور. بلا بريد عشوائي إطلاقاً.",
    news_placeholder: "عنوان بريدك الإلكتروني",
    news_btn: "اشترك",
    news_success: "✓ أهلاً بك في دائرة ميزون لوكس!",

    /* ── Footer ── */
    footer_desc: "عطور راقية صُنعت لمن يقدّر الاستثنائي. كل زجاجة تحكي قصة شمية من الشغف والفخامة والجمال الخفي.",
    footer_collection: "الكولكشن",
    footer_company: "الشركة",
    footer_shopping: "التسوق",
    footer_support: "الدعم",
    footer_all_fragrances: "جميع العطور",
    footer_oud: "عود وخشبي",
    footer_floral: "حلو وزهري",
    footer_citrus: "منعش وحمضي",
    footer_oriental: "أورينتال سبايس",
    footer_story: "قصتنا",
    footer_blog: "مدونة العطور",
    footer_contact: "تواصل معنا",
    footer_admin: "لوحة الإدارة",
    footer_cart: "سلتي",
    footer_new: "وصل حديثاً",
    footer_gifts: "أفكار هدايا",
    footer_vip: "استشارة VIP",
    footer_shipping_policy: "سياسة الشحن",
    footer_returns: "الإرجاع والاسترداد",
    footer_guide: "دليل العطور",
    footer_faq: "الأسئلة الشائعة",
    footer_copyright: "جميع الحقوق محفوظة.",
    footer_privacy: "سياسة الخصوصية",
    footer_terms: "شروط الخدمة",
    footer_cookies: "سياسة الكوكيز",
    footer_made: "صُنع بـ ♥ لعشاق العطور · مصر",

    /* ── Lang toggle ── */
    lang_btn: "English",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  /* Sync <html> attributes when language changes */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const t = useCallback(
    (key: string): string => translations[lang][key] ?? translations["en"][key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, isRTL: lang === "ar", toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

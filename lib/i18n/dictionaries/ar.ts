import type { Dictionary } from "./en";

// Arabic dictionary. Typed as `Dictionary` so TypeScript enforces that it stays
// in sync with the English source of truth.
const ar: Dictionary = {
  common: {
    brandName: "دار رِدا",
    language: "اللغة",
    switchLanguage: "التبديل إلى {language}",
    menu: "القائمة",
    close: "إغلاق",
    home: "الصفحة الرئيسية لدار رِدا",
    skipToContent: "انتقلي إلى المحتوى",
  },
  nav: {
    home: "الرئيسية",
    collection: "المجموعة",
    designYourAbaya: "صمّمي عبايتك",
    sizeGuide: "دليل المقاسات",
    search: "بحث",
    cart: "السلة",
  },
  home: {
    hero: {
      eyebrow: "تُفصَّل حسب الطلب، يدويًا",
      title: "أناقةٌ هادئة، تُفصَّلُ لأجلكِ",
      shopCollection: "تسوّقي المجموعة",
      designYourOwn: "صمّمي عبايتك",
    },
    paths: {
      collection: {
        title: "المجموعة",
        body: "تصاميمنا المميّزة، تُقصّ وتُخاط لكِ بعد طلبكِ.",
        cta: "اكتشفي المجموعة",
      },
      design: {
        title: "صمّمي عبايتك",
        body: "اختاري القَصّة والقماش والأكمام واللمسات الأخيرة — على مقاساتكِ أنتِ.",
        cta: "ابدئي التصميم",
      },
    },
    craft: {
      eyebrow: "الحِرفة",
      title: "لمساتٌ يدويّة، حتى آخر كريستالة",
      body: "تبدأ كل عباية من دار رِدا بعد طلبكِ. تُقصّ في مشغلنا من أقمشة اخترناها وجرّبناها، وتُثبَّت تفاصيلها يدويًا، وتُفحص قطعةً قطعة قبل أن تغادرنا.",
      cta: "قصّتنا",
    },
    howItWorks: {
      title: "كيف نعمل",
      steps: [
        { title: "اختاري أو صمّمي", body: "اختاري تصميمًا من المجموعة، أو صمّمي عبايتكِ بنفسكِ." },
        { title: "تُفصَّل لأجلكِ", body: "تُقصّ وتُخاط يدويًا على مقاسكِ أو قياساتكِ." },
        { title: "تُفحص بعناية", body: "نفحص كل درزة وكل تفصيل قبل الشحن." },
        { title: "توصيل لكل العالم", body: "شحن مُتتبَّع حتى باب بيتكِ، أينما كنتِ." },
      ],
    },
  },
  footer: {
    tagline: "عبايات تُفصَّل حسب الطلب، تُصنع يدويًا وتُشحن إلى العالم.",
    shop: "تسوّقي",
    help: "المساعدة",
    about: "دار رِدا",
    links: {
      collection: "المجموعة",
      designYourAbaya: "صمّمي عبايتك",
      sizeGuide: "دليل المقاسات",
      fabricLibrary: "مكتبة الأقمشة",
      shipping: "الشحن والتوصيل",
      returns: "الإرجاع والتعديلات",
      faq: "الأسئلة الشائعة",
      contact: "تواصلي معنا",
      story: "قصّتنا",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
    },
    rights: "جميع الحقوق محفوظة.",
  },
  placeholder: "الصورة قريبًا",
  errors: {
    notFound: {
      title: "لم نجد هذه الصفحة",
      body: "قد يكون الرابط غير صحيح، أو نُقلت الصفحة إلى مكان آخر. دعينا نأخذكِ إلى ما هو أجمل.",
      home: "العودة إلى الرئيسية",
      collection: "تسوّقي المجموعة",
    },
    generic: {
      title: "حدث خطأ ما",
      body: "تعذّر تحميل هذه الصفحة. يُرجى المحاولة مرة أخرى — وإن تكرّر الأمر، تواصلي معنا وسنساعدكِ.",
      retry: "حاولي مرة أخرى",
      home: "العودة إلى الرئيسية",
    },
  },
};

export default ar;

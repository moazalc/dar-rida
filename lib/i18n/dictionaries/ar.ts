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
      title: "أناقةٌ هادئة،\nتُفصَّلُ لأجلكِ.",
      shopCollection: "اكتشفي المجموعة",
      designYourOwn: "صمّمي عبايتكِ",
      film: "تفصيل عباية",
      filmMeta: "فيلم",
    },
    paths: {
      collection: {
        numeral: "١",
        title: "المجموعة",
        body: "تصاميمنا المميّزة. كلٌّ منها محفوظ كباترون، ويُقصّ لكِ حين تطلبينه.",
        cta: "استكشفي",
      },
      design: {
        numeral: "٢",
        title: "صمّمي عبايتكِ",
        body: "القَصّة، والقماش، والكُمّ، واللمسات الأخيرة — باختياركِ أنتِ.",
        cta: "ابدئي",
      },
    },
    detail: {
      eyebrow: "التفاصيل",
      title: "التفاصيل\nهي التصميم.",
      body: "درزةٌ لن تريها، وإغلاقٌ يختفي، وكريستالات تُثبَّت واحدةً تلو الأخرى حيث يلتقطها الضوء. نُبقي المظهر هادئًا، ونضع العناية حيث تشعرين بها.",
      specs: [
        { label: "القَصّة", value: "A-line ناعمة" },
        { label: "الأمام", value: "إغلاق مخفيّ" },
        { label: "الكُمّ", value: "كريستالات غرافيتية، يدويًا" },
      ],
      imageAlt: "خرز أسود وذهبي مخيط يدويًا على قماش داكن",
    },
    spotlight: {
      eyebrow: "الأولى في المجموعة",
      name: "رِدا 01",
      nameAlt: "Rida 01",
      nameAltLang: "en",
      body: "عباية سوداء لكلّ يوم، تتحرّك مع خطواتكِ. قَصّة A-line ناعمة، وإغلاق مخفيّ في الأمام، وكُمّ مائل تتجمّع عنده كريستالات غرافيتية ثم تتلاشى صعودًا.",
      price: "[Price]",
      view: "شاهدي رِدا 01",
      custom: "اجعليها لكِ",
      note: "تُقصّ وتُخاط بعد طلبكِ · تُشحن خلال [X] أسابيع",
      badge: "حسب الطلب",
      imageAlt: "رِدا 01 على مانيكان، لقطة قريبة للصدر المطرّز بالخرز",
    },
    howItWorks: {
      eyebrow: "من القماش إلى بابكِ",
      title: "كيف تُصنع",
      intro: "لا شيء ينتظر على الرفّ. طلبكِ يبدأ العمل، وتتابعينه حتى يصل إليكِ.",
      steps: [
        { numeral: "١", title: "الاختيار", body: "تصميم من المجموعة، أو قماشكِ ودانتيلكِ ولمساتكِ الأخيرة." },
        { numeral: "٢", title: "القَصّ", body: "يدويًا، على مقاسكِ أو قياساتكِ." },
        { numeral: "٣", title: "الخياطة", body: "تُخاط وتُضاف تفاصيلها قطعةً قطعة في مشغلنا." },
        { numeral: "٤", title: "الإرسال", body: "نفحصها درزةً درزة، ثم نشحنها إليكِ أينما كنتِ." },
      ],
    },
    invitation: {
      eyebrow: "صمّمي عبايتكِ",
      title: "عباية لا توجد",
      titleEmphasis: "إلا مرّة واحدة.",
      cta: "ابدئي التصميم",
    },
  },
  footer: {
    shop: "تسوّقي",
    help: "المساعدة",
    house: "الدار",
    newsletter: {
      title: "كوني أول من يعلم حين يبدأ فصلٌ جديد.",
      label: "البريد الإلكتروني",
      placeholder: "البريد الإلكتروني",
      submit: "انضمّي",
      soon: "التسجيل يُفتح قريبًا — شكرًا لاهتمامكِ.",
    },
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

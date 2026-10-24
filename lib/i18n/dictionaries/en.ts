// English dictionary. This file is the SOURCE OF TRUTH for translation keys:
// the `Dictionary` type is derived from it, so every other locale must provide
// exactly the same shape.

const en = {
  common: {
    brandName: "Dar Rida",
    language: "Language",
    switchLanguage: "Switch to {language}",
    menu: "Menu",
    close: "Close",
    home: "Dar Rida home",
    skipToContent: "Skip to content",
  },
  nav: {
    home: "Home",
    collection: "Collection",
    designYourAbaya: "Design Your Abaya",
    sizeGuide: "Size Guide",
    search: "Search",
    cart: "Cart",
  },
  home: {
    hero: {
      eyebrow: "Made to order, by hand",
      title: "Quiet elegance,\ntailored for you.",
      shopCollection: "Discover the collection",
      designYourOwn: "Design your own",
      film: "The making of an abaya",
      filmMeta: "Film",
    },
    paths: {
      collection: {
        numeral: "I.",
        title: "The Collection",
        body: "Our signature designs. Each one waits as a pattern, and is cut for you once you order.",
        cta: "Explore",
      },
      design: {
        numeral: "II.",
        title: "Design Your Own",
        body: "The cut, the cloth, the sleeve, the finishing — chosen by you.",
        cta: "Begin",
      },
    },
    detail: {
      eyebrow: "The detail",
      title: "The detail\nis the design.",
      body: "A seam you will never see, a closure that disappears, crystals set one by one where the light finds them. We keep the outside quiet and put the care where you will feel it.",
      specs: [
        { label: "Silhouette", value: "Soft A-line" },
        { label: "Front", value: "Concealed closure" },
        { label: "Cuff", value: "Graphite crystals, by hand" },
      ],
      imageAlt: "Black and gold beads sewn by hand onto dark fabric",
    },
    spotlight: {
      eyebrow: "First in the collection",
      name: "Rida 01",
      nameAlt: "رِدا 01",
      nameAltLang: "ar",
      body: "A black everyday abaya that moves when you walk. Soft A-line, a hidden front, and a slanted cuff where graphite crystals gather and fade upward.",
      price: "[Price]",
      view: "View Rida 01",
      custom: "Make it yours",
      note: "Cut and sewn after you order · Ships in [X] weeks",
      badge: "Made to order",
      imageAlt: "Rida 01 on a dress form, close on the beaded yoke",
    },
    howItWorks: {
      eyebrow: "From fabric to your door",
      title: "How it is made",
      intro: "Nothing is waiting on a shelf. Your order starts the work, and you follow it until it reaches you.",
      steps: [
        { numeral: "i.", title: "Chosen", body: "A design from the collection, or your own fabric, lace and finishing." },
        { numeral: "ii.", title: "Cut", body: "By hand, to your size or your measurements." },
        { numeral: "iii.", title: "Sewn", body: "Stitched and detailed, piece by piece, in our workshop." },
        { numeral: "iv.", title: "Sent", body: "Checked seam by seam, then shipped to you, wherever you are." },
      ],
    },
    invitation: {
      eyebrow: "Design your abaya",
      title: "An abaya that exists",
      titleEmphasis: "only once.",
      cta: "Start designing",
    },
  },
  footer: {
    shop: "Shop",
    help: "Help",
    house: "The House",
    newsletter: {
      title: "Hear when a new chapter begins.",
      label: "Email address",
      placeholder: "Email address",
      submit: "Join",
      soon: "Sign-ups open soon — thank you for your interest.",
    },
    links: {
      collection: "Collection",
      designYourAbaya: "Design Your Abaya",
      sizeGuide: "Size Guide",
      fabricLibrary: "Fabric Library",
      shipping: "Shipping & Delivery",
      returns: "Returns & Alterations",
      faq: "FAQ",
      contact: "Contact",
      story: "Our Story",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
    },
  },
  placeholder: "Photo coming soon",
  errors: {
    notFound: {
      title: "This page could not be found",
      body: "The link may be broken, or the page may have moved. Let us take you somewhere beautiful instead.",
      home: "Back to home",
      collection: "Shop the Collection",
    },
    generic: {
      title: "Something went wrong",
      body: "We could not load this page. Please try again — if it keeps happening, get in touch and we will help.",
      retry: "Try again",
      home: "Back to home",
    },
  },
};

export default en;

/** Shape every locale must satisfy. */
export type Dictionary = typeof en;

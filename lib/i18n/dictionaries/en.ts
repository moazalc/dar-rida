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
      title: "Quiet elegance, tailored for you",
      shopCollection: "Shop the Collection",
      designYourOwn: "Design Your Abaya",
    },
    paths: {
      collection: {
        title: "The Collection",
        body: "Our signature designs, each cut and sewn for you once you order.",
        cta: "Explore the collection",
      },
      design: {
        title: "Design Your Own",
        body: "Choose the cut, fabric, sleeves and finishing — made to your measurements.",
        cta: "Start designing",
      },
    },
    craft: {
      eyebrow: "The craft",
      title: "Finished by hand, down to the last crystal",
      body: "Every Dar Rida abaya begins after you order. Our workshop cuts it from fabric we have chosen and tested, sets each detail by hand, and checks it piece by piece before it leaves us.",
      cta: "Our story",
    },
    howItWorks: {
      title: "How it works",
      steps: [
        { title: "Choose or design", body: "Pick a design from the collection, or build your own." },
        { title: "Made for you", body: "Cut and sewn by hand to your size or measurements." },
        { title: "Checked with care", body: "Every seam and detail is inspected before shipping." },
        { title: "Delivered worldwide", body: "Tracked shipping to your door, wherever you are." },
      ],
    },
  },
  footer: {
    tagline: "Made-to-order abayas, crafted by hand and shipped worldwide.",
    shop: "Shop",
    help: "Help",
    about: "Dar Rida",
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
    rights: "All rights reserved.",
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

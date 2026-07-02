// Canonical identity + cross-platform profiles for the schema.org Person JSON-LD
// built in ../pages/index.astro. Single source of truth for "who Terje is on the web".

export const SITE_URL = 'https://terjeofnorway.no/';

// Stable identifier so the Person is one linkable entity.
export const PERSON_ID = `${SITE_URL}#person`;

// Absolute URL to the photo already used by HeroSection (public/profile.jpg).
export const PROFILE_IMAGE = `${SITE_URL}profile.jpg`;

// Employer, now with a URL for a stronger Organization node.
export const EMPLOYER = { name: 'Systek', url: 'https://systek.no' } as const;

// "Same person elsewhere" — schema.org Person.sameAs. Each URL is treated by
// search engines as an authoritative "this is the same entity" signal, so only
// list canonical profile URLs you control.
export const SAME_AS: readonly string[] = [
  'https://github.com/terjeofnorway',
  'https://www.linkedin.com/in/terjeofnorway/',
  'https://medium.com/@terjeofnorway',
];

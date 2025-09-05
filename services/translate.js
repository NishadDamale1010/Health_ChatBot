async function toEnglish(text, lang) {
  if (lang === 'en') return text;
  return `[Translated to EN] ${text}`;
}

async function toLang(text, lang) {
  if (lang === 'en') return text;
  return `[Translated to ${lang}] ${text}`;
}

module.exports = { toEnglish, toLang };

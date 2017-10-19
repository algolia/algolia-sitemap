const jsxString = require('jsx-string');
const isURL = require('validator/lib/isURL');
const isISO8601 = require('validator/lib/isISO8601');

const xmlStringify = content =>
  `<?xml version="1.0" encoding="utf-8"?>${jsxString(content)}`;

function createSitemapindex(sitemaps = []) {
  const sitemap = ({ loc, lastmod }) => (
    <sitemap>
      <loc>{loc}</loc>
      {lastmod && <lastmod>{lastmod}</lastmod>}
    </sitemap>
  );

  const index = (
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {sitemaps.map(sitemap)}
    </sitemapindex>
  );

  return {
    stringify: () => xmlStringify(index),
  };
}

const isValidURL = ({ loc, lastmod, changefreq, priority, alternates }) => {
  // loc
  // eslint-disable-next-line camelcase
  if (!loc && !isURL(loc, { require_valid_protocol: true })) {
    throw new Error(
      `loc "${loc}" was not valid. It's required.

see https://www.sitemaps.org/protocol.html`
    );
  }

  // lastmod
  if (lastmod !== undefined && !isISO8601(lastmod)) {
    throw new Error(
      `lastmod "${lastmod}" is not valid. It should be a valid ISO 8601 date

Try using new Date().toISOString()

see https://www.sitemaps.org/protocol.html
see https://www.w3.org/TR/NOTE-datetime`
    );
  }

  // changefreq
  const allowedFreqs = [
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
  ];

  if (!allowedFreqs.includes(changefreq) && changefreq !== undefined) {
    throw new Error(
      `changefreq "${changefreq}" was not a valid value.

expected: ${allowedFreqs.join(', ')}

see https://www.sitemaps.org/protocol.html for more information`
    );
  }

  // priority
  if (
    priority < 0 ||
    priority > 1 ||
    (!Number.isFinite(priority) && priority !== undefined)
  ) {
    throw new Error(
      `priority "${priority}" was not valid. A number between 0 and 1 is expected.

see https://www.sitemaps.org/protocol.html for more information`
    );
  }

  // alternates
  const _alternatesError = `alternates ${JSON.stringify(
    alternates
  )} was not valid. An object with

{
  languages: ['nl-BE', 'fr', 'pt-BR'],
  hitToURL: (language) => \`the url for that \${language}\`,
}

was expected.`;

  if (alternates !== undefined) {
    if (!(alternates.languages instanceof Array)) {
      throw new Error(_alternatesError);
    }
    if (typeof alternates.hitToURL !== 'function') {
      throw new Error(_alternatesError);
    }
    alternates.languages.forEach(lang => {
      if (!isURL(alternates.hitToURL(lang))) {
        throw new Error(_alternatesError);
      }
    });
  }

  return {
    loc,
    lastmod,
    changefreq,
    priority: priority === undefined ? undefined : priority.toFixed(1),
    alternates,
  };
};

function createSitemap(entries = []) {
  const _alternates = ({ languages, hitToURL }) =>
    languages
      .map(language => ({ language, href: hitToURL(language) }))
      .map(({ language, href }) => (
        <xhtml_link rel="alternate" hreflang={language} href={href} />
      ));

  const url = args => {
    const {
      loc = undefined,
      lastmod = undefined,
      changefreq = undefined,
      priority = undefined,
      alternates = undefined,
    } = isValidURL(args);
    return (
      <url
        xmlns_xhtml={alternates ? 'http://www.w3.org/1999/xhtml' : undefined}
      >
        <loc>{loc}</loc>
        {lastmod && <lastmod>{lastmod}</lastmod>}
        {changefreq && <changefreq>{changefreq}</changefreq>}
        {priority && <priority>{priority}</priority>}
        {alternates && _alternates(alternates)}
      </url>
    );
  };

  const sitemap = (
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {entries.map(url)}
    </urlset>
  );

  return {
    stringify: () => xmlStringify(sitemap),
  };
}

module.exports = {
  createSitemapindex,
  createSitemap,
};

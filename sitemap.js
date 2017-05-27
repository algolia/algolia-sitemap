const jsxString = require('jsx-string');

const XML = content =>
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
    stringify: () => XML(index),
  };
}

const notNull = item => item !== null && item !== undefined;

function createSitemap(entries = []) {
  const _alternates = ({ languages, hitToURL }) =>
    languages
      .map(language => ({ language, href: hitToURL(language) }))
      .map(({ language, href }) => (
        <xhtml_link rel="alternate" hreflang={language} href={href} />
      ));

  const url = ({ loc, lastmod, changefreq, priority, alternates }) => (
    <url xmlns_xhtml={alternates ? 'http://www.w3.org/1999/xhtml' : undefined}>
      <loc>{loc}</loc>
      {lastmod && <lastmod>{lastmod}</lastmod>}
      {changefreq && <changefreq>{changefreq}</changefreq>}
      {notNull(priority) ? <priority>{priority}</priority> : null}
      {alternates && _alternates(alternates)}
    </url>
  );

  const sitemap = (
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {entries.map(url)}
    </urlset>
  );

  return {
    stringify: () => XML(sitemap),
  };
}

module.exports = {
  createSitemapindex,
  createSitemap,
};

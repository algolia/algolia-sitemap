const builder = require('xmlbuilder');

function createSitemapindex() {
  const index = builder
    .create('sitemapindex', { encoding: 'utf-8' })
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  return {
    stringify: opts => index.end(opts),
    addSitemap: ({ loc, lastmod }) => {
      const sitemap = index.ele('sitemap');
      if (loc) sitemap.ele('loc', loc);
      if (lastmod) sitemap.ele('lastmod', lastmod);
      return index;
    }
  };
}

function createSitemap(entries) {
  const sitemap = builder
    .create('urlset', { encoding: 'utf-8' })
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  const addURL = ({ loc, lastmod, changefreq, priority, alternates }) => {
    const url = sitemap.ele('url');
    if (loc != null) {
      url.ele('loc', loc);
    }
    if (lastmod != null) {
      url.ele('lastmod', lastmod);
    }
    if (changefreq != null) {
      url.ele('changefreq', changefreq);
    }
    if (priority != null) {
      url.ele('priority', priority);
    }
    if (alternates != null) {
      const { languages, hitToURL } = alternates;
      sitemap.att('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

      languages.forEach(language => url.ele('xhtml:link', {
        rel: 'alternate',
        hreflang: language,
        href: hitToURL(language)
      }));
    }
    return sitemap;
  };

  entries.forEach(addURL);

  return {
    stringify: opts => sitemap.end(opts)
  };
}

module.exports = {
  createSitemapindex,
  createSitemap
};

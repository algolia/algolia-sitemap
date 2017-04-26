const algoliasearch = require('algoliasearch');
const { createSitemapindex, createSitemap } = require('./sitemap');
const { saveSiteMap } = require('./saveFiles');

function init({ algoliaConfig, sitemapLocation, hitToParams }) {
  const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
  const index = client.initIndex(algoliaConfig.indexName);
  const browser = index.browseAll();

  const sitemapIndex = createSitemapindex();

  let iterator = 0;

  browser.on('result', function onResult({ hits }) {
    const sitemap = createSitemap({ hits, hitToParams });

    saveSiteMap({ sitemap, index: iterator, root: sitemapLocation.path });
    sitemapIndex.addSitemap({
      loc: `${sitemapLocation.href}/sitemap.${iterator}.xml`,
      lastmod: new Date().toISOString(),
    });
    iterator++;
  });

  browser.on('end', function onEnd() {
    saveSiteMap({ sitemap: sitemapIndex, filename: 'sitemap-index' });
  });

  browser.on('error', function onError(err) {
    throw err;
  });
}

module.exports = init;

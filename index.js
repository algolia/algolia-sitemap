const algoliasearch = require('algoliasearch');
const { createSitemapindex, createSitemap } = require('./sitemap');
const { saveSiteMap } = require('./saveFiles');

const CHUNK_SIZE = 50000;

let batch = [];

function init({ algoliaConfig, sitemapLocation, hitToParams }) {
  const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
  const index = client.initIndex(algoliaConfig.indexName);
  const sitemaps = [];

  const handleSitemap = async entries =>
    sitemaps.push({
      loc: `${sitemapLocation.href}/${await saveSiteMap({
        sitemap: createSitemap(entries),
        index: sitemaps.length,
        root: sitemapLocation.path,
      })}`,
      lastmod: new Date().toISOString(),
    });

  const flush = async () => {
    const chunks = [];
    let chunk = [];
    batch.forEach(entry => {
      if (chunk.length < CHUNK_SIZE) {
        chunk.push(entry);
      }
      if (chunk.length === CHUNK_SIZE) {
        chunks.push(chunk);
        chunk = [];
      }
    });
    await Promise.all(chunks.map(handleSitemap));
    batch = chunk;
  };

  const aggregator = async ({ hits, cursor }) => {
    do {
      if (!hits) {
        return;
      }
      batch = batch.concat(
        hits.reduce((entries, hit) => {
          const entry = hitToParams(hit);
          return entry ? entries.concat(entry) : entries;
        }, [])
      );
      if (batch.length > CHUNK_SIZE) {
        await flush();
      }
      ({ hits, cursor } = await index.browseFrom(cursor));
    } while (cursor);
    await handleSitemap(batch);
    const sitemapIndex = createSitemapindex(sitemaps);
    saveSiteMap({ sitemap: sitemapIndex, filename: 'sitemap-index' });
  };

  return index.browse().then(aggregator);
}

module.exports = init;

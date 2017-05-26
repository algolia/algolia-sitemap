const algoliasearch = require('algoliasearch');
const { createSitemapindex, createSitemap } = require('./sitemap');
const { saveSiteMap } = require('./saveFiles');

const CHUNK_SIZE = 50000;

let batch = [];

function init({ algoliaConfig, sitemapLocation, hitToParams }) {
  const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
  const index = client.initIndex(algoliaConfig.indexName);
  const sitemaps = [];

  const handleSitemap = entries => {
    const iterator = sitemaps.length;
    const sitemap = createSitemap(entries);
    saveSiteMap({ sitemap, index: iterator, root: sitemapLocation.path });
    sitemaps.push({
      loc: `${sitemapLocation.href}/sitemap.${iterator}.xml`,
      lastmod: new Date().toISOString(),
    });
  };

  const flush = () => {
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
    chunks.forEach(handleSitemap);
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
        flush();
      }
      ({ hits, cursor } = await index.browseFrom(cursor));
    } while (cursor);
    handleSitemap(batch);
    const sitemapIndex = createSitemapindex(sitemaps);
    saveSiteMap({ sitemap: sitemapIndex, filename: 'sitemap-index' });
  };

  return index.browse().then(aggregator);
}

module.exports = init;

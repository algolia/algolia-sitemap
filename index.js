const algoliasearch = require('algoliasearch');
const { createSitemapindex, createSitemap } = require('./sitemap');
const { saveSiteMap } = require('./saveFiles');

const CHUNK_LENGTH = 50000;

let batch = [];
let iterator = 0;

function init({ algoliaConfig, sitemapLocation, hitToParams }) {
  const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
  const index = client.initIndex(algoliaConfig.indexName);
  const sitemapIndex = createSitemapindex();

  const handleSitemap = entries => {
    const sitemap = createSitemap(entries);
    saveSiteMap({ sitemap, index: iterator, root: sitemapLocation.path });
    sitemapIndex.addSitemap({
      loc: `${sitemapLocation.href}/sitemap.${iterator}.xml`,
      lastmod: new Date().toISOString()
    });
    iterator++;
  };

  const flush = () => {
    const chunks = [];
    let chunk = [];
    batch.forEach(entry => {
      if (chunk.length < CHUNK_LENGTH) {
        chunk.push(entry);
      }
      if (chunk.length === CHUNK_LENGTH) {
        chunks.push(chunk);
        chunk = [];
      }
    });
    chunks.forEach(handleSitemap);
    batch = chunk;
  };

  const aggregator = ({ hits, cursor }) => {
    if (!hits) {
      return;
    }
    const entries = hits.map(hitToParams).filter(Boolean);
    batch = batch.concat(entries);
    if (batch.length > CHUNK_LENGTH) {
      flush();
    }
    if (cursor) {
      index.browseFrom(cursor).then(aggregator);
    } else {
      handleSitemap(batch);
      saveSiteMap({ sitemap: sitemapIndex, filename: 'sitemap-index' });
    }
  };

  index.browse().then(aggregator);
}

module.exports = init;

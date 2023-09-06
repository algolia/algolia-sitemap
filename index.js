const algoliasearch = require('algoliasearch');
const { createSitemapindex, createSitemap } = require('./sitemap');
const { saveSiteMap } = require('./saveFiles');

const CHUNK_SIZE = 50000;

function init({
  algoliaConfig,
  params,
  sitemapLoc,
  outputFolder,
  hitToParams,
}) {
  if (!algoliaConfig) {
    throw new Error('Missing algoliaConfig');
  }
  if (
    !algoliaConfig.appId ||
    !algoliaConfig.apiKey ||
    !algoliaConfig.indexName
  ) {
    throw new Error('Missing credentials in algoliaConfig');
  }
  if (!sitemapLoc) {
    throw new Error(
      'Missing sitemapLoc (e.g. https://www.example.org/sitemaps)'
    );
  }
  if (typeof hitToParams !== 'function') {
    throw new Error('Missing hitToParams function');
  }

  let batch = [];
  const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
  const index = client.initIndex(algoliaConfig.indexName);
  const sitemaps = [];

  const handleSitemap = async entries =>
    sitemaps.push({
      loc: `${sitemapLoc}/${await saveSiteMap({
        sitemap: createSitemap(entries),
        index: sitemaps.length,
        root: outputFolder,
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

  const aggregator = async args => {
    let { hits, cursor } = args;
    batch = batch.concat(
      hits.reduce((entries, hit) => {
        const entry = hitToParams(hit);
        return entry ? entries.concat(entry) : entries;
      }, [])
    );
    while (cursor) {
      ({ hits, cursor } = await index.browseFrom(cursor));
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
    }
    await handleSitemap(batch);
    const sitemapIndex = createSitemapindex(sitemaps);
    await saveSiteMap({
      sitemap: sitemapIndex,
      root: outputFolder,
      filename: 'sitemap-index',
    });
  };

  return index.browse(params).then(aggregator);
}

module.exports = init;

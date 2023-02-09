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

  const aggregator = (() => {
    var _ref3 = _asyncToGenerator2(function* (args) {
      let hits = args.hits,
          cursor = args.cursor;

      let run = true;
      do {
        run = !!cursor;
        if (!hits) {
          return;
        }
        batch = batch.concat(hits.reduce(function (entries, hit) {
          const entry = hitToParams(hit);
          return entry ? entries.concat(entry) : entries;
        }, []));
        if (batch.length > CHUNK_SIZE) {
          yield flush();
        }

        var _ref4 = yield index.browseFrom(cursor);

        hits = _ref4.hits;
        cursor = _ref4.cursor;
      } while (run);
      yield handleSitemap(batch);
      const sitemapIndex = createSitemapindex(sitemaps);
      yield saveSiteMap({
        sitemap: sitemapIndex,
        root: outputFolder,
        filename: 'sitemap-index'
      });
    });

    return function aggregator(_x2) {
      return _ref3.apply(this, arguments);
    };
  })();

  return index.browse(params).then(aggregator);
}

module.exports = init;

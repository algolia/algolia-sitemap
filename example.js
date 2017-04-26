// import the dependency
const algoliaSitemap = require('algolia-sitemap');

// set up your API keys
// make sure the key has "browse" capability

/**
 * @type {algoliaConfig}
 */
const algoliaConfig = {
  appId: 'XXXXX',
  apiKey: '7xxxxx',
  indexName: 'xxxxxx',
};

/**
 * @typedef {Object} Params
 * @property {string} loc the link of this hit
 * @property {string} [lastmod] the last time this link was modified (ISO8601)
 * @property {number} [priority] the priority you give to this link (between 0 and 1)
 * @property {Object} [alternates] alternative versions of this link (useful for multi-language)
 * @property {Array} [alternates.languages] list of languages that are enabled
 * @property {function} [alternates.hitToURL] function to transform a language into a url of this object
 */

/**
 * Function to transform a hit into its link
 * 
 * @param {Object} hit a hit to transform
 * @returns {Params} the parameters for this hit
 */
function hitToParams(hit) {
  const url = ({ lang, objectID }) =>
    `https://${lang}.yoursite.com/${lang}/package/${objectID}`;
  const loc = url({ lang: 'en', objectID: hit.objectID });
  const lastmod = new Date().toISOString();
  const priority = Math.random();
  return {
    loc,
    lastmod,
    priority,
    alternates: {
      languages: ['fr', 'pt-BR', 'zh-Hans'],
      hitToURL: lang => url({ lang, objectID: hit.objectID }),
    },
  };
}

/**
 * @param {algoliaConfig} algoliaConfig configuration for Algolia
 * @param {Object} sitemapLocation an object with the href where your sitemaps will be and the relative path where to generate them
 * @param {function} hitToParams function to transform a hit into Params
 */
algoliaSitemap({
  algoliaConfig,
  sitemapLocation: { href: 'https://yoursite.com/sitemaps', path: 'sitemaps' },
  hitToParams,
});

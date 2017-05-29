const algoliaSitemap = require('../../build');

/**
 * @type {algoliaConfig}
 */
const algoliaConfig = {
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  indexName: 'NAME',
};

const alreadyAdded = {};

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
 * @returns {Params|Array.<Params>} the parameters for this hit
 */
function hitToParams({ category }) {
  if (!category || !category.length || category.some(c => alreadyAdded[c])) {
    return false;
  }
  category.forEach(c => (alreadyAdded[c] = c));
  return category.map(c => ({
    loc: `https://yoursite.com/category/${c}`,
  }));
}

/**
 * @param {algoliaConfig} algoliaConfig configuration for Algolia
 * @param {Object} sitemapLocation an object with the href where your sitemaps will be and the relative path where to generate them
 * @param {function} hitToParams function to transform a hit into Params
 */
algoliaSitemap({
  algoliaConfig,
  sitemapLocation: {
    href: 'https://yoursite.com/sitemaps',
    path: 'sitemaps',
  },
  hitToParams,
})
  .then(() => {
    console.log('Done generating sitemaps'); // eslint-disable-line no-console
  })
  .catch(console.error); // eslint-disable-line no-console

# Algolia sitemap generator

This is a node library allowing you to generate sitemaps from an Algolia index. 

Requires node v6+ (make an issue if this is a problem for you)

## How to use

```js
// import the dependency
const algoliaSitemap = require('algolia-sitemap');

algoliaSitemap({
  algoliaConfig,
  sitemapLocation: { href: 'https://yoursite.com/sitemaps', path: 'sitemaps' },
  hitToParams,
});
```

Where `algoliaConfig` is setup for your index. Make sure that the API key you use has the "browse" capability

```js
// set up your API keys
// make sure the key has "browse" capability
const algoliaConfig = {
  appId: 'XXXXX',
  apiKey: '7xxxxx',
  indexName: 'xxxxxx',
};
```

And hitToParams is a function that transforms a hit into a parameters object 

```js
function hitToParams({ objectID, modified, downloadsRatio })  {
  const url = ({ lang, objectID }) =>
  `https://${lang}.yoursite.com/${lang}/package/${objectID}`;
  const loc = url({ lang: 'en', objectID });
  const lastmod = new Date().toISOString();
  const priority = Math.random();
  return {
    loc,
    lastmod,
    priority,
    alternates: {
      languages: ['fr', 'pt-BR', 'zh-Hans'],
      hitToURL: lang => url({ lang, objectID }),
    },
  };
};
```

These parameters mean: 

```js
/**
 * @typedef {Object} Params
 * @property {string} loc the link of this hit
 * @property {string} [lastmod] the last time this link was modified (ISO8601)
 * @property {number} [priority] the priority you give to this link (between 0 and 1)
 * @property {Object} [alternates] alternative versions of this link (useful for multi-language)
 * @property {Array} [alternates.languages] list of languages that are enabled
 * @property {function} [alternates.hitToURL] function to transform a language into a url of this object
 */
```

You can also take a look at `example.js` for how this looks.

# License 

MIT

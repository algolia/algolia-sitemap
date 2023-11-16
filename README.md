# Algolia sitemap generator

This is a node library allowing you to generate sitemaps from an Algolia index.

> Requires node v6+ (make an issue if this is a problem for you).

It will create sitemaps, and a sitemap index in a folder of your choosing (for example `/sitemaps`). Then you can upload `/sitemaps/sitemap-index.xml` to Google for good indexing of your pages!

## How does it work?

1. [Browse](https://www.algolia.com/doc/api-client/javascript/advanced/#backup--export-an-index) over all entries in an Algolia index
2. Per [50 000](https://support.google.com/webmasters/answer/183668?hl=en) links, a sitemap.n.xml is generated in the chosen folder (where n is the index)
3. Once all Algolia data has been browsed over, a final sitemap-index.xml is being generated
4. Let search engines know about sitemap-index.xml either by [letting them know](https://support.google.com/webmasters/answer/183668?hl=en#addsitemap) or putting it in [robots.txt](https://support.google.com/webmasters/answer/183668?hl=en#addsitemap)

This process is a script that should be ran periodically to keep the sitemaps up to date, no "watch" feature has been put in place (yet?)

## How to use

First install the module from `npm` (or with `yarn`):

```sh
$ npm install algolia-sitemap --save[-dev]
$ yarn add algolia-sitemap [--dev]
```

```js
// import the dependency
const algoliaSitemap = require('algolia-sitemap');

algoliaSitemap({
  algoliaConfig,
  sitemapLoc: 'https://yoursite.com/sitemaps',
  outputFolder: 'sitemaps',
  hitToParams,
});
```

Where `algoliaConfig` holds the setup for your index. Make sure that the API key you use has the "browse" capability

```js
// set up your API keys
const algoliaConfig = {
  appId: 'XXXXX',
  apiKey: 'xxxxxx', // make sure the key has "browse" capability
  indexName: 'xxxxxx',
};
```

And hitToParams is a function that transforms a hit into a parameters object. This function can return an object of type `Param`, an array of `Param`s or false.

```js
function hitToParams({ objectID, modified, downloadsRatio }) {
  const url = ({ lang, objectID }) =>
    `https://${lang}.yoursite.com/${lang}/detail/${objectID}`;
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
}
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
 * @property {Array} [images] list of images links related to the hit
* @property {Array} [videos] list of videos links related to the hit
 * @property {function} [alternates.hitToURL] function to transform a language into a url of this object
 */
```

### Image Sitemaps

If you want your sitemap to include [Google image extensions](https://support.google.com/webmasters/answer/178636?hl=en), return an array for each hit containing objects with the following keys:

```js
/**
 * @typedef {Object} Image
 * @property {string} loc the link of this image
 * @property {string} [title] image title
 * @property {string} [caption] image caption
 * @property {string} [geo_location] geographic location (e.g. 'Limerick, Ireland')
 * @property {string} [license] the link to the image's license
 */
```

For example:

```js
function hitToParams({
  objectID,
  modified,
  downloadsRatio,
  profilePic,
  coverPhoto,
  name,
}) {
  const url = ({ lang, objectID }) =>
    `https://${lang}.yoursite.com/${lang}/detail/${objectID}`;
  const loc = url({ lang: 'en', objectID });
  const lastmod = new Date().toISOString();
  const priority = Math.random();
  return {
    loc,
    lastmod,
    priority,
    images: [
      {
        loc: `https://media.yoursite.com/images/${profilePic}`,
        title: name,
      },
      {
        loc: `https://media.yoursite.com/images/${coverPhoto}`,
        title: name,
      },
    ],
    alternates: {
      languages: ['fr', 'pt-BR', 'zh-Hans'],
      hitToURL: lang => url({ lang, objectID }),
    },
  };
}
```

For more information, see https://support.google.com/webmasters/answer/178636?hl=en

### Video Sitemaps

If you want your sitemap to include [Google video extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps), return an array for each hit containing objects with the following keys:

```js
/**
 * @typedef {Object} Video
 * @property {string} [title] Video title
 * @property {string} [description] Video description
 * @property {string} [thumbnail_loc] location of video thumbnail image
 * @property {string} [content_loc] location of video file
 * @property {string} [player_loc] location of video player
 */
```

For example:

```js
function hitToParams({
  objectID,
  modified,
  downloadsRatio,
  videoFile,
  videoThumbnail,
  videoDescription
  name,
}) {
  const url = ({ lang, objectID }) =>
    `https://${lang}.yoursite.com/${lang}/detail/${objectID}`;
  const loc = url({ lang: 'en', objectID });
  const lastmod = new Date().toISOString();
  const priority = Math.random();
  return {
    loc,
    lastmod,
    priority,
    videos: [
      {
        title: name,
        description: videoDescription,
        thumbnail_loc: videoThumbnail,
        content_loc: videoFile
      },
    ],
    alternates: {
      languages: ['fr', 'pt-BR', 'zh-Hans'],
      hitToURL: lang => url({ lang, objectID }),
    },
  };
}
```

For more information, see https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps

## Custom queries

You can pass a `params` parameter to `algoliaSitemap`. This allows you to narrow down the returned results. For instance, in order to have `hitToParams` called for every products in the `phone` category, we could do:

```js
algoliaSitemap({
  algoliaConfig,
  sitemapLoc: 'https://yoursite.com/sitemaps',
  outputFolder: 'sitemaps',
  params: {
    filters: 'category: phone',
  },
  hitToParams,
});
```

Note that a query can also be passed to `params`.

## Examples

You can also take a look at `examples` folder for how it works.

* To generate a sitemap of all the hits in an index, check the [detail pages example](examples/details)
* To generate a sitemap of all the category pages, check the [category pages example](examples/category)

# License

MIT

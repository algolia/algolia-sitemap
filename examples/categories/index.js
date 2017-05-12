const algoliaSitemap = require("../../");

const algoliaConfig = {
  appId: "APP_ID",
  apiKey: "API_KEY",
  indexName: "NAME"
};

const alreadyAdded = {};
function hitToParams({ objectID, category }) {
  if (!category || !category.length || category.some(c => alreadyAdded[c])) {
    return false;
  }
  category.forEach(c => (alreadyAdded[c] = c));
  return category.map(c => ({
    loc: `https://yoursite.com/category/${c}`
  }));
}

algoliaSitemap({
  algoliaConfig,
  sitemapLocation: {
    href: "https://yoursite.com/sitemaps",
    path: "sitemaps"
  },
  hitToParams
});

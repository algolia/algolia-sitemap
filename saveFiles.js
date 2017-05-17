const fs = require('fs');
const path = require('path');

function saveSiteMap({
  sitemap,
  root = 'sitemaps',
  filename = 'sitemap',
  index,
}) {
  const file = path.join(
    root,
    `${filename}${index === undefined ? '' : `.${index}`}.xml`
  );
  fs.writeFile(file, sitemap.stringify(), err => {
    if (err) throw err;
  });
}

module.exports = {
  saveSiteMap,
};

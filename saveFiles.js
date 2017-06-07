const fs = require('fs');
const path = require('path');

function saveSiteMap({
  sitemap,
  root = 'sitemaps',
  filename = 'sitemap',
  index,
}) {
  return new Promise((resolve, reject) => {
    const file = path.join(
      root,
      `${filename}${index === undefined ? '' : `.${index}`}.xml`
    );
    fs.writeFile(file, sitemap.stringify(), err => {
      if (err) {
        reject(err);
        return;
      }
      resolve(file);
    });
  });
}

module.exports = {
  saveSiteMap,
};

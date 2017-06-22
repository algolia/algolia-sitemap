const fs = require('fs');
const path = require('path');

function saveSiteMap({
  sitemap,
  root = 'sitemaps',
  filename = 'sitemap',
  index,
}) {
  return new Promise((resolve, reject) => {
    const name = `${filename}${index === undefined ? '' : `.${index}`}.xml`;
    const file = path.join(root, name);
    fs.writeFile(file, sitemap.stringify(), err => {
      if (err) {
        reject(err);
        return;
      }
      resolve(name);
    });
  });
}

module.exports = {
  saveSiteMap,
};

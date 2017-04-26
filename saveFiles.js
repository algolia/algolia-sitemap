const fs = require('fs');
const path = require('path');

function saveSiteMap({
  sitemap,
  root = 'sitemaps',
  filename = 'sitemap',
  index,
}) {
  const file = path.join(
    __dirname,
    root,
    `${filename}${index === undefined ? '' : '.' + index}.xml`
  );
  fs.writeFile(file, sitemap.stringify({ pretty: true }), err => {
    if (err) throw err;
    //console.log(`written ${file}`);
  });
}

module.exports = {
  saveSiteMap,
};

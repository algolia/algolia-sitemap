# Change Log

## 2.0.2

Fixed build of 2.0.0 and 2.0.1

## 2.0.0

* now returns a Promise, you can use this to 
* handles invalid values for the params
* allows you to pass Algolia options
* internal changes in how the changelog is made
* sitemapLocation is now split up into:
  * sitemapLoc: 'https://yoursite.com/sitemaps'; the base url into which the sitemaps will be visible
  * outputFolder: 'sitemaps'; the directory in which sitemaps will be outputted

## 1.1.0

* Aggregates multiple links (50 000) per sitemap
* Allows you to exclude certain records by returning a falsy value in hitToParams
* allows you to pass an array to hitToParams to generate multiple records per object
* new example: category pages

## 1.0.1

* fixes: handles correctly with relative file locations

## 1.0.0

Initial release!

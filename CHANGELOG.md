# Change Log

## 2.1.1

* allow for html (escaped) in `<image:title>` and `<image:caption>` (thanks [@jaredpalmer](https://github.com/jaredpalmer)) ([#111](https://github.com/algolia/algolia-sitemap/pull/111))

## 2.1.0

* support for `images` (thanks [@jaredpalmer](https://github.com/jaredpalmer)) ([#108](https://github.com/algolia/algolia-sitemap/pull/108))
* updated dependencies ([f388b2e](https://github.com/algolia/algolia-sitemap/commit/f388b2e))

## 2.0.7

Some chores and updating of dependencies, nothing usage-touching

## 2.0.6

Put the relative file path in the sitemap index instead of a full path

## 2.0.5

Support node v6

## 2.0.4

Fixed build steps of 2.0.0

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

/* eslint-env jest */
const { createSitemapindex, createSitemap } = require('../sitemap');

describe('sitemap', () => {
  it('renders empty if needed', () => {
    const sitemap = createSitemap();
    expect(sitemap.stringify()).toMatchSnapshot();
  });

  it('renders with a single loc-only entry', () => {
    const entries = [{ loc: 'https://www.example.com' }];
    const sitemap = createSitemap(entries);
    expect(sitemap.stringify()).toMatchSnapshot();
  });

  it('renders with multiple loc-only entries', () => {
    const entries = [
      { loc: 'https://www.example.com' },
      { loc: 'https://www.example.com/test' },
    ];
    const sitemap = createSitemap(entries);
    expect(sitemap.stringify()).toMatchSnapshot();
  });

  it('renders with multiple optional entries', () => {
    const entries = [
      {
        loc: 'https://www.example.com',
        lastmod: new Date(1).toISOString(),
        changefreq: 'daily',
        priority: 0,
      },
      {
        loc: 'https://www.example.com/test',
        lastmod: new Date(0).toISOString(),
        changefreq: 'weekly',
        priority: 0.2,
      },
    ];
    const sitemap = createSitemap(entries);
    expect(sitemap.stringify()).toMatchSnapshot();
  });

  it('renders with alternatives', () => {
    const entries = [
      {
        loc: 'https://www.example.com',
        alternates: {
          languages: ['en', 'fr'],
          hitToURL: lang => `https://${lang}.example.com`,
        },
      },
    ];
    const sitemap = createSitemap(entries);
    expect(sitemap.stringify()).toMatchSnapshot();
  });
});

describe('sitemapindex', () => {
  it('renders empty if needed', () => {
    const index = createSitemapindex();
    expect(index.stringify()).toMatchSnapshot();
  });

  it('renders with a single entry', () => {
    const sitemaps = [{ loc: 'https://example.com/sitemap.0.xml' }];
    const index = createSitemapindex(sitemaps);
    expect(index.stringify()).toMatchSnapshot();
  });

  it('renders with multiple entries', () => {
    const sitemaps = [
      { loc: 'https://example.com/sitemap.0.xml' },
      { loc: 'https://example.com/sitemap.1.xml' },
    ];
    const index = createSitemapindex(sitemaps);
    expect(index.stringify()).toMatchSnapshot();
  });
});

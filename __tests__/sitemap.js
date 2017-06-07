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

  describe('Validation', () => {
    it('ensures loc is required', () => {
      [
        {},
        {
          changefreq: 'weekly',
        },
        {
          alternates: [],
        },
      ].forEach(entry => {
        expect(() => {
          createSitemap([entry]);
        }).toThrow();
      });
    });

    it('ensures lastmod is a w3c date', () => {
      [
        { loc: 'https://example.com', lastmod: '' },
        { loc: 'https://example.com', lastmod: '15 august' },
        { loc: 'https://example.com', lastmod: new Date(1) },
        { loc: 'https://example.com', lastmod: new Date(1).toString() },
        { loc: 'https://example.com', lastmod: new Date(1).toDateString() },
      ].forEach(entry => {
        expect(() => {
          createSitemap([entry]);
        }).toThrow();
      });
    });

    it('ensures priority is between 0 and 1', () => {
      [
        {
          loc: 'https://www.example.com/test',
          priority: NaN,
        },
        {
          loc: 'https://www.example.com/test',
          priority: '0',
        },
        {
          loc: 'https://www.example.com/test',
          priority: -5,
        },
        {
          loc: 'https://www.example.com/test',
          priority: 1.1,
        },
      ].forEach(entry => {
        expect(() => {
          createSitemap([entry]);
        }).toThrow();
      });
    });

    it('ensures changefreq follows spec', () => {
      [
        {
          loc: 'https://www.example.com/test',
          changefreq: 'WEEKLY',
        },
        {
          loc: 'https://www.example.com/test',
          changefreq: '0',
        },
        {
          loc: 'https://www.example.com/test',
          changefreq: null,
        },
      ].forEach(entry => {
        expect(() => {
          createSitemap([entry]);
        }).toThrow();
      });
    });
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

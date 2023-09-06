/* eslint-env jest */

const algoliaSitemap = require('../index');
const { saveSiteMap } = require('../saveFiles');
const { __browse } = require('algoliasearch');

jest.mock('algoliasearch', () => {
  const browse = jest.fn().mockImplementation(() =>
    Promise.resolve({
      hits: [
        {
          objectID: '1',
          slug: 'test1',
          title: 'Test 1',
          date: '2018-01-01',
        },
      ],
      cursor: '2',
    })
  );

  const browseFrom = jest.fn().mockImplementation(() =>
    Promise.resolve({
      hits: [
        {
          objectID: '2',
          slug: 'test2',
          title: 'Test 2',
          date: '2018-01-01',
        },
      ],
      cursor: undefined,
    })
  );

  const algoliasearch = jest.fn().mockImplementation(() => ({
    initIndex: jest.fn().mockImplementation(() => ({
      browse,
      browseFrom,
    })),
  }));

  algoliasearch.__browse = browse;
  algoliasearch.__browseFrom = browseFrom;

  return algoliasearch;
});

jest.mock('../saveFiles', () => ({
  saveSiteMap: jest
    .fn()
    .mockImplementation(({ filename = 'sitemap', index }) =>
      Promise.resolve(
        `${filename}${index === undefined ? '' : `.${index}`}.xml`
      )
    ),
}));

jest
  .spyOn(Date.prototype, 'toISOString')
  .mockReturnValue('2018-01-02T12:00:00.000Z');

describe('index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be a function', () => {
    expect(typeof algoliaSitemap).toBe('function');
  });

  test('should write all items to a sitemap', async () => {
    await algoliaSitemap({
      algoliaConfig: {
        appId: 'test',
        apiKey: 'test',
        indexName: 'test',
      },
      sitemapLoc: 'https://www.example.org',
      hitToParams: hit => ({
        loc: `https://www.example.org/${hit.slug}`,
        lastmod: hit.date,
      }),
    });

    expect(saveSiteMap).toHaveBeenCalledTimes(2);
    expect(saveSiteMap.mock.calls[0][0]).toEqual({
      index: 0,
      root: undefined,
      sitemap: expect.any(Object),
    });
    expect(saveSiteMap.mock.calls[0][0].sitemap.stringify()).toMatchSnapshot();
    expect(saveSiteMap.mock.calls[1][0]).toEqual({
      filename: 'sitemap-index',
      root: undefined,
      sitemap: expect.any(Object),
    });
    expect(saveSiteMap.mock.calls[1][0].sitemap.stringify()).toMatchSnapshot();
  });

  test("should write all items to a sitemap when there's only one page", async () => {
    __browse.mockImplementationOnce(() =>
      Promise.resolve({
        hits: [
          {
            objectID: '1',
            slug: 'test1',
            title: 'Test 1',
            date: '2018-01-01',
          },
        ],
        cursor: undefined,
      })
    );

    await algoliaSitemap({
      algoliaConfig: {
        appId: 'test',
        apiKey: 'test',
        indexName: 'test',
      },
      sitemapLoc: 'https://www.example.org',
      hitToParams: hit => ({
        loc: `https://www.example.org/${hit.slug}`,
        lastmod: hit.date,
      }),
    });

    expect(saveSiteMap).toHaveBeenCalledTimes(2);
    expect(saveSiteMap.mock.calls[0][0]).toEqual({
      index: 0,
      root: undefined,
      sitemap: expect.any(Object),
    });
    expect(saveSiteMap.mock.calls[0][0].sitemap.stringify()).toMatchSnapshot();
    expect(saveSiteMap.mock.calls[1][0]).toEqual({
      filename: 'sitemap-index',
      root: undefined,
      sitemap: expect.any(Object),
    });
    expect(saveSiteMap.mock.calls[1][0].sitemap.stringify()).toMatchSnapshot();
  });
});

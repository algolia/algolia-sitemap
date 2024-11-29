const jsxString = require('jsx-string');
const isURL = require('validator/lib/isURL');
const isISO8601 = require('validator/lib/isISO8601');

const xmlStringify = content =>
  `<?xml version="1.0" encoding="utf-8"?>${jsxString(content)}`;

function createSitemapindex(sitemaps = []) {
  const sitemap = ({ loc, lastmod }) => (
    <sitemap>
      <loc>{loc}</loc>
      {lastmod && <lastmod>{lastmod}</lastmod>}
    </sitemap>
  );

  const index = (
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {sitemaps.map(sitemap)}
    </sitemapindex>
  );

  return {
    stringify: () => xmlStringify(index),
  };
}

const isValidURL = ({
  loc,
  lastmod,
  changefreq,
  priority,
  alternates,
  images,
  videos,
}) => {
  // loc
  // eslint-disable-next-line camelcase
  if (!loc && !isURL(`${loc}`, { require_valid_protocol: true })) {
    throw new Error(
      `loc "${loc}" was not valid. It's required.

see https://www.sitemaps.org/protocol.html`
    );
  }

  // lastmod
  if (lastmod !== undefined && !isISO8601(lastmod)) {
    throw new Error(
      `lastmod "${lastmod}" is not valid. It should be a valid ISO 8601 date

Try using new Date().toISOString()

see https://www.sitemaps.org/protocol.html
see https://www.w3.org/TR/NOTE-datetime`
    );
  }

  // changefreq
  const allowedFreqs = [
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
  ];

  if (!allowedFreqs.includes(changefreq) && changefreq !== undefined) {
    throw new Error(
      `changefreq "${changefreq}" was not a valid value.

expected: ${allowedFreqs.join(', ')}

see https://www.sitemaps.org/protocol.html for more information`
    );
  }

  // priority
  if (
    priority < 0 ||
    priority > 1 ||
    (!Number.isFinite(priority) && priority !== undefined)
  ) {
    throw new Error(
      `
priority "${priority}" was not valid. A number between 0 and 1 is expected.

see https://www.sitemaps.org/protocol.html for more information`
    );
  }

  // images
  const _imagesError = `images ${JSON.stringify(
    images
  )} was not valid. An array with image locations like

[{
  loc: 'https://example.com/test/my-image.jpg'
},{
  loc: 'https://example.com/test/another-image.png'
}]

was expected.

see https://support.google.com/webmasters/answer/178636?hl=en for more information.`;

  if (images !== undefined) {
    if (!(images instanceof Array)) {
      throw new Error(_imagesError);
    }
    images.forEach(img => {
      if (typeof img.loc !== 'string') {
        throw new Error(_imagesError);
      }
      if (!isURL(img.loc)) {
        throw new Error(_imagesError);
      }
    });
  }

  // videos
  const _videosError = `videos ${JSON.stringify(videos)} was not valid. An array with video locations like

[{
  thumbnail_loc: 'https://example.com/test/my-video.jpg',
  title: 'Video title',
  description: 'Video description',
  content_loc: 'https://example.com/test/my-video.mp4'
}]

was expected.

see https://support.google.com/webmasters/answer/178636?hl=en for more information.`;

  if (videos !== undefined) {
    if (!(videos instanceof Array)) {
      throw new Error(_videosError);
    }
    videos.forEach(vid => {
      if (typeof vid.thumbnail_loc !== 'string') {
        throw new Error(_videosError);
      }
      if (!isURL(vid.thumbnail_loc)) {
        throw new Error(_videosError);
      }
      if (typeof vid.title !== 'string') {
        throw new Error(_videosError);
      }
      if (typeof vid.description !== 'string') {
        throw new Error(_videosError);
      }
      if (typeof vid.content_loc !== 'string' && typeof vid.player_loc !== 'string') {
        throw new Error(_videosError);
      }
      if (!isURL(vid.content_loc) && !isURL(vid.player_loc)) {
        throw new Error(_videosError);
      }
    });
  }

  // alternates
  const _alternatesError = `alternates ${JSON.stringify(
    alternates
  )} was not valid. An object with

{
  languages: ['nl-BE', 'fr', 'pt-BR'],
  hitToURL: (language) => \`the url for that \${language}\`,
}

was expected.`;

  if (alternates !== undefined) {
    if (!(alternates.languages instanceof Array)) {
      throw new Error(_alternatesError);
    }
    if (typeof alternates.hitToURL !== 'function') {
      throw new Error(_alternatesError);
    }
    alternates.languages.forEach(lang => {
      if (!isURL(alternates.hitToURL(lang))) {
        throw new Error(_alternatesError);
      }
    });
  }

  return {
    loc,
    lastmod,
    changefreq,
    priority: priority === undefined ? undefined : priority.toFixed(1),
    alternates,
    images,
    videos,
  };
};

function createSitemap(entries = []) {
  const _alternates = ({ languages, hitToURL }) =>
    languages
      .map(language => ({ language, href: hitToURL(language) }))
      .map(({ language, href }) => (
        <xhtml_link rel="alternate" hreflang={language} href={href} />
      ));

  const _images = img => (
    <imageimage>
      <imageloc>{img.loc}</imageloc>
      {img.title && <imagetitle>{img.title}</imagetitle>}
      {img.caption && <imagecaption>{img.caption}</imagecaption>}
      {img.geo_location && (
        <imagegeolocation>{img.geo_location}</imagegeolocation>
      )}
      {img.license && <imagelicense>{img.license}</imagelicense>}
    </imageimage>
  );

  const _videos = vid => (
    <videovideo>
      <videotitle>{vid.title}</videotitle>
      <videodescription>{vid.description}</videodescription>
      <videothumbnailLoc>{vid.thumbnail_loc}</videothumbnailLoc>
      {vid.content_loc && <videocontentLoc>{vid.content_loc}</videocontentLoc>}
      {vid.player_loc && <videoplayerLoc>{vid.player_loc}</videoplayerLoc>}
    </videovideo>
  );

  const url = args => {
    const {
      loc = undefined,
      lastmod = undefined,
      changefreq = undefined,
      priority = undefined,
      alternates = undefined,
      images = undefined,
      videos = undefined,
    } = isValidURL(args);

    return (
      <url
        xmlns_xhtml={alternates ? 'http://www.w3.org/1999/xhtml' : undefined}
      >
        <loc>{loc}</loc>
        {lastmod && <lastmod>{lastmod}</lastmod>}
        {changefreq && <changefreq>{changefreq}</changefreq>}
        {priority && <priority>{priority}</priority>}
        {alternates && _alternates(alternates)}
        {images && images.length > 0 ? images.map(_images) : null}
        {videos && videos.length > 0 ? videos.map(_videos) : null}
      </url>
    );
  };

  // Add xml namespsace to <urlset>
  // For info on xmlns:images see https://support.google.com/webmasters/answer/178636?hl=en
  const sitemap = (
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns_image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns_video="http://www.google.com/schemas/sitemap-video/1.1"
    >
      {entries.map(url)}
    </urlset>
  );

  return {
    stringify: () =>
      xmlStringify(sitemap)
        // Despite the fact that jsx-string is supposed to convert '_' in tag/attribute names to ':',
        // it can only do this for self-closing tags (i.e. without children), thus we augment some XML output
        // with regex/string magic.
        //
        // <imagegeolocation></imagegeolocation> ➡️ <image:geo_location></image:geo_location>
        .replace(/(<\/?image)(geolocation)/g, '$1geo_location')
        // Wrap title and caption in CDATA blocks just in case escaped HTML is passed in.
        .replace(/<imagetitle>/g, '<imagetitle><![CDATA[')
        .replace(/<\/imagetitle>/g, ']]></imagetitle>')
        .replace(/<imagecaption>/g, '<imagecaption><![CDATA[')
        .replace(/<\/imagecaption>/g, ']]></imagecaption>')
        .replace(/<videotitle>/g, '<videotitle><![CDATA[')
        .replace(/<\/videotitle>/g, ']]></videotitle>')
        .replace(/<videodescription>/g, '<videodescription><![CDATA[')
        .replace(/<\/videodescription>/g, ']]></videodescription>')
        // <imageimage></imageimage> ➡️ <image:image></image:image>
        .replace(/<\/?image/g, '$&:')
        // <videovideo></videovideo> ➡️ <video:video></video:video>
        .replace(/<\/?video/g, '$&:')
        // Video sitemaps use underscores in attribute names
        .replace(/<(\/?)video:thumbnailLoc/g, '<$1video:thumbnail_loc')
        .replace(/<(\/?)video:contentLoc/g, '<$1video:content_loc')
        .replace(/<(\/?)video:playerLoc/g, '<$1video:player_loc')
  };
}

module.exports = {
  createSitemapindex,
  createSitemap,
};

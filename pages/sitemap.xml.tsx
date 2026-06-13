import type { GetServerSideProps } from 'next';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/membership',
  '/reading/general',
  '/reading/general/three-card-universal/question',
  '/reading/general/sacred-triangle/question',
  '/reading/general/two-choices/question',
  '/reading/general/hexagram/question',
  '/reading/general/horseshoe/question',
  '/reading/general/celtic-cross/question',
  '/fortune/daily',
  '/fortune/monthly',
  '/fortune/monthly/basic',
  '/fortune/monthly/member',
  '/fortune/seasonal',
  '/fortune/annual/year-ahead',
  '/fortune/yesno-tarot/draw',
  '/divination/jiaobei',
  '/themed-readings/love',
  '/themed-readings/love/future-lover/draw',
  '/themed-readings/love/what-they-think/draw',
  '/themed-readings/love/relationship-development/draw',
  '/themed-readings/love/reconciliation/draw',
  '/themed-readings/career-study',
  '/themed-readings/career-study/skills-direction/draw',
  '/themed-readings/career-study/interview-exam-key-reminders/draw',
  '/themed-readings/career-study/offer-decision/draw',
  '/themed-readings/career-study/stay-or-leave/draw',
  '/themed-readings/wealth',
  '/themed-readings/wealth/current-wealth-status/draw',
  '/themed-readings/wealth/wealth-obstacles/draw',
];

const LOCALES = ['en', 'zh'] as const;

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://fateaura.com').replace(/\/$/, '');
}

function getLocalizedPath(route: string, locale: (typeof LOCALES)[number]): string {
  if (locale === 'en') return route;
  return route === '/' ? '/zh' : `/zh${route}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const lastmod = new Date().toISOString();

  const urls = PUBLIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const path = getLocalizedPath(route, locale);
      return [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        route === '/' ? '    <priority>1.0</priority>' : '    <priority>0.7</priority>',
        '  </url>',
      ].join('\n');
    })
  ).join('\n');

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}

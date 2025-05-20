/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://delbi-restaurant.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/admin/*', '/api/*', '/server-sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://delbi-restaurant.com/server-sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom transform function
    return {
      loc: path, // => URL
      changefreq: config.changefreq,
      priority: path === '/' ? 1.0 : 
                path.includes('/menu') ? 0.8 :
                path.includes('/about') ? 0.7 : 
                path.includes('/reservation') ? 0.9 : 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
} 
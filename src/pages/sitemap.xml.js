const EXTERNAL_DATA_URL = 'https://delbi-restaurant.com';

function generateSiteMap() {
  const languages = ['nl', 'en', 'fr', 'de', 'ar'];
  const pages = ['', '/menu', '/about', '/reservation'];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:xhtml="http://www.w3.org/1999/xhtml">
     ${languages.map(lang => 
       pages.map(page => `
         <url>
           <loc>${`${EXTERNAL_DATA_URL}/${lang}${page}`}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>daily</changefreq>
           <priority>${page === '' ? '1.0' : '0.8'}</priority>
           ${languages.map(altLang => `
             <xhtml:link 
               rel="alternate" 
               hreflang="${altLang}" 
               href="${`${EXTERNAL_DATA_URL}/${altLang}${page}`}"
             />
           `).join('')}
           <xhtml:link 
             rel="alternate" 
             hreflang="x-default" 
             href="${`${EXTERNAL_DATA_URL}/nl${page}`}"
           />
         </url>
       `).join('')
     ).join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will handle the XML generation
}

export async function getServerSideProps({ res }) {
  // Generate the XML sitemap
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap; 
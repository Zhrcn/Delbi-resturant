import '../i18n/config';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Script from 'next/script';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import Head from 'next/head';
import ThemeToggle from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { appWithTranslation } from 'next-i18next';

// Google Analytics measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual Google Analytics ID

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle route changes for Google Analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Detect language based on IP on initial load
  useEffect(() => {
    if (!mounted) return;

    const detectLanguage = async () => {
      try {
        // Only detect language if no language is set in localStorage
        if (!localStorage.getItem('i18nextLng')) {
          const response = await axios.get('/api/detect-language');
          const { language } = response.data;
          
          // Only change language if it's different from current
          if (language && language !== router.locale) {
            await i18n.changeLanguage(language);
            router.push(router.pathname, router.asPath, { locale: language });
          }
        }
      } catch (error) {
        console.error('Error detecting language:', error);
      }
    };

    detectLanguage();
  }, [mounted, router, i18n]);

  // Update HTML lang attribute and text direction based on language
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    html.lang = i18n.language;
    html.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language, mounted]);

  // Check if current page is an admin page
  const isAdminPage = router.pathname.startsWith('/admin');

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ef4444" />
        <meta name="description" content="Delbi Restaurant - Experience authentic cuisine in a warm and welcoming atmosphere. Book your table online for an unforgettable dining experience." />
        <meta name="keywords" content="restaurant, dining, food, reservation, cuisine, Delbi Restaurant, Amsterdam" />
        <meta name="author" content="Delbi Restaurant" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://delbi-restaurant.com/" />
        <meta property="og:title" content="Delbi Restaurant" />
        <meta property="og:description" content="Experience authentic cuisine in a warm and welcoming atmosphere." />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:locale" content={i18n.language} />
        <meta property="og:locale:alternate" content={['nl', 'en', 'fr', 'de', 'ar'].filter(lang => lang !== i18n.language).join(', ')} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://delbi-restaurant.com/" />
        <meta property="twitter:title" content="Delbi Restaurant" />
        <meta property="twitter:description" content="Experience authentic cuisine in a warm and welcoming atmosphere." />
        <meta property="twitter:image" content="/og-image.jpg" />

        {/* Alternate language links */}
        <link rel="alternate" hrefLang="nl" href="https://delbi-restaurant.com/nl" />
        <link rel="alternate" hrefLang="en" href="https://delbi-restaurant.com/en" />
        <link rel="alternate" hrefLang="fr" href="https://delbi-restaurant.com/fr" />
        <link rel="alternate" hrefLang="de" href="https://delbi-restaurant.com/de" />
        <link rel="alternate" hrefLang="ar" href="https://delbi-restaurant.com/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://delbi-restaurant.com/nl" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        <title>Delbi Restaurant</title>
      </Head>

      {/* Google Analytics Scripts */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-200">
        {/* Render with or without layout based on the page */}
        {isAdminPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </div>
    </ThemeProvider>
  );
}

export default appWithTranslation(MyApp); 
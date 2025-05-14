import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('hero.title')} - Delbi Restaurant</title>
        <meta name="description" content={t('hero.subtitle')} />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-screen">
          <Image
            src="/images/hero-bg.jpg"
            alt="Delbi Restaurant"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                {t('hero.subtitle')}
              </p>
              <Link
                href="/reservation"
                className="bg-primary-light dark:bg-primary-dark hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
              >
                {t('hero.cta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('features.fresh.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('features.fresh.description')}
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('features.chefs.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('features.chefs.description')}
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('features.timing.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('features.timing.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-100 dark:bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t('cta.subtitle')}
            </p>
            <Link
              href="/reservation"
              className="bg-primary-light dark:bg-primary-dark hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 
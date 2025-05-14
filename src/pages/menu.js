import { useTranslation } from 'react-i18next';
import Head from 'next/head';

export default function Menu() {
  const { t } = useTranslation();

  const categories = ['starters', 'mainCourses', 'desserts', 'drinks'];

  return (
    <>
      <Head>
        <title>{t('menu.title')} - Delbi Restaurant</title>
        <meta name="description" content={t('menu.description')} />
      </Head>

      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              {t('menu.title')}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              {t('menu.subtitle')}
            </p>
          </div>

          <div className="mt-20">
            {categories.map((category) => (
              <div key={category} className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  {t(`menu.categories.${category}`)}
                </h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                      <div className="relative h-48">
                        <img
                          className="w-full h-full object-cover"
                          src={`/menu/${category}-${item}.jpg`}
                          alt={t(`menu.items.${category}.${item}.name`)}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {t(`menu.items.${category}.${item}.name`)}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-300 mb-4">
                          {t(`menu.items.${category}.${item}.description`)}
                        </p>
                        <p className="text-primary-light dark:text-primary-dark font-semibold">
                          €{t(`menu.items.${category}.${item}.price`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import Image from 'next/image';

export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('about.title')} - Delbi Restaurant</title>
        <meta name="description" content={t('about.description')} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative h-[40vh] flex items-center justify-center bg-cover bg-center" 
             style={{ backgroundImage: "url('/images/staff.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl">
              {t('about.subtitle')}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('about.story.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('about.story.content')}
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/staff.jpg"
                alt={t('about.imageAlt')}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              {t('about.team.title')}
            </h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {['chef', 'manager', 'sousChef'].map((member) => (
                <div key={member} className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <img
                      className="rounded-full object-cover w-full h-full"
                      src={`/images/team/${member}.jpg`}
                      alt={t(`about.team.${member}.name`)}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t(`about.team.${member}.name`)}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300">
                    {t(`about.team.${member}.position`)}
                  </p>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    {t(`about.team.${member}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
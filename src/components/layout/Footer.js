import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.contact.title')}
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>{t('footer.contact.address')}</p>
              <p>{t('footer.contact.phone')}</p>
              <p>{t('footer.contact.email')}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.quickLinks.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.quickLinks.home')}
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.quickLinks.menu')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.quickLinks.about')}
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.quickLinks.reservation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.hours.title')}
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>{t('footer.hours.weekdays')}</p>
              <p>{t('footer.hours.weekend')}</p>
            </div>
          </div>

          {/* Social Media & Language */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.social.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.social.facebook')}
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.social.instagram')}
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light">
                  {t('footer.social.twitter')}
                </a>
              </div>
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
} 
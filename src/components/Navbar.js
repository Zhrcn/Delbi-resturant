import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-light dark:text-primary-dark">
                Delbi
              </Link>
            </div>
          <div className="flex  ">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 justify-center pl-16  items-center">
              <Link href="/" className="text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium">
                {t('nav.home')}
              </Link>
              <Link href="/menu" className="text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium">
                {t('nav.menu')}
              </Link>
              <Link href="/about" className="text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium">
                {t('nav.about')}
              </Link>
              <Link href="/reservation" className="text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium">
                {t('nav.reservation')}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/" className="block text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-base font-medium">
            {t('nav.home')}
          </Link>
          <Link href="/menu" className="block text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-base font-medium">
            {t('nav.menu')}
          </Link>
          <Link href="/about" className="block text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-base font-medium">
            {t('nav.about')}
          </Link>
          <Link href="/reservation" className="block text-gray-900 dark:text-white hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-base font-medium">
            {t('nav.reservation')}
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 
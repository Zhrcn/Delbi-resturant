import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { useState } from 'react';
import Image from 'next/image';

export default function Menu({ menuItems }) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Get unique categories from the menu items
  const categories = Object.keys(groupedMenuItems);
  
  // Filter menu items based on active category
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

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
          
          {/* Category filter */}
          <div className="flex flex-wrap justify-center mt-10 gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full font-medium ${
                activeCategory === 'all'
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {t('menu.allCategories')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-medium ${
                  activeCategory === category
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-48">
                    {item.image ? (
                      <img
                        className="w-full h-full object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className="text-primary-light dark:text-primary-dark font-semibold">
                        €{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-300 mb-4">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </span>
                      {!item.available && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          {t('menu.unavailable')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    // Use absolute URL for local development and production
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Fetch menu items from the API
    const res = await fetch(`${baseUrl}/api/menu`);
    
    if (!res.ok) {
      console.error(`Failed to fetch menu: ${res.status} ${res.statusText}`);
      return { props: { menuItems: [] } };
    }
    
    const menuItems = await res.json();
    
    return {
      props: {
        menuItems,
      },
    };
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return {
      props: {
        menuItems: [],
      },
    };
  }
} 
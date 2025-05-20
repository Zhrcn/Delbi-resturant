import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

export default function Layout({ children }) {
  const { isDarkMode: isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col user-theme ${isDark ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 
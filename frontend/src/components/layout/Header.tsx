import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/translations';
import { useAuthStore } from '@/store/auth.ts';
import { useEffect } from 'react';

const Header: React.FC<{ onToggleSidebar: () => void; isMobile: boolean; mobileMenuOpen: boolean }> = ({ onToggleSidebar, isMobile, mobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const language  = useLanguage();
  const toggleLanguage = language.toggleLanguage;
  const t = useTranslation(language);

  const { logout } = useAuthStore();
  const { user, getLoggedUser } = useAuthStore();

  useEffect(() => {
    getLoggedUser();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-base-100 border-b border-base-300 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-circle hover:bg-base-200 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Spacer for desktop */}
        {!isMobile && <div></div>}

        {/* Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="btn btn-ghost btn-circle hover:bg-base-200"
            title={language.language === 'pt' ? t.switchToEnglish : t.switchToPortuguese}
          >
            <div className="flex items-center justify-center w-5 h-5 font-semibold text-sm">
              {language.language === 'pt' ? 'EN' : 'PT'}
            </div>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-base-200"
            title={theme === 'light' ? t.darkMode : t.lightMode}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0} 
              className="btn btn-ghost btn-circle hover:bg-base-200 indicator"
            >
              <Bell className="w-5 h-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </button>
            <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 p-2 bg-base-100">
              <div className="card-body">
                <h3 className="font-bold">{t.notifications}</h3>
                <p className="text-sm text-neutral">{t.noNewNotifications}</p>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-content flex items-center justify-center hover:bg-primary-focus transition-colors shadow-md">
              <span className="text-sm font-semibold drop-shadow-sm">L</span>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user?.name}</span>
              </li>
              <li><a href="/profile">{t.profile}</a></li>
              <li><a href="/plans">{t.plans}</a></li>
              <li><hr className="my-2" /></li>
              <li><a href="#" onClick={handleLogout}>{t.logout}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
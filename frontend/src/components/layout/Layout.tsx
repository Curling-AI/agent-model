import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header';
import { ThemeProvider } from '../../context/ThemeContext.tsx';
import NotificationsProvider from '@/context/NotificationsProvider.tsx';



const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está no mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <NotificationsProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-base-100">
          {/* Overlay para mobile */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
          )}

          <Sidebar
            collapsed={isMobile ? false : sidebarCollapsed}
            onToggle={toggleSidebar}
            isMobile={isMobile}
            mobileOpen={mobileMenuOpen}
            onMobileClose={closeMobileMenu}
          />

          <div className={`sidebar-transition ${isMobile
              ? 'ml-0'
              : sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}>
            <Header
              onToggleSidebar={toggleSidebar}
              isMobile={isMobile}
              mobileMenuOpen={mobileMenuOpen}
            />
            <main className="p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </NotificationsProvider>
  );
};

export default Layout; 
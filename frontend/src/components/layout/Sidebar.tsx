import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Zap,
  MessageSquare, 
  Kanban,
  CreditCard,
  User,
  ChevronLeft,
  Hexagon,
  Shield,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../translations';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = useTranslation(language);

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: t.dashboard, category: t.principal },
    { path: '/agents', icon: Zap, label: t.agents, category: t.principal },
    { path: '/conversations', icon: MessageSquare, label: t.conversations, category: t.support },
    { path: '/crm', icon: Kanban, label: t.crm, category: t.support },
    { path: '/plans', icon: CreditCard, label: t.plans, category: t.account },
    { path: '/profile', icon: User, label: t.profile, category: t.account },
    { path: '/admin', icon: Shield, label: t.admin, category: t.account },
  ];

  const categories = [...new Set(menuItems.map(item => item.category))];

  // Fechar menu mobile ao clicar em um item
  const handleItemClick = () => {
    if (isMobile && mobileOpen) {
      onMobileClose();
    }
  };

  const sidebarClasses = `
    fixed left-0 top-0 h-full bg-base-200 shadow-xl sidebar-transition z-50
    ${isMobile 
      ? `w-80 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
      : `${collapsed ? 'w-16' : 'w-64'}`
    }
  `;

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'} p-4 border-b border-base-300`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-lg flex items-center justify-center shadow-lg">
              <Hexagon className="w-5 h-5 text-primary-content drop-shadow-sm" />
            </div>
            <span className="font-bold text-lg text-base-content">ConvergIA</span>
          </div>
        )}
        
        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            onClick={onMobileClose}
            className="btn btn-ghost btn-sm hover:bg-base-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button 
            onClick={onToggle}
            className="btn btn-ghost btn-sm hover:bg-base-300"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`${collapsed && !isMobile ? "p-2 space-y-4" : "p-4 space-y-6"} overflow-y-auto h-full`}>
        {categories.map(category => (
          <div key={category}>
            {(!collapsed || isMobile) && (
              <h3 className="text-xs font-semibold text-neutral uppercase tracking-wider mb-3">
                {category}
              </h3>
            )}
            {collapsed && !isMobile && category !== t.principal && (
              <div className="border-t border-base-300 my-2"></div>
            )}
            <div className={collapsed && !isMobile ? "space-y-2" : "space-y-1"}>
              {menuItems
                .filter(item => item.category === category)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleItemClick}
                      title={collapsed && !isMobile ? item.label : undefined}
                      className={`flex items-center ${collapsed && !isMobile ? 'justify-center px-2 py-3 mx-1' : 'space-x-3 px-3 py-2.5'} rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-primary text-primary-content shadow-md' 
                          : 'text-base-content hover:bg-base-300'
                      } ${collapsed && !isMobile ? 'hover:shadow-sm' : ''}`}
                    >
                      <Icon className={collapsed && !isMobile ? 'w-6 h-6 drop-shadow-sm' : 'w-5 h-5'} />
                      {(!collapsed || isMobile) && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Apenas no desktop */}
      {!isMobile && !collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-base-300 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-base-content">{t.availableCredits}</span>
              <span className="text-xs font-bold text-primary">1.250</span>
            </div>
            <div className="w-full bg-base-100 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-neutral">75% {t.used}</span>
              <span className="text-xs text-neutral">500 {t.remaining}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 
import React from 'react';
import { Page, UserProfile } from '../types.ts';
import Icon from './ui/Icon.tsx';

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  profile: UserProfile | null;
  familyId: string | null;
  progress: { triedCount: number; totalCount: number };
  children: React.ReactNode;
}

const NavButton: React.FC<{
  page: Page;
  label: string;
  icon: string;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}> = ({ page, label, icon, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  const color = isActive ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700';

  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`nav-btn flex flex-col items-center justify-center p-3 w-full transition-colors ${color}`}
    >
      <Icon name={icon} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, profile, familyId, children }) => {
  const getSubtitle = () => {
    if (profile?.babyName) {
      return <>Tracking for: <span className="font-semibold text-teal-600">{profile.babyName}</span></>;
    }
    if (familyId) {
      return <>Family ID: <code className="font-mono bg-gray-100 p-1 rounded">{familyId}</code></>;
    }
    return 'Welcome! Please log in.';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Tiny Tastes Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">{getSubtitle()}</p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full">
        <div className="page-content py-6 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex justify-around px-2 sm:px-6 lg:px-8">
          <NavButton page="tracker" label="Tracker" icon="grid-3x3" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavButton page="ideas" label="Ideas" icon="lightbulb" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavButton page="recipes" label="Recipes" icon="notebook-pen" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavButton page="log" label="Log" icon="clipboard-list" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavButton page="learn" label="Learn" icon="book-open" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </nav>
    </div>
  );
};

export default Layout;
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '../types';

interface LayoutProps {
  user: User;
  title: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, title, currentPath, onNavigate, onLogout, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title={title} onLogout={onLogout} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

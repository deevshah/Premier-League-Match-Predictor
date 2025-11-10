"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/fixtures', label: 'Upcoming Fixtures', icon: '📅' },
    { href: '/predictions', label: 'Make Prediction', icon: '🎯' },
  ];
  
  return (
    <nav className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm border-b border-purple-500/30 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-6 py-4 font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-white border-b-2 border-pink-500 bg-purple-800/50' 
                    : 'text-gray-400 hover:text-white hover:bg-purple-800/30'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

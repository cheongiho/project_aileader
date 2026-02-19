import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/', label: '홈', icon: '🏠', end: true },
  { to: '/judge/new', label: '판단', icon: '🔍', end: false },
  { to: '/guide', label: '가이드', icon: '📖', end: false },
  { to: '/my/judgements', label: '마이', icon: '👤', end: false },
];

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex">
        {TABS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors',
                isActive ? 'text-brand' : 'text-gray-500'
              )
            }
          >
            <span className="text-lg mb-0.5">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

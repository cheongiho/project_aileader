import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { to: '/', label: '홈', end: true },
  { to: '/judge/new', label: '판단하기', end: false },
  { to: '/shops', label: '정비소', end: false },
  { to: '/guide', label: '가이드', end: false },
  { to: '/my/judgements', label: '마이', end: false },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-brand text-lg">
            <span>🔧</span>
            <span>AI Leader</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-brand bg-brand-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile: 판단하기 CTA */}
          <Link
            to="/judge/new"
            className="md:hidden px-3 py-1.5 bg-brand text-white text-sm font-semibold rounded-lg"
          >
            판단하기
          </Link>
        </div>
      </div>
    </header>
  );
}

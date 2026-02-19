import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { to: '/', label: '홈', end: true },
  { to: '/judge/new', label: '판단하기', end: false },
  { to: '/shops', label: '정비소', end: false },
  { to: '/guide', label: '가이드', end: false },
  { to: '/my/judgements', label: '마이', end: false },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

            {/* 로그인/로그아웃 버튼 */}
            <div className="ml-2 pl-2 border-l border-gray-200">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <Button size="sm" variant="ghost" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm">로그인</Button>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile: 로그인 또는 판단하기 CTA */}
          {isAuthenticated ? (
            <Link
              to="/judge/new"
              className="md:hidden px-3 py-1.5 bg-brand text-white text-sm font-semibold rounded-lg"
            >
              판단하기
            </Link>
          ) : (
            <Link
              to="/login"
              className="md:hidden px-3 py-1.5 bg-brand text-white text-sm font-semibold rounded-lg"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

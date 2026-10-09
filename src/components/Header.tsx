import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DF</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Data Formatter
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              View JSON, XML, YAML, CSV as Tree & Table
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onToggleTheme}
        className="fixed top-3 right-4 z-50 p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}

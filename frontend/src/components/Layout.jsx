import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, PlusCircle, BarChart2, CheckCircle, Menu, X } from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/', label: '学习台', icon: Home },
  { path: '/new', label: '新建大纲', icon: PlusCircle },
  { path: '/progress', label: '学习进度', icon: BarChart2 },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-icon">Σ</span>
            <span className="logo-text">苏格拉底</span>
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="tagline">智慧源于追问</div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
}

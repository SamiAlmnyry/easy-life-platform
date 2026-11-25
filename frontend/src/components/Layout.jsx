import { NavLink, Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      <header className="navbar">
        <div className="container navbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-logo">EL</span>
            <span>
              Easy Life
              <span className="brand-sub">منصة الكوادر الموثقة</span>
            </span>
          </NavLink>

          <nav className="nav-links">
            <NavLink to="/" end className="nav-link">
              الرئيسية
            </NavLink>
            <NavLink to="/professions" className="nav-link">
              التخصصات
            </NavLink>
            <NavLink to="/workers" className="nav-link">
              الفنيون الموثقون
            </NavLink>
            <NavLink to="/requests" className="nav-link">
              طلبات الصيانة
            </NavLink>
            <NavLink to="/admin" className="nav-link">
              لوحة الإدارة
            </NavLink>
          </nav>

          <Link to="/requests" className="nav-cta">
            + اطلب خدمة الآن
          </Link>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <strong>منصة Easy Life</strong> — بيئة رقمية آمنة لربط العملاء بالفنيين والمهندسين الموثقين © 2026
        </div>
      </footer>
    </div>
  );
}
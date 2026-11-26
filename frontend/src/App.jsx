import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WorkerRegisterPage from './pages/WorkerRegisterPage';

function ModulePlaceholder({ title, story, actionTo, actionLabel }) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: actionTo ? 18 : 0 }}>
        نقطة التكامل جاهزة — سيتم بناء هذه الوحدة ضمن قصة ({story}).
      </p>
      {actionTo && (
        <Link to={actionTo} className="nav-cta" style={{ display: 'inline-block' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="professions"
            element={
              <ModulePlaceholder
                title="إدارة واستعراض التخصصات"
                story="EPIC-01: US-102 & US-103"
              />
            }
          />
          <Route
            path="workers"
            element={
              <ModulePlaceholder
                title="دليل الفنيين والمهندسين الموثقين"
                story="EPIC-02: US-201 & US-202"
                actionTo="/workers/register"
                actionLabel="+ تسجيل حساب فني أو مهندس جديد"
              />
            }
          />
          <Route path="workers/register" element={<WorkerRegisterPage />} />
          <Route
            path="requests"
            element={
              <ModulePlaceholder
                title="طلبات الصيانة والتقييم"
                story="EPIC-03: US-301, US-302 & US-303"
              />
            }
          />
          <Route
            path="admin"
            element={
              <ModulePlaceholder
                title="لوحة إدارة المنصة"
                story="Admin Dashboard — EPIC-01 & EPIC-02"
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
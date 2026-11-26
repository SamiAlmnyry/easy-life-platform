import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
function ModulePlaceholder({ title, story }) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        نقطة التكامل جاهزة — سيتم بناء هذه الوحدة ضمن قصة ({story}).
      </p>
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
              />
            }
          />
          <Route path="requests" element={<ServiceRequestsPage />} />
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
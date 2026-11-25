import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function HomePage() {
  const [stats, setStats] = useState({
    professions_count: 0,
    verified_workers_count: 0,
    completed_requests_count: 0,
  });
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/home')
      .then((res) => {
        const payload = res.data?.data;
        if (payload) {
          setStats(payload.stats);
          setProfessions(payload.professions || []);
        }
      })
      .catch(() => {
        setError('تعذر الاتصال بالخادم. تأكد من تشغيل سيرفر Laravel.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <section className="hero">
        <div>
          <span className="hero-badge">✓ كوادر فنية وهندسية معتمدة</span>
          <h1>منصة Easy Life للفنيين والمهندسين الموثقين</h1>
          <p>
            بيئة رقمية آمنة وموثوقة تربطك بأفضل الفنيين والمهندسين بعد مراجعة
            وثائق الهوية والخبرة، مع متابعة كاملة لحالة الطلب وتقييم شفاف بعد الإنجاز.
          </p>
          <div className="hero-actions">
            <Link to="/workers" className="btn btn-white">
              تصفح الفنيين الموثقين
            </Link>
            <Link to="/requests" className="btn btn-outline-white">
              تقديم طلب صيانة
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="trust-item">
            <div className="trust-icon" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
              ✓
            </div>
            <div>
              <h4>تحقق مسبق من الوثائق</h4>
              <span>لا يظهر أي فني إلا بعد اعتماد هويته وخبرته من الإدارة</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
              ⚡
            </div>
            <div>
              <h4>أتمتة كاملة لدورة الطلب</h4>
              <span>تتبع فوري للحالة: قيد الانتظار ← مقبول ← مكتمل</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              ★
            </div>
            <div>
              <h4>نظام تقييم شفاف</h4>
              <span>تقييم حقيقي من 1 إلى 5 نجوم بعد إتمام كل خدمة</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="card" style={{ color: '#b91c1c', marginBottom: 24 }}>
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="card stat-card">
          <div>
            <div className="stat-number">{loading ? '...' : stats.professions_count}</div>
            <div className="stat-label">التخصصات المهنية المتاحة</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-number">{loading ? '...' : stats.verified_workers_count}</div>
            <div className="stat-label">الفنيون والمهندسون الموثقون</div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div className="stat-number">{loading ? '...' : stats.completed_requests_count}</div>
            <div className="stat-label">طلبات الصيانة المكتملة</div>
          </div>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <div className="section-header">
          <h2 className="section-title">التخصصات المهنية</h2>
          <Link to="/professions" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            استعراض جميع التخصصات ←
          </Link>
        </div>

        {loading ? (
          <div className="card">جاري تحميل التخصصات...</div>
        ) : professions.length === 0 ? (
          <div className="card empty-box">
            <p style={{ fontWeight: 700, marginBottom: 4 }}>لا توجد تخصصات مضافة حالياً</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              بمجرد إضافة التخصصات في الخطوة القادمة (US-102) ستظهر هنا تلقائياً.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {professions.map((item) => (
              <div className="card" key={item.id}>
                <h3 style={{ marginBottom: 6 }}>{item.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {item.description || 'فنيون ومهندسون معتمدون في هذا التخصص.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-header">
          <h2 className="section-title">كيف تعمل المنصة؟</h2>
        </div>
        <div className="cards-grid">
          <div className="card">
            <span className="step-badge">1</span>
            <h3 style={{ marginBottom: 6 }}>اختر التخصص والمنطقة</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              تصفح الكوادر المعتمدة فقط بعد مراجعة وثائقهم من إدارة المنصة.
            </p>
          </div>
          <div className="card">
            <span className="step-badge">2</span>
            <h3 style={{ marginBottom: 6 }}>قدّم طلب الصيانة مباشرة</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              أدخل اسمك ورقم هاتفك ووصف المشكلة بدون تسجيل حساب معقد.
            </p>
          </div>
          <div className="card">
            <span className="step-badge">3</span>
            <h3 style={{ marginBottom: 6 }}>تابع الإنجاز وقيّم الخدمة</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              راقب حالة الطلب وأضف تقييمك وتعليقك بعد اكتمال العمل.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
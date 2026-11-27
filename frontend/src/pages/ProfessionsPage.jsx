import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function ProfessionsPage() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchProfessions = () => {
    setLoading(true);
    axiosClient
      .get('/professions')
      .then((res) => {
        setProfessions(res.data?.data || []);
      })
      .catch(() => {
        setErrorMsg('تعذر تحميل التخصصات من الخادم.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfessions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await axiosClient.post('/professions', {
        name,
        description: description.trim() || null,
        is_active: isActive,
      });

      setSuccessMsg(res.data?.message || 'تم إضافة التخصص المهني بنجاح.');
      setName('');
      setDescription('');
      setIsActive(true);
      fetchProfessions();
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data?.errors || {});
        setErrorMsg('يرجى تصحيح الأخطاء الموضحة أدناه.');
      } else {
        setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>
            إدارة التخصصات المهنية
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            أضف تخصصاً مهنياً جديداً مع التحقق التلقائي من عدم تكرار الاسم.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* نموذج إضافة تخصص جديد (US-102) */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
            + إضافة تخصص مهني جديد
          </h2>

          {successMsg && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                اسم التخصص *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سباكة، تكييف وتبريد، ميكانيكا..."
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: fieldErrors.name ? '1.5px solid #dc2626' : '1px solid var(--border)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                }}
              />
              {fieldErrors.name && (
                <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                  {fieldErrors.name[0]}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                وصف التخصص (اختياري)
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة مختصرة عن الخدمات التي يشملها هذا التخصص..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                }}
              />
              {fieldErrors.description && (
                <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                  {fieldErrors.description[0]}
                </span>
              )}
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>تفعيل التخصص ليظهر للعملاء والفنيين</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ التخصص'}
            </button>
          </form>
        </div>

        {/* قائمة التخصصات المسجلة */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
            التخصصات المسجلة ({professions.length})
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>جاري التحميل...</p>
          ) : professions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>لا توجد تخصصات مسجلة بعد.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {professions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                      background: item.is_active ? '#ecfdf5' : '#f1f5f9',
                      color: item.is_active ? '#047857' : '#64748b',
                    }}
                  >
                    {item.is_active ? 'مفعّل' : 'موقوف'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function ProfessionsPage() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | inactive

  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setFieldErrors({});
  };

  const startEdit = (item) => {
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});
    setConfirmDeleteId(null);
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setIsActive(Boolean(item.is_active));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      name,
      description: description.trim() || null,
      is_active: isActive,
    };

    try {
      const res = editingId
        ? await axiosClient.put(`/professions/${editingId}`, payload)
        : await axiosClient.post('/professions', payload);

      setSuccessMsg(res.data?.message || 'تم حفظ البيانات بنجاح.');
      resetForm();
      fetchProfessions();
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data?.errors || {});
        setErrorMsg('يرجى تصحيح الأخطاء الموضحة أدناه.');
      } else {
        setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await axiosClient.patch(`/professions/${item.id}/toggle`);
      setSuccessMsg(res.data?.message || 'تم تحديث حالة التخصص.');
      fetchProfessions();
    } catch {
      setErrorMsg('تعذر تغيير حالة التخصص.');
    }
  };

  const handleDelete = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await axiosClient.delete(`/professions/${id}`);
      setSuccessMsg(res.data?.message || 'تم حذف التخصص بنجاح.');
      if (editingId === id) resetForm();
      setConfirmDeleteId(null);
      fetchProfessions();
    } catch (err) {
      setConfirmDeleteId(null);
      setErrorMsg(err.response?.data?.message || 'تعذر حذف التخصص.');
    }
  };

  const filteredProfessions = professions.filter((item) => {
    if (filter === 'active') return item.is_active;
    if (filter === 'inactive') return !item.is_active;
    return true;
  });

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>
            استعراض وإدارة التخصصات المهنية
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            إضافة وتعديل وتفعيل وتعطيل وحذف التخصصات مع حماية التكرار والارتباطات.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* نموذج الإضافة والتعديل */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
            {editingId ? 'تعديل التخصص المحدد' : '+ إضافة تخصص مهني جديد'}
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

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث التخصص' : 'حفظ التخصص'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn"
                  style={{ background: '#e2e8f0', color: '#0f172a' }}
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>

        {/* قائمة التخصصات مع التعديل والتفعيل والحذف */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: '1.2rem' }}>
              التخصصات ({filteredProfessions.length})
            </h2>

            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'all', label: 'الكل' },
                { key: 'active', label: 'المفعّلة' },
                { key: 'inactive', label: 'المعطّلة' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    background: filter === tab.key ? 'var(--primary)' : '#fff',
                    color: filter === tab.key ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>جاري التحميل...</p>
          ) : filteredProfessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>لا توجد تخصصات مطابقة للعرض.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredProfessions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    border: editingId === item.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    background: '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.02rem' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                        الفنيون المرتبطون: {item.workers_count ?? 0}
                      </div>
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
                      {item.is_active ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>

                  {confirmDeleteId === item.id ? (
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '8px 12px',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ color: '#991b1b', fontSize: '0.85rem', fontWeight: 700 }}>
                        هل أنت متأكد من حذف «{item.name}»؟
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}
                        >
                          نعم، احذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            background: '#e2e8f0',
                            color: '#0f172a',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '5px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        style={{
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '5px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        {item.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '5px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
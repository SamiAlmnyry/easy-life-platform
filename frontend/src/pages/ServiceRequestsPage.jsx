import { useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

const STATUS_META = {
  pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  accepted: { label: 'مقبول وجاري التنفيذ', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  rejected: { label: 'مرفوض', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  completed: { label: 'مكتمل', bg: '#dcfce7', color: '#166534', border: '#86efac' },
};

export default function ServiceRequestsPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'

  // حالات إنشاء طلب جديد (US-301)
  const [form, setForm] = useState({
    worker_id: '1',
    client_name: '',
    client_phone: '',
    problem_description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // حالات استعراض الطلبات وتفاصيلها (US-302)
  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchRequests = async (phone = filterPhone, status = filterStatus) => {
    setLoadingList(true);
    setListError('');
    try {
      const params = new URLSearchParams();
      if (phone.trim()) params.append('client_phone', phone.trim());
      if (status) params.append('status', status);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE}/service-requests${queryString}`);
      const data = await response.json();

      if (response.ok && data.status) {
        setRequests(data.data || []);
      } else {
        setListError(data.message || 'تعذر تحميل قائمة الطلبات.');
      }
    } catch {
      setListError('تعذر الاتصال بالخادم. تأكد من تشغيل Laravel API.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchRequests();
    }
  }, [activeTab]);

  const handleViewDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`${API_BASE}/service-requests/${id}`);
      const data = await response.json();
      if (response.ok && data.status) {
        setSelectedRequest(data.data);
      }
    } catch {
      // في حال فشل الاتصال نعرض النسخة المتوفرة محلياً
      const fallback = requests.find((item) => item.id === id);
      if (fallback) setSelectedRequest(fallback);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch(`${API_BASE}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...form,
          worker_id: Number(form.worker_id),
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        setSubmitMessage({ type: 'success', text: data.message });
        setForm({
          worker_id: '1',
          client_name: '',
          client_phone: '',
          problem_description: '',
          location: '',
        });
        fetchRequests();
      } else {
        setSubmitMessage({
          type: 'error',
          text: data.message || 'يرجى التحقق من البيانات المدخلة.',
        });
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch {
      setSubmitMessage({
        type: 'error',
        text: 'تعذر الاتصال بالخادم. تأكد من تشغيل Laravel على المنفذ 8000.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    const meta = STATUS_META[status] || {
      label: status,
      bg: '#f3f4f6',
      color: '#374151',
      border: '#d1d5db',
    };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          backgroundColor: meta.bg,
          color: meta.color,
          border: `1px solid ${meta.border}`,
        }}
      >
        {meta.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '12px 0' }} dir="rtl">
      {/* شريط التنقل بين تبويبي إنشاء طلب واستعراض الطلبات */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          background: '#f8fafc',
          padding: 8,
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            background: activeTab === 'list' ? '#0f766e' : 'transparent',
            color: activeTab === 'list' ? '#ffffff' : '#334155',
          }}
        >
          📋 استعراض الطلبات وحالتها (US-302)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            background: activeTab === 'create' ? '#0f766e' : 'transparent',
            color: activeTab === 'create' ? '#ffffff' : '#334155',
          }}
        >
          ➕ طلب صيانة جديد (US-301)
        </button>
      </div>

      {/* القسم الأول: استعراض الطلبات وتفاصيلها وحالتها (US-302) */}
      {activeTab === 'list' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ marginBottom: 4 }}>سجل طلبات الصيانة والخدمات</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                تابع حالة طلباتك واطّلع على التفاصيل الكاملة لكل طلب.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchRequests()}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🔄 تحديث القائمة
            </button>
          </div>

          {/* أدوات البحث والتصفية */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 20,
              padding: 14,
              background: '#f8fafc',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                بحث برقم هاتف العميل
              </label>
              <input
                type="text"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                placeholder="مثال: 777123456"
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                تصفية حسب الحالة
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                <option value="">جميع الحالات</option>
                <option value="pending">قيد الانتظار (Pending)</option>
                <option value="accepted">مقبول (Accepted)</option>
                <option value="rejected">مرفوض (Rejected)</option>
                <option value="completed">مكتمل (Completed)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={() => fetchRequests(filterPhone, filterStatus)}
                className="nav-cta"
                style={{ width: '100%', padding: '9px 16px' }}
              >
                تطبيق التصفية
              </button>
            </div>
          </div>

          {listError && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: '#fee2e2',
                color: '#991b1b',
                marginBottom: 16,
              }}
            >
              {listError}
            </div>
          )}

          {loadingList ? (
            <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              جاري تحميل الطلبات...
            </p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              لا توجد طلبات مطابقة حالياً.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border:
                      selectedRequest?.id === req.id
                        ? '2px solid #0f766e'
                        : '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 16,
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <strong style={{ fontSize: 16 }}>طلب #{req.id}</strong>
                      {renderStatusBadge(req.status)}
                    </div>
                    <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
                      العميل: {req.client_name} ({req.client_phone})
                    </p>
                    <p style={{ margin: '0 0 4px', color: '#475569', fontSize: 14 }}>
                      الموقع: {req.location} | الفني رقم: #{req.worker_id}
                    </p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                      {req.problem_description.length > 90
                        ? `${req.problem_description.slice(0, 90)}...`
                        : req.problem_description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewDetails(req.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #0f766e',
                      background: '#f0fdfa',
                      color: '#0f766e',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {loadingDetails && selectedRequest?.id === req.id
                      ? 'جاري الفتح...'
                      : 'عرض التفاصيل الكاملة'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* بطاقة عرض التفاصيل الكاملة للطلب المحدد */}
          {selectedRequest && (
            <div
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 12,
                background: '#f0fdfa',
                border: '1px solid #5eead4',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0, color: '#115e59' }}>
                  تفاصيل الطلب رقم #{selectedRequest.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    border: 'none',
                    background: '#ccfbf1',
                    color: '#115e59',
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  ✕ إغلاق التفاصيل
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>الحالة الحالية:</span>
                  <div style={{ marginTop: 4 }}>{renderStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>اسم العميل:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRequest.client_name}</div>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>رقم هاتف التواصل:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRequest.client_phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>الموقع / العنوان:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRequest.location}</div>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>رقم الفني المسؤول:</span>
                  <div style={{ fontWeight: 700 }}>#{selectedRequest.worker_id}</div>
                </div>
                <div>
                  <span style={{ fontSize: 13, color: '#475569' }}>تاريخ الإرسال:</span>
                  <div style={{ fontWeight: 700 }}>
                    {selectedRequest.created_at
                      ? new Date(selectedRequest.created_at).toLocaleString('ar-YE')
                      : 'غير محدد'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                }}
              >
                <span style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 4 }}>
                  وصف المشكلة الكامل:
                </span>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{selectedRequest.problem_description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* القسم الثاني: إنشاء طلب صيانة جديد (US-301) */}
      {activeTab === 'create' && (
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>طلب خدمة صيانة أو عمل</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            أدخل بياناتك ووصف المشكلة ليتم إرسال الطلب مباشرة إلى الفني المختص.
          </p>

          {submitMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                backgroundColor: submitMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: submitMessage.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${submitMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
              }}
            >
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                رقم الفني (Worker ID)
              </label>
              <input
                type="number"
                name="worker_id"
                value={form.worker_id}
                onChange={handleChange}
                min="1"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              {fieldErrors.worker_id && (
                <small style={{ color: '#dc2626' }}>{fieldErrors.worker_id[0]}</small>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>اسم العميل</label>
              <input
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                placeholder="مثال: أحمد محمد"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              {fieldErrors.client_name && (
                <small style={{ color: '#dc2626' }}>{fieldErrors.client_name[0]}</small>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                رقم الهاتف للتواصل
              </label>
              <input
                type="text"
                name="client_phone"
                value={form.client_phone}
                onChange={handleChange}
                placeholder="مثال: 777123456"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              {fieldErrors.client_phone && (
                <small style={{ color: '#dc2626' }}>{fieldErrors.client_phone[0]}</small>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                الموقع / العنوان
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="مثال: صنعاء - شارع حدة"
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              {fieldErrors.location && (
                <small style={{ color: '#dc2626' }}>{fieldErrors.location[0]}</small>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                وصف المشكلة بالتفصيل
              </label>
              <textarea
                name="problem_description"
                value={form.problem_description}
                onChange={handleChange}
                rows="4"
                placeholder="اشرح العطل أو الخدمة المطلوبة بوضوح..."
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              {fieldErrors.problem_description && (
                <small style={{ color: '#dc2626' }}>{fieldErrors.problem_description[0]}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="nav-cta"
              style={{ padding: '12px 20px', fontSize: 16, cursor: 'pointer' }}
            >
              {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الصيانة'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

const STATUS_META = {
  pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  accepted: { label: 'مقبول وجاري التنفيذ', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  rejected: { label: 'مرفوض', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  completed: { label: 'مكتمل', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  cancelled: { label: 'ملغي', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
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

  // حالات تحديث الحالة، الإلغاء، والتقييم (US-303)
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [cancelPhone, setCancelPhone] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

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
    setActionFeedback(null);
    setCancelPhone('');
    setRatingValue(5);
    setReviewComment('');
    try {
      const response = await fetch(`${API_BASE}/service-requests/${id}`);
      const data = await response.json();
      if (response.ok && data.status) {
        setSelectedRequest(data.data);
      }
    } catch {
      const fallback = requests.find((item) => item.id === id);
      if (fallback) setSelectedRequest(fallback);
    } finally {
      setLoadingDetails(false);
    }
  };

  // تحديث حالة الطلب (قبول / رفض / إكمال)
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/service-requests/${selectedRequest.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (response.ok && data.status) {
        setSelectedRequest(data.data);
        setActionFeedback({ type: 'success', text: data.message });
        fetchRequests();
      } else {
        setActionFeedback({ type: 'error', text: data.message || 'تعذر تحديث حالة الطلب.' });
      }
    } catch {
      setActionFeedback({ type: 'error', text: 'تعذر الاتصال بالخادم.' });
    } finally {
      setActionLoading(false);
    }
  };

  // إلغاء الطلب من طرف العميل
  const handleCancelRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/service-requests/${selectedRequest.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ client_phone: cancelPhone }),
      });
      const data = await response.json();

      if (response.ok && data.status) {
        setSelectedRequest(data.data);
        setCancelPhone('');
        setActionFeedback({ type: 'success', text: data.message });
        fetchRequests();
      } else {
        setActionFeedback({ type: 'error', text: data.message || 'تعذر إلغاء الطلب.' });
      }
    } catch {
      setActionFeedback({ type: 'error', text: 'تعذر الاتصال بالخادم.' });
    } finally {
      setActionLoading(false);
    }
  };

  // إرسال التقييم والتعليق بعد اكتمال الخدمة
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const response = await fetch(`${API_BASE}/service-requests/${selectedRequest.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          rating: Number(ratingValue),
          review_comment: reviewComment,
        }),
      });
      const data = await response.json();

      if (response.ok && data.status) {
        setSelectedRequest(data.data);
        setReviewComment('');
        setActionFeedback({ type: 'success', text: data.message });
        fetchRequests();
      } else {
        setActionFeedback({ type: 'error', text: data.message || 'تعذر إرسال التقييم.' });
      }
    } catch {
      setActionFeedback({ type: 'error', text: 'تعذر الاتصال بالخادم.' });
    } finally {
      setActionLoading(false);
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
          📋 إدارة واستعراض الطلبات (US-302 & US-303)
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

      {/* القسم الأول: استعراض الطلبات وإدارة حالتها وتقييمها (US-302 & US-303) */}
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
                تابع حالة طلباتك، حدّث حالة التنفيذ، أو أضف تقييمك بعد اكتمال الخدمة.
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
                <option value="cancelled">ملغي (Cancelled)</option>
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
                      {req.rating && (
                        <span style={{ fontSize: 13, color: '#d97706', fontWeight: 700 }}>
                          ⭐ {req.rating}/5
                        </span>
                      )}
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
                      : 'التفاصيل والإجراءات'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* بطاقة عرض التفاصيل الكاملة وإجراءات تحديث الحالة والإلغاء والتقييم (US-303) */}
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
                  تفاصيل وإدارة الطلب رقم #{selectedRequest.id}
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
                  ✕ إغلاق
                </button>
              </div>

              {actionFeedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 14,
                    backgroundColor: actionFeedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: actionFeedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${actionFeedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    fontWeight: 600,
                  }}
                >
                  {actionFeedback.text}
                </div>
              )}

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
                  marginBottom: 16,
                }}
              >
                <span style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 4 }}>
                  وصف المشكلة الكامل:
                </span>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{selectedRequest.problem_description}</p>
              </div>

              {/* لوحة إجراءات الفني (تحديث الحالة) */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'accepted') && (
                <div
                  style={{
                    background: '#ffffff',
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    marginBottom: 14,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 8, color: '#0f172a' }}>
                    🛠️ إجراءات الفني (تحديث حالة الطلب):
                  </strong>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleStatusUpdate('accepted')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#2563eb',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✓ قبول الطلب
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleStatusUpdate('rejected')}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ رفض الطلب
                        </button>
                      </>
                    )}
                    {selectedRequest.status === 'accepted' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleStatusUpdate('completed')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#16a34a',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✅ إكمال الخدمة
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* لوحة إلغاء الطلب من طرف العميل */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'accepted') && (
                <form
                  onSubmit={handleCancelRequest}
                  style={{
                    background: '#fffbeb',
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid #fde68a',
                    marginBottom: 14,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 6, color: '#92400e' }}>
                    🚫 إلغاء الطلب (للعميل):
                  </strong>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#78350f' }}>
                    أدخل رقم هاتفك المسجل في الطلب لتأكيد الإلغاء قبل اكتمال الخدمة:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={cancelPhone}
                      onChange={(e) => setCancelPhone(e.target.value)}
                      placeholder="رقم هاتف العميل"
                      required
                      style={{
                        flex: 1,
                        minWidth: 180,
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid #fcd34d',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={actionLoading}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#b45309',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      تأكيد إلغاء الطلب
                    </button>
                  </div>
                </form>
              )}

              {/* لوحة التقييم بعد اكتمال الخدمة (completed) */}
              {selectedRequest.status === 'completed' && (
                <div
                  style={{
                    background: '#ffffff',
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                  }}
                >
                  {selectedRequest.rating ? (
                    <div>
                      <strong style={{ display: 'block', marginBottom: 6, color: '#166534' }}>
                        ⭐ تقييم العميل للخدمة:
                      </strong>
                      <div style={{ fontSize: 18, color: '#d97706', fontWeight: 700 }}>
                        {'★'.repeat(selectedRequest.rating)}
                        {'☆'.repeat(5 - selectedRequest.rating)} ({selectedRequest.rating} من 5)
                      </div>
                      {selectedRequest.review_comment && (
                        <p style={{ margin: '6px 0 0', color: '#334155' }}>
                          «{selectedRequest.review_comment}»
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit}>
                      <strong style={{ display: 'block', marginBottom: 8, color: '#0f172a' }}>
                        ⭐ قيّم جودة الخدمة بعد الاكتمال:
                      </strong>
                      <div style={{ display: 'grid', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                            التقييم (من 1 إلى 5 نجوم):
                          </label>
                          <select
                            value={ratingValue}
                            onChange={(e) => setRatingValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: 8,
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            <option value="5">5 - ممتاز جداً ⭐⭐⭐⭐⭐</option>
                            <option value="4">4 - جيد جداً ⭐⭐⭐⭐</option>
                            <option value="3">3 - جيد ⭐⭐⭐</option>
                            <option value="2">2 - مقبول ⭐⭐</option>
                            <option value="1">1 - ضعيف ⭐</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                            تعليقك على الخدمة (اختياري):
                          </label>
                          <textarea
                            rows="2"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="اكتب ملاحظاتك حول التزام الفني وجودة العمل..."
                            style={{
                              width: '100%',
                              padding: 8,
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="nav-cta"
                          style={{ padding: '10px 16px', cursor: 'pointer' }}
                        >
                          إرسال التقييم
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
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
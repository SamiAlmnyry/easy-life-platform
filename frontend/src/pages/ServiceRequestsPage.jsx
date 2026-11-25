import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function ServiceRequestsPage() {
  const [searchParams] = useSearchParams();
  const initialWorkerId = searchParams.get('worker_id') || '1';

  const [formData, setFormData] = useState({
    worker_id: initialWorkerId,
    client_name: '',
    client_phone: '',
    problem_description: '',
    location: '',
  });

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdRequest, setCreatedRequest] = useState(null);

  useEffect(() => {
    axiosClient
      .get('/workers')
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setWorkers(list);
        }
      })
      .catch(() => {
        setWorkers([
          { id: 1, name: 'م. خالد المنصوري — كهربائي منازل (موثق)' },
          { id: 2, name: 'أ. صالح الحميري — سباك وصيانة صحية (موثق)' },
          { id: 3, name: 'م. طارق العولقي — صيانة تكييف وتبريد (موثق)' },
        ]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});
    setCreatedRequest(null);

    try {
      const response = await axiosClient.post('/service-requests', {
        ...formData,
        worker_id: Number(formData.worker_id),
      });

      setSuccessMsg(
        response.data?.message || 'تم إرسال طلب الصيانة بنجاح وهو الآن قيد الانتظار.'
      );
      setCreatedRequest(response.data?.data || null);

      setFormData((prev) => ({
        ...prev,
        client_name: '',
        client_phone: '',
        problem_description: '',
        location: '',
      }));
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setErrorMsg('يرجى تصحيح الأخطاء الموضحة في النموذج أدناه.');
      } else {
        setErrorMsg(
          err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 0' }}>
      <div className="card" style={{ padding: '28px', borderRadius: '14px' }}>
        <div style={{ marginBottom: '22px' }}>
          <span
            style={{
              display: 'inline-block',
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '10px',
            }}
          >
            طلب خدمة بدون تسجيل حساب
          </span>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>
            تقديم طلب عمل أو صيانة جديد
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            أدخل بياناتك ووصف المشكلة وسيتم إرسال طلبك مباشرة إلى الفني الموثق.
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#065f46',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}
          >
            <strong>✓ {successMsg}</strong>
            {createdRequest && (
              <div style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                رقم الطلب المرجعي: <strong>#{createdRequest.id}</strong> | الحالة:{' '}
                <strong>قيد الانتظار (Pending)</strong>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #ef4444',
              color: '#991b1b',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
            }}
          >
            <strong>⚠ {errorMsg}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label
              htmlFor="worker_id"
              style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}
            >
              الفني المطلوب *
            </label>
            <select
              id="worker_id"
              name="worker_id"
              value={formData.worker_id}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                backgroundColor: '#fff',
              }}
              required
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name || `فني موثق #${w.id}`}
                </option>
              ))}
            </select>
            {fieldErrors.worker_id && (
              <small style={{ color: '#dc2626' }}>{fieldErrors.worker_id[0]}</small>
            )}
          </div>

          <div>
            <label
              htmlFor="client_name"
              style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}
            >
              الاسم الكامل *
            </label>
            <input
              id="client_name"
              type="text"
              name="client_name"
              placeholder="مثال: أحمد محمد علي"
              value={formData.client_name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
              }}
              required
            />
            {fieldErrors.client_name && (
              <small style={{ color: '#dc2626' }}>{fieldErrors.client_name[0]}</small>
            )}
          </div>

          <div>
            <label
              htmlFor="client_phone"
              style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}
            >
              رقم الهاتف للتواصل *
            </label>
            <input
              id="client_phone"
              type="tel"
              name="client_phone"
              placeholder="مثال: 777123456"
              value={formData.client_phone}
              onChange={handleChange}
              dir="ltr"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                textAlign: 'right',
              }}
              required
            />
            {fieldErrors.client_phone && (
              <small style={{ color: '#dc2626' }}>{fieldErrors.client_phone[0]}</small>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}
            >
              الموقع / العنوان التفصيلي *
            </label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="مثال: صنعاء - شارع حدة - جولة المصباحي"
              value={formData.location}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
              }}
              required
            />
            {fieldErrors.location && (
              <small style={{ color: '#dc2626' }}>{fieldErrors.location[0]}</small>
            )}
          </div>

          <div>
            <label
              htmlFor="problem_description"
              style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}
            >
              وصف المشكلة أو الخدمة المطلوبة *
            </label>
            <textarea
              id="problem_description"
              name="problem_description"
              rows="4"
              placeholder="اشرح تفاصيل المشكلة بوضوح (10 أحرف على الأقل)..."
              value={formData.problem_description}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                resize: 'vertical',
              }}
              required
            />
            {fieldErrors.problem_description && (
              <small style={{ color: '#dc2626' }}>
                {fieldErrors.problem_description[0]}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '6px',
            }}
          >
            {loading ? 'جاري إرسال الطلب...' : 'إرسال طلب الصيانة الآن'}
          </button>
        </form>
      </div>
    </div>
  );
}
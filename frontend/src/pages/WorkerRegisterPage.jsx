import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import './WorkerRegisterPage.css';

const INITIAL_FORM = {
  name: '',
  phone: '',
  profession_id: '',
  region: '',
  password: '',
  password_confirmation: '',
};

export default function WorkerRegisterPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [proofFile, setProofFile] = useState(null);

  const [professions, setProfessions] = useState([]);
  const [loadingProfessions, setLoadingProfessions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const avatarInputRef = useRef(null);
  const proofInputRef = useRef(null);

  useEffect(() => {
    axiosClient
      .get('/home')
      .then((res) => {
        const list = res.data?.data?.professions || [];
        setProfessions(list);
      })
      .catch(() => {
        setGeneralError('تعذر جلب قائمة التخصصات. تأكد من تشغيل سيرفر Laravel.');
      })
      .finally(() => {
        setLoadingProfessions(false);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : '');
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (errors.proof_document) {
      setErrors((prev) => ({ ...prev, proof_document: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSuccessData(null);
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('profession_id', formData.profession_id);
      payload.append('region', formData.region);
      payload.append('password', formData.password);
      payload.append('password_confirmation', formData.password_confirmation);

      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }
      if (proofFile) {
        payload.append('proof_document', proofFile);
      }

      const res = await axiosClient.post('/workers/register', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessData({
        message: res.data?.message || 'تم تسجيل حسابك بنجاح.',
        worker: res.data?.worker || null,
      });

      setFormData(INITIAL_FORM);
      setAvatarFile(null);
      setAvatarPreview('');
      setProofFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      if (proofInputRef.current) proofInputRef.current.value = '';
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
        setGeneralError('يرجى مراجعة الحقول المظللة بالأحمر وتصحيح الأخطاء.');
      } else {
        setGeneralError(
          err.response?.data?.message ||
            'حدث خطأ أثناء الاتصال بالخادم. تأكد من تشغيل سيرفر Laravel وحاول مجدداً.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="worker-register-page">
      <section className="register-hero">
        <span className="hero-badge">✓ بوابة انضمام الفنيين والمهندسين</span>
        <h1>تسجيل حساب فني أو مهندس جديد</h1>
        <p>
          أنشئ ملفك المهني وارفع وثائق إثبات الهوية والخبرة لتوثيق حسابك من قِبل
          إدارة المنصة والبدء باستقبال طلبات الصيانة من العملاء في منطقتك.
        </p>
      </section>

      <div className="register-layout">
        <section className="register-card">
          <h2 className="register-card-title">بيانات الحساب والوثائق</h2>
          <p className="register-card-sub">
            جميع الحقول المميزة بعلامة (*) إلزامية لإتمام طلب التسجيل والتوثيق.
          </p>

          {successData && (
            <div className="alert-box alert-success">
              <div>{successData.message}</div>
              {successData.worker && (
                <div style={{ marginTop: 8, fontSize: '0.86rem', fontWeight: 700 }}>
                  الاسم: {successData.worker.name} — التخصص:{' '}
                  {successData.worker.profession?.name || 'محدد'} — الحالة:{' '}
                  {successData.worker.is_verified ? 'موثق' : 'بانتظار التوثيق'}
                </div>
              )}
            </div>
          )}

          {generalError && (
            <div className="alert-box alert-error">{generalError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  الاسم الكامل
                  <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="مثال: أحمد صالح المعمري"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="field-error">{errors.name[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  رقم الهاتف
                  <span className="required-star">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="مثال: 771234567"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profession_id">
                  التخصص المهني
                  <span className="required-star">*</span>
                </label>
                <select
                  id="profession_id"
                  name="profession_id"
                  className={`form-control ${errors.profession_id ? 'is-invalid' : ''}`}
                  value={formData.profession_id}
                  onChange={handleChange}
                  disabled={loadingProfessions}
                >
                  <option value="">
                    {loadingProfessions
                      ? 'جاري تحميل التخصصات...'
                      : professions.length === 0
                      ? 'لا توجد تخصصات متاحة حالياً'
                      : '-- اختر تخصصك المهني --'}
                  </option>
                  {professions.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>
                {errors.profession_id && (
                  <span className="field-error">{errors.profession_id[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="region">
                  المنطقة / المدينة
                  <span className="required-star">*</span>
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                  placeholder="مثال: صنعاء - شارع حدة"
                  value={formData.region}
                  onChange={handleChange}
                />
                {errors.region && <span className="field-error">{errors.region[0]}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  كلمة المرور
                  <span className="required-star">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="8 أحرف على الأقل"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className="field-error">{errors.password[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password_confirmation">
                  تأكيد كلمة المرور
                  <span className="required-star">*</span>
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  className="form-control"
                  placeholder="أعد كتابة كلمة المرور"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  الصورة الشخصية
                  <span className="optional-tag">(اختياري — بحد أقصى 2 ميجابايت)</span>
                </label>
                <div className="upload-box">
                  <div className="upload-info">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="معاينة الصورة الشخصية"
                        className="avatar-preview"
                      />
                    ) : (
                      <div className="upload-icon">📷</div>
                    )}
                    <div className="upload-text">
                      <div className="upload-title">
                        {avatarFile ? avatarFile.name : 'اختر صورة شخصية واضحة'}
                      </div>
                      <div className="upload-hint">
                        الصيغ المدعومة: JPG, JPEG, PNG, WEBP
                      </div>
                    </div>
                  </div>
                  <label className="file-btn" htmlFor="avatar">
                    اختيار صورة
                  </label>
                  <input
                    ref={avatarInputRef}
                    id="avatar"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden-input"
                    onChange={handleAvatarChange}
                  />
                </div>
                {errors.avatar && <span className="field-error">{errors.avatar[0]}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  وثيقة إثبات الهوية والخبرة
                  <span className="required-star">*</span>
                  <span className="optional-tag">(بحد أقصى 5 ميجابايت)</span>
                </label>
                <div className="upload-box">
                  <div className="upload-info">
                    <div className="upload-icon">📄</div>
                    <div className="upload-text">
                      <div className="upload-title">
                        {proofFile
                          ? `${proofFile.name} (${(proofFile.size / 1024).toFixed(0)} KB)`
                          : 'ارفع بطاقة الهوية أو شهادة الخبرة'}
                      </div>
                      <div className="upload-hint">
                        الصيغ المدعومة: PDF, JPG, JPEG, PNG
                      </div>
                    </div>
                  </div>
                  <label className="file-btn" htmlFor="proof_document">
                    رفع الوثيقة
                  </label>
                  <input
                    ref={proofInputRef}
                    id="proof_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden-input"
                    onChange={handleProofChange}
                  />
                </div>
                {errors.proof_document && (
                  <span className="field-error">{errors.proof_document[0]}</span>
                )}
              </div>

              <div className="form-group full-width" style={{ marginTop: 6 }}>
                <button
                  type="submit"
                  className="btn-primary-submit"
                  disabled={submitting || loadingProfessions}
                >
                  {submitting
                    ? 'جاري إنشاء الحساب ورفع الوثائق...'
                    : 'إنشاء الحساب وإرسال طلب التوثيق'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className="register-card">
          <h3 className="register-card-title">آلية التوثيق والاعتماد</h3>
          <p className="register-card-sub">
            خطوات سريعة لضمان موثوقية جميع الفنيين والمهندسين في المنصة.
          </p>

          <div className="guide-list">
            <div className="guide-step">
              <span className="step-badge" style={{ marginBottom: 0 }}>1</span>
              <div>
                <h4>إدخال البيانات ورفع الوثائق</h4>
                <p>اختر تخصصك ومنطقتك وأرفق وثيقة تثبت هويتك وخبرتك المهنية.</p>
              </div>
            </div>

            <div className="guide-step">
              <span className="step-badge" style={{ marginBottom: 0 }}>2</span>
              <div>
                <h4>مراجعة إدارة المنصة</h4>
                <p>يتم تدقيق الوثائق المرفوعة للتأكد من صحتها قبل تفعيل الحساب.</p>
              </div>
            </div>

            <div className="guide-step">
              <span className="step-badge" style={{ marginBottom: 0 }}>3</span>
              <div>
                <h4>توثيق الحساب واستقبال الطلبات</h4>
                <p>بعد الاعتماد يظهر ملفك للعملاء ويمكنك إدارة حالة توفرك بحرية.</p>
              </div>
            </div>
          </div>

          <div className="status-note">
            ملاحظة: يبدأ كل حساب جديد بحالة «بانتظار التوثيق» ولا يظهر في نتائج
            البحث إلا بعد اعتماده من الإدارة.
          </div>

          <div style={{ marginTop: 18 }}>
            <Link
              to="/workers"
              style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem' }}
            >
              ← العودة إلى صفحة الفنيين
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
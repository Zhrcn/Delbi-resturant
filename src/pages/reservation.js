import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function Reservation() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  // Anti-spam protection
  const [honeypot, setHoneypot] = useState('');
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(formData.name)) {
      newErrors.name = true;
    }

    if (!emailRegex.test(formData.email)) {
      newErrors.email = true;
    }

    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = true;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.date = true;
    }

    if (!formData.time) {
      newErrors.time = true;
    }

    if (parseInt(formData.guests) < 1 || parseInt(formData.guests) > 10) {
      newErrors.guests = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Anti-spam checks
    if (honeypot) {
      return; // Bot detected
    }

    const now = Date.now();
    if (now - lastSubmissionTime < 60000) { // 1 minute cooldown
      setErrors({ submit: t('reservation.validation.cooldown') });
      return;
    }

    if (submissionCount >= 3) {
      setErrors({ submit: t('reservation.validation.tooManyAttempts') });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionCount(prev => prev + 1);
    setLastSubmissionTime(now);
    setErrors({}); // Clear previous errors

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('reservation.validation.verificationFailed'));
      }
      
      // Display test code in development mode
      if (data.testCode && process.env.NODE_ENV !== 'production') {
        setVerificationCode(data.testCode);
      }

      setShowVerification(true);
    } catch (error) {
      console.error('Verification error:', error);
      setErrors({ 
        submit: error.message || t('reservation.validation.verificationError') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get the verification code from the form
    const code = e.target.verificationCode.value;
    console.log('Submitting verification:', { email: formData.email, code });
    
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('reservation.validation.invalidCode'));
      }

      // Save reservation
      console.log('Verification successful, saving reservation:', formData);
      const reservationResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Log the full response for debugging
      console.log('Reservation API response status:', reservationResponse.status);
      
      const responseText = await reservationResponse.text();
      console.log('Reservation API raw response:', responseText);
      
      // Try to parse as JSON, but handle cases where it might not be valid JSON
      let reservationData;
      try {
        reservationData = JSON.parse(responseText);
        console.log('Reservation API response data:', reservationData);
      } catch (parseError) {
        console.error('Failed to parse reservation response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!reservationResponse.ok) {
        const errorMessage = reservationData?.error || t('reservation.validation.saveFailed');
        console.error('Reservation save failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Reservation saved successfully:', reservationData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error during verification/save:', error);
      setErrors({ verification: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update the guest options rendering
  const renderGuestOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      options.push(
        <option key={i} value={i}>
          {t(`reservation.form.guests.options.${i}`)}
        </option>
      );
    }
    return options;
  };  

  return (
    <>
      <Head>
        <title>{t('reservation.title')} - Delbi Restaurant</title>
        <meta name="description" content={t('reservation.description')} />
      </Head>

      <main className="min-h-screen bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: "url('/images/reservation.jpg')" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('reservation.title')}
            </h1>
            <p className="text-lg text-gray-300">
              {t('reservation.description')}
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-8 transform transition-all duration-500 ease-in-out">
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 dark:text-green-200 text-lg font-medium">{t('reservation.success')}</p>
              </div>
            </div>
          ) : showVerification ? (
            <form onSubmit={handleVerification} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="verificationCode">
                  {t('reservation.verification.label')}
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200"
                  placeholder={t('reservation.verification.placeholder')}
                  required
                />
                {errors.verification && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.verification}</p>
                )}
              </div>
              
              {/* Display test verification code in development mode */}
              {verificationCode && process.env.NODE_ENV !== 'production' && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Test Mode: Your verification code is <span className="font-bold">{verificationCode}</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg bg-primary-light dark:bg-primary-dark text-white font-semibold transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('reservation.verification.submitting')}
                    </span>
                  ) : (
                    t('reservation.verification.submit')
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
              {/* Honeypot field */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="name">
                    {t('reservation.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                    placeholder={t('reservation.form.name.placeholder')}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                    {t('reservation.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                    placeholder={t('reservation.form.email.placeholder')}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.email')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="phone">
                    {t('reservation.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                    placeholder={t('reservation.form.phone.placeholder')}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.phone')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="guests">
                    {t('reservation.form.guests')}
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.guests ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                  >
                    {renderGuestOptions()}
                  </select>
                  {errors.guests && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.guests')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="date">
                    {t('reservation.form.date')}
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.date ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.date')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="time">
                    {t('reservation.form.time')}
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.time ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200`}
                  />
                  {errors.time && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{t('reservation.validation.time')}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="specialRequests">
                  {t('reservation.form.specialRequests')}
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition duration-200"
                  rows="3"
                />
              </div>

              {errors.submit && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg bg-primary-light dark:bg-primary-dark text-white font-semibold transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('reservation.form.submitting')}
                    </span>
                  ) : (
                    t('reservation.form.submit')
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
} 
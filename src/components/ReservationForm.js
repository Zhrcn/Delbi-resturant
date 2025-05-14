import { useTranslation } from 'react-i18next';
import { useForm } from '../hooks/useForm';
import { formatNumber } from '../utils/helpers';

export default function ReservationForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const validationRules = {
    name: { required: true },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
    phone: { required: true, pattern: /^\+?[\d\s-]{10,}$/, message: 'Invalid phone number' },
    date: { required: true },
    time: { required: true },
    guests: { required: true }
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({}, validationRules);

  const onSubmit = async (formData) => {
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const renderGuestOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      const value = i.toString();
      const label = t(`reservation.form.guests.options.${value}`);
      const formattedNumber = formatNumber(i, i18n.language === 'ar' ? 'ar-SA' : 'en-US');
      options.push(
        <option key={value} value={value}>
          {formattedNumber} {label}
        </option>
      );
    }
    return options;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={values.name || ''}
          onChange={handleChange}
          placeholder={t('reservation.form.name.placeholder')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email || ''}
          onChange={handleChange}
          placeholder={t('reservation.form.email.placeholder')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.phone')}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={values.phone || ''}
          onChange={handleChange}
          placeholder={t('reservation.form.phone.placeholder')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.date')}
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={values.date || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.time')}
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={values.time || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
      </div>

      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.guests')}
        </label>
        <select
          id="guests"
          name="guests"
          value={values.guests || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">{t('reservation.form.guests')}</option>
          {renderGuestOptions()}
        </select>
        {errors.guests && <p className="mt-1 text-sm text-red-600">{errors.guests}</p>}
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('reservation.form.specialRequests')}
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={values.specialRequests || ''}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark disabled:opacity-50"
      >
        {isSubmitting ? t('reservation.form.submitting') : t('reservation.form.submit')}
      </button>
    </form>
  );
} 
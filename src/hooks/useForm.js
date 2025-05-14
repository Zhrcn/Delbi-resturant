import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldValues = values) => {
    const tempErrors = {};
    Object.keys(validationRules).forEach((key) => {
      const value = fieldValues[key];
      const rules = validationRules[key];

      if (rules.required && !value) {
        tempErrors[key] = 'This field is required';
      } else if (rules.pattern && !rules.pattern.test(value)) {
        tempErrors[key] = rules.message || 'Invalid format';
      } else if (rules.minLength && value.length < rules.minLength) {
        tempErrors[key] = `Minimum length is ${rules.minLength}`;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        tempErrors[key] = `Maximum length is ${rules.maxLength}`;
      } else if (rules.custom && !rules.custom(value)) {
        tempErrors[key] = rules.message || 'Invalid value';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [values, validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    try {
      if (validate()) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  };
}; 
import * as Yup from 'yup';

// Single Responsibility: Only handles validation logic
class ValidationService {
  static getLoginValidationSchema() {
    return Yup.object().shape({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });
  }

  static async validateForm(schema, values) {
    try {
      await schema.validate(values, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      return { isValid: false, errors };
    }
  }
}

export default ValidationService; 
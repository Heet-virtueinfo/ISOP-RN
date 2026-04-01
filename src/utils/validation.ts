export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Minimum 6 characters required';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Mobile number is required';
  const phoneRegex = /^[0-9+ ]{10,15}$/;
  if (!phoneRegex.test(phone.trim())) return 'Invalid phone number';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Full name is required';
  if (name.trim().length < 2) return 'Minimum 2 characters required';
  return null;
};

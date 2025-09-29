export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const cleanedValue = value.replace(/\D/g, '');
  
  // Apply mask based on length
  if (cleanedValue.length <= 10) {
    // Format: (XX) XXXX-XXXX
    return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Format: (XX) XXXXX-XXXX
    return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15); // Limit to max length
  }
};

export const removePhoneMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const validatePhoneNumber = (value: string): boolean => {
  const cleaned = removePhoneMask(value);
  return cleaned.length === 10 || cleaned.length === 11;
};
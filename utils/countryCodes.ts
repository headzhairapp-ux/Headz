export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', flag: '\u{1F1EE}\u{1F1F3}', minDigits: 10, maxDigits: 10 },
  { code: '+1', country: 'USA', flag: '\u{1F1FA}\u{1F1F8}', minDigits: 10, maxDigits: 10 },
  { code: '+1', country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', minDigits: 10, maxDigits: 10 },
  { code: '+44', country: 'UK', flag: '\u{1F1EC}\u{1F1E7}', minDigits: 10, maxDigits: 10 },
  { code: '+971', country: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', minDigits: 9, maxDigits: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', minDigits: 9, maxDigits: 9 },
  { code: '+61', country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', minDigits: 9, maxDigits: 9 },
  { code: '+65', country: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', minDigits: 8, maxDigits: 8 },
  { code: '+60', country: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}', minDigits: 9, maxDigits: 10 },
  { code: '+49', country: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', minDigits: 10, maxDigits: 11 },
  { code: '+33', country: 'France', flag: '\u{1F1EB}\u{1F1F7}', minDigits: 9, maxDigits: 9 },
  { code: '+39', country: 'Italy', flag: '\u{1F1EE}\u{1F1F9}', minDigits: 10, maxDigits: 10 },
  { code: '+34', country: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', minDigits: 9, maxDigits: 9 },
  { code: '+31', country: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', minDigits: 9, maxDigits: 9 },
  { code: '+55', country: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', minDigits: 10, maxDigits: 11 },
  { code: '+52', country: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', minDigits: 10, maxDigits: 10 },
  { code: '+81', country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', minDigits: 10, maxDigits: 10 },
  { code: '+82', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', minDigits: 9, maxDigits: 10 },
  { code: '+86', country: 'China', flag: '\u{1F1E8}\u{1F1F3}', minDigits: 11, maxDigits: 11 },
  { code: '+852', country: 'Hong Kong', flag: '\u{1F1ED}\u{1F1F0}', minDigits: 8, maxDigits: 8 },
  { code: '+63', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', minDigits: 10, maxDigits: 10 },
  { code: '+62', country: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', minDigits: 10, maxDigits: 12 },
  { code: '+66', country: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}', minDigits: 9, maxDigits: 9 },
  { code: '+27', country: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', minDigits: 9, maxDigits: 9 },
  { code: '+234', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', minDigits: 10, maxDigits: 10 },
  { code: '+254', country: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', minDigits: 9, maxDigits: 9 },
  { code: '+92', country: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', minDigits: 10, maxDigits: 10 },
  { code: '+880', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', minDigits: 10, maxDigits: 10 },
];

export const validatePhoneNumberForCountry = (
  phone: string,
  country: CountryCode,
): string | null => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (!digitsOnly) {
    return 'Phone number is required';
  }

  if (digitsOnly.length < country.minDigits) {
    return `Phone number must be at least ${country.minDigits} digits for ${country.country}`;
  }

  if (digitsOnly.length > country.maxDigits) {
    return `Phone number must be at most ${country.maxDigits} digits for ${country.country}`;
  }

  return null;
};

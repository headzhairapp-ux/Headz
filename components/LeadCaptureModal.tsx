import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { COUNTRY_CODES, CountryCode, validatePhoneNumberForCountry } from '../utils/countryCodes';
import { saveLeadCapture } from '../services/leadCaptureService';

interface LeadCaptureModalProps {
  userId?: string | null;
  onCancel?: () => void;
  onComplete: () => void;
}

interface CaptchaChallenge {
  question: string;
  answer: string;
}

const createCaptchaChallenge = (): CaptchaChallenge => {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 2;
  return {
    question: `${first} + ${second}`,
    answer: String(first + second),
  };
};

const cleanLocation = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').slice(0, 80);
};

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ userId, onCancel, onComplete }) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(() => createCaptchaChallenge());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRY_CODES;
    const search = countrySearch.toLowerCase();
    return COUNTRY_CODES.filter(
      (country) => country.country.toLowerCase().includes(search) || country.code.includes(search),
    );
  }, [countrySearch]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(createCaptchaChallenge());
    setCaptchaAnswer('');
  }, []);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, countryCode.maxDigits);
    setPhoneNumber(value);
    if (phoneError) setPhoneError(null);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setCountryCode(country);
    setIsDropdownOpen(false);
    setCountrySearch('');
    const nextPhoneNumber = phoneNumber.slice(0, country.maxDigits);
    setPhoneNumber(nextPhoneNumber);
    setPhoneError(nextPhoneNumber ? validatePhoneNumberForCountry(nextPhoneNumber, country) : null);
  };

  const validateForm = (): boolean => {
    setError(null);
    setPhoneError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return false;
    }

    const phoneValidationError = validatePhoneNumberForCountry(phoneNumber, countryCode);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return false;
    }

    if (!location.trim()) {
      setError('Please enter your location in uppercase letters and numbers.');
      return false;
    }

    if (!/^[A-Z0-9 ]+$/.test(location.trim())) {
      setError('Location can contain only uppercase letters, numbers, and spaces.');
      return false;
    }

    if (captchaAnswer.trim() !== captcha.answer) {
      setError('Captcha answer is incorrect. Please try again.');
      refreshCaptcha();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const { error: saveError } = await saveLeadCapture({
      name,
      countryCode: countryCode.code,
      phoneNumber,
      location,
      userId,
    });

    if (saveError) {
      setError('Could not submit your details. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onComplete();
  };

  useEffect(() => {
    const getFocusable = (): HTMLElement[] => {
      const root = dialogRef.current;
      if (!root) return [];
      const selector =
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
      );
    };

    requestAnimationFrame(() => {
      const focusables = getFocusable();
      focusables[0]?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusables = getFocusable();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-8 focus:outline-none"
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel and return home"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex justify-center mb-5">
          <img src="/logo.png" alt="HEADZ HAIR FIXING APP" className="h-14 object-contain rounded-lg" />
        </div>

        <h2 id={titleId} className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
          Enter Your Details
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Submit these details to continue to the application.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lead-name" className="block text-sm font-medium text-gray-600 mb-2">
              Name <span className="text-[#E1262D]">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 80))}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-600 mb-2">
              Mobile Number <span className="text-[#E1262D]">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  className="flex items-center gap-1 px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all min-w-[110px] justify-between"
                  disabled={isSubmitting}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="flex items-center gap-1">
                    <span>{countryCode.flag}</span>
                    <span className="text-sm">{countryCode.code}</span>
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(event) => setCountrySearch(event.target.value)}
                        placeholder="Search country..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] text-sm"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto" role="listbox">
                      {filteredCountries.map((country, index) => (
                        <button
                          key={`${country.code}-${country.country}-${index}`}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                            countryCode.code === country.code && countryCode.country === country.country
                              ? 'bg-gray-100'
                              : ''
                          }`}
                          role="option"
                          aria-selected={countryCode.code === country.code && countryCode.country === country.country}
                        >
                          <span>{country.flag}</span>
                          <span className="text-gray-900 text-sm flex-1">{country.country}</span>
                          <span className="text-gray-500 text-sm">{country.code}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                id="lead-phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter mobile number"
                className={`flex-1 min-w-0 px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all ${
                  phoneError ? 'border-[#E1262D]' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                autoComplete="tel-national"
              />
            </div>
            {phoneError && <p className="mt-1 text-sm text-[#E1262D]">{phoneError}</p>}
          </div>

          <div>
            <label htmlFor="lead-location" className="block text-sm font-medium text-gray-600 mb-2">
              Location <span className="text-[#E1262D]">*</span>
            </label>
            <input
              id="lead-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(cleanLocation(event.target.value))}
              placeholder="CITY AREA"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all"
              disabled={isSubmitting}
              autoComplete="address-level2"
            />
            <p className="mt-1 text-xs text-gray-500">Only uppercase letters, numbers, and spaces are accepted.</p>
          </div>

          <div>
            <label htmlFor="lead-captcha" className="block text-sm font-medium text-gray-600 mb-2">
              Captcha <span className="text-[#E1262D]">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center min-w-[104px] px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 font-semibold">
                {captcha.question}
              </div>
              <input
                id="lead-captcha"
                type="text"
                inputMode="numeric"
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="Answer"
                className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-colors"
                disabled={isSubmitting}
                aria-label="Refresh captcha"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !phoneNumber.trim() ||
              !location.trim() ||
              !captchaAnswer.trim()
            }
            className="w-full mt-2 px-6 py-3.5 bg-[#E1262D] hover:bg-[#B91C1C] text-white font-medium rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadCaptureModal;

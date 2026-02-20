import React, { useState } from 'react';

interface ProfileFormProps {
  email: string;
  onSubmit: (firstName: string, lastName: string, location?: string) => void;
  onSkip?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  email,
  onSubmit,
  onSkip,
  isLoading = false,
  error = null,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!firstName.trim()) {
      setValidationError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setValidationError('Last name is required');
      return;
    }

    onSubmit(firstName.trim(), lastName.trim(), location.trim() || undefined);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#E1262D] rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-500 text-sm">
          Just a few more details to get started
        </p>
        <p className="text-gray-400 text-xs mt-1">{email}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 mb-1">
            First Name <span className="text-[#E1262D]">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your first name"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all disabled:opacity-50"
            autoFocus
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 mb-1">
            Last Name <span className="text-[#E1262D]">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your last name"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Location (Optional) */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">
            Location <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., New York, USA"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{validationError || error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#E1262D] hover:bg-[#B91C1C] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>

        {/* Skip Option */}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="w-full text-center text-gray-500 hover:text-gray-600 text-sm transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;

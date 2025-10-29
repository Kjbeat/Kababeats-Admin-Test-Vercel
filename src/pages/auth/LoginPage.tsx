import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, CheckCircle } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForgotPassword,
    formState: { errors: forgotPasswordErrors },
    reset: resetForgotPassword,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(data);
      
      if (response.requiresTwoFactor) {
        setRequiresTwoFactor(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.requestPasswordReset(data.email);
      setForgotPasswordSuccess(true);
      resetForgotPassword();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setError(null);
    setForgotPasswordSuccess(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordSuccess(false);
    setError(null);
    resetForgotPassword();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KabaBeats Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@kababeats.com"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {requiresTwoFactor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Authentication Code</label>
                <input
                  {...register('twoFactorCode')}
                  type="text"
                  placeholder="Enter 6-digit code"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.twoFactorCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.twoFactorCode.message}</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80"
              onClick={handleForgotPasswordClick}
            >
              Forgot your password?
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Default credentials for testing:</p>
          <p className="mt-1">
            <strong>Email:</strong> admin@kababeats.com<br />
            <strong>Password:</strong> admin123456
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={handleCloseForgotPassword}
          onSubmit={onForgotPasswordSubmit}
          register={registerForgotPassword}
          errors={forgotPasswordErrors}
          isLoading={isLoading}
          error={error}
          success={forgotPasswordSuccess}
        />
      )}
    </div>
  );
}

// Forgot Password Modal Component
function ForgotPasswordModal({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
  error,
  success
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ForgotPasswordFormData) => void;
  register: ReturnType<typeof useForm<ForgotPasswordFormData>>['register'];
  errors: ReturnType<typeof useForm<ForgotPasswordFormData>>['formState']['errors'];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {success ? 'Check Your Email' : 'Reset Password'}
                  </h3>
                  <div className="mt-4">
                    {success ? (
                      <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <p className="text-sm text-gray-500">
                          We've sent a password reset link to your email address. 
                          Please check your inbox and follow the instructions to reset your password.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500 mb-4">
                          Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="admin@kababeats.com"
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="px-4 sm:px-6">
                <div className="rounded-md bg-red-50 p-3 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {success ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

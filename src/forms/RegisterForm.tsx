import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Landlord', 'Agent', 'Tenant']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  loading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'Landlord'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
        <input
          {...register('name')}
          type="text"
          className="w-full"
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
        <input
          {...register('email')}
          type="email"
          className="w-full"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
        <select {...register('role')} className="w-full">
          <option value="Landlord">Landlord</option>
          <option value="Agent">Agent</option>
          <option value="Tenant">Tenant</option>
        </select>
        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full"
          placeholder="Create a password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
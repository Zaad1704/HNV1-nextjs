import ResetPasswordPage from '@/components/pages/ResetPasswordPage';

export default function ResetPassword({ params }: { params: { token: string } }) {
  return <ResetPasswordPage token={params.token} />;
}

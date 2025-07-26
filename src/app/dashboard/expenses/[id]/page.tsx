import ExpenseDetailsPage from '@/components/pages/ExpenseDetailsPageUniversal';

export default function ExpenseDetails({ params }: { params: { id: string } }) {
  return <ExpenseDetailsPage expenseId={params.id} />;
}

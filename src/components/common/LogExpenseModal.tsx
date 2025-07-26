// frontend/src/components/common/LogExpenseModal.tsx
import React, { useState } from 'react';
import apiClient from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { X, UploadCloud } from 'lucide-react';

const fetchManagedAgents = async () => {
    const { data } = await apiClient.get('/users/my-agents');
    return data.data;
};

const fetchProperties = async () => {
    const { data } = await apiClient.get('/properties');
    return data.data;
};

const createExpense = async (formData: FormData) => {
    const { data } = await apiClient.post('/expenses', formData);
    return data.data;
};

const LogExpenseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: '', amount: '', category: 'Repairs', date: new Date().toISOString().split('T')[0], propertyId: '', paidToAgentId: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const isSalary = formData.category === 'Salary';

  const { data: properties, isLoading: isLoadingProperties } = useQuery({ queryKey: ['propertiesForExpense'], queryFn: fetchProperties, enabled: isOpen });
  const { data: agents, isLoading: isLoadingAgents } = useQuery({ queryKey: ['managedAgentsForExpense'], queryFn: fetchManagedAgents, enabled: isOpen && user?.role === 'Landlord' });

  const mutation = useMutation({
      mutationFn: createExpense,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['expenses']});
        queryClient.invalidateQueries({ queryKey: ['financialSummary']});
        onClose();
      },
      onError: (err: any) => setError(err.response?.data?.message || 'Failed to log expense.')
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setDocumentFile(e.target.files[0]);
    } else {
        setDocumentFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const submissionForm = new FormData();
    Object.entries(formData).forEach(([key, value]) => submissionForm.append(key, value));
    if (documentFile) {
        submissionForm.append('document', documentFile);
    }
    mutation.mutate(submissionForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-3xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark">
        <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
          <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{t('expense.add_expense')}</h2>
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Description</label>
            <input type="text" name="description" id="description" required value={formData.description} onChange={handleChange}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Amount ($)</label>
              <input type="number" step="0.01" name="amount" id="amount" required value={formData.amount} onChange={handleChange}/>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Date</label>
              <input type="date" name="date" id="date" required value={formData.date} onChange={handleChange}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Category</label>
                <select name="category" id="category" required value={formData.category} onChange={handleChange}>
                    <option value="Repairs">{t('expense.repairs')}</option>
                    <option value="Utilities">{t('expense.utilities')}</option>
                    <option value="Management Fees">{t('expense.management_fees')}</option>
                    <option value="Insurance">{t('expense.insurance')}</option>
                    <option value="Taxes">{t('expense.taxes')}</option>
                    <option value="Salary">{t('expense.salary')}</option>
                    <option value="Other">{t('expense.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="propertyId" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Property</label>
                <select name="propertyId" id="propertyId" required value={formData.propertyId} onChange={handleChange} disabled={isLoadingProperties}>
                  <option value="">{isLoadingProperties ? 'Loading...' : 'Select Property'}</option>
                  {properties?.map((prop: any) => <option key={prop._id} value={prop._id}>{prop.name}</option>)}
                </select>
              </div>
          </div>

          {isSalary && user?.role === 'Landlord' && (
              <div>
                  <label htmlFor="paidToAgentId" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Paid To Agent</label>
                  <select name="paidToAgentId" id="paidToAgentId" value={formData.paidToAgentId} onChange={handleChange} disabled={isLoadingAgents}>
                      <option value="">{isLoadingAgents ? 'Loading Agents...' : 'Select Agent (Optional)'}</option>
                      {agents?.map((agent: any) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
                  </select>
              </div>
          )}

          <div>
              <label htmlFor="document" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Attach Document (Optional)</label>
              <input type="file" name="document" id="document" onChange={handleFileChange} className="mt-1 block w-full text-sm"/>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-light">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center justify-center gap-2">
                <UploadCloud size={16} /> {mutation.isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogExpenseModal;

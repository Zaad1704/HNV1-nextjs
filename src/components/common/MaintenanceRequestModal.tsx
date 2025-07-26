// frontend/src/components/common/MaintenanceRequestModal.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { X } from 'lucide-react';

const createRequest = async (newRequest: { category: string; description: string; }) => {
    const { data } = await apiClient.post('/maintenance', newRequest);
    return data.data;
};

const MaintenanceRequestModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      alert('Your request has been submitted successfully!');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit request.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ category, description });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-3xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark">
        <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
          <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">New Maintenance Request</h2>
          <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>General</option><option>Plumbing</option><option>Electrical</option><option>Appliances</option><option>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Describe the Issue</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
            
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-light">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="btn-primary">
                {mutation.isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequestModal;

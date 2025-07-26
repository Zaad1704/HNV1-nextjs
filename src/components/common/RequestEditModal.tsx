import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { X } from 'lucide-react';

interface RequestEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: string;
    resourceModel: string;
    approverId: string;
    onSuccess: () => void;
}

const RequestEditModal: React.FC<RequestEditModalProps> = ({ isOpen, onClose, resourceId, resourceModel, approverId, onSuccess }) => {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (requestData: { resourceId: string; resourceModel: string; reason: string; approverId: string; }) => 
            apiClient.post('/edit-requests', requestData),
        onSuccess: () => {
            alert('Your request has been sent to the Landlord for approval.');
            onSuccess(); // Callback to parent component
            onClose();   // Close the modal
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to send request.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!reason) {
            setError('A reason for the request is required.');
            return;
        }
        mutation.mutate({ resourceId, resourceModel, reason, approverId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">Request Permission to Edit</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm transition-all duration-200">{error}</div>}
                    
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Reason for Request</label>
                        <textarea 
                            id="reason" 
                            name="reason" 
                            rows={4} 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            required 
                            className="mt-1 w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" 
                            placeholder={`Explain why you need to edit this ${resourceModel} record.`}
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 transition-colors duration-200">
                            {mutation.isLoading ? 'Sending Request...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestEditModal;

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

// Interfaces for component props and data shapes
interface TenantOption { _id: string; name: string; unit: string; propertyId: { name: string }; }
interface IReminder { _id?: string; tenantId: TenantOption | string; type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder'; message?: string; frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; nextRunDate: string | Date; status: 'active' | 'inactive' | 'sent' | 'failed'; }
interface ReminderFormData { tenantId: string; type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder'; message: string; frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; nextRunDate: string; status: 'active' | 'inactive';}
interface ReminderFormModalProps { isOpen: boolean; onClose: () => void; onSaveSuccess: () => void; reminderToEdit?: IReminder; }

const fetchTenantsForReminder = async (): Promise<TenantOption[]> => {
    const { data } = await apiClient.get('/tenants');
    return data.data;
};

const ReminderFormModal: React.FC<ReminderFormModalProps> = ({ isOpen, onClose, onSaveSuccess, reminderToEdit }) => {
    const queryClient = useQueryClient();
    const isEditing = !!reminderToEdit;

    const [formData, setFormData] = useState<ReminderFormData>({
        tenantId: '', type: 'email_rent_reminder', message: '', frequency: 'monthly', nextRunDate: new Date().toISOString().split('T')[0], status: 'active',
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing && reminderToEdit) {
            setFormData({
                tenantId: typeof reminderToEdit.tenantId === 'object' ? reminderToEdit.tenantId._id : reminderToEdit.tenantId,
                type: reminderToEdit.type, message: reminderToEdit.message || '', frequency: reminderToEdit.frequency,
                nextRunDate: new Date(reminderToEdit.nextRunDate).toISOString().split('T')[0],
                status: reminderToEdit.status === 'sent' || reminderToEdit.status === 'failed' ? 'active' : reminderToEdit.status,
            });
        } else {
            setFormData({ tenantId: '', type: 'email_rent_reminder', message: '', frequency: 'monthly', nextRunDate: new Date().toISOString().split('T')[0], status: 'active', });
        }
    }, [isEditing, reminderToEdit, isOpen]);

    const { data: tenants, isLoading: isLoadingTenants } = useQuery({ queryKey: ['tenantsForReminder'], queryFn: fetchTenantsForReminder, enabled: isOpen });

    const mutation = useMutation({
        mutationFn: (data: ReminderFormData) => isEditing ? apiClient.put(`/reminders/${reminderToEdit?._id}`, data) : apiClient.post('/reminders', data),
        onSuccess: () => { onSaveSuccess(); onClose(); },
        onError: (err: any) => { setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} reminder.`); }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{isEditing ? 'Edit Reminder' : 'Create New Reminder'}</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-light-text dark:text-light-text-dark">
                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg transition-all duration-200">{error}</div>}

                    <div>
                        <label htmlFor="tenantId" className="block text-sm font-medium">Tenant</label>
                        <select name="tenantId" id="tenantId" value={formData.tenantId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" required disabled={isEditing}>
                            <option value="">{isLoadingTenants ? 'Loading...' : 'Select a Tenant'}</option>
                            {tenants?.map(tenant => (<option key={tenant._id} value={tenant._id}>{tenant.name} - Unit {tenant.unit} ({tenant.propertyId?.name})</option>))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium">Reminder Type</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" required>
                            <option value="email_rent_reminder">Email Rent Reminder</option>
                            <option value="app_rent_reminder">In-App Rent Reminder</option>
                            <option value="sms_rent_reminder">SMS Rent Reminder</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="frequency" className="block text-sm font-medium">Frequency</label>
                          <select name="frequency" id="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" required>
                              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                          </select>
                      </div>
                      <div>
                        <label htmlFor="nextRunDate" className="block text-sm font-medium">Next Send Date</label>
                        <input type="date" name="nextRunDate" id="nextRunDate" value={formData.nextRunDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" required/>
                      </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" required>
                            <option value="active">Active</option><option value="inactive">Inactive</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium">Custom Message (Optional)</label>
                        <textarea name="message" id="message" rows={3} value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 transition-colors duration-200">
                            {mutation.isLoading ? 'Saving...' : (isEditing ? 'Save Reminder' : 'Create Reminder')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderFormModal;

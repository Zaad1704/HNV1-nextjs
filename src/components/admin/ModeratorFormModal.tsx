import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';

// Define the list of available permissions for your platform
const AVAILABLE_PERMISSIONS = [
    { id: 'can_manage_users', label: 'Manage Users & Orgs' },
    { id: 'can_manage_billing', label: 'Manage Billing & Plans' },
    { id: 'can_manage_content', label: 'Manage Site Content' },
    { id: 'can_view_reports', label: 'View Platform Reports' }
];

const ModeratorFormModal = ({ isOpen, onClose, moderator }: { isOpen: boolean, onClose: () => void, moderator: any }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        permissions: [] as string[],
    });
    const [error, setError] = useState('');

    const isEditing = !!moderator;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: moderator.name,
                email: moderator.email,
                password: '', // Don't show existing password
                permissions: moderator.permissions || [],
            });
        } else {
            setFormData({ name: '', email: '', password: '', permissions: [] });
        }
    }, [moderator, isEditing, isOpen]);

    const mutation = useMutation({
        mutationFn: (modData: any) => {
            if (isEditing) {
                return apiClient.put(`/super-admin/moderators/${moderator._id}`, modData);
            }
            return apiClient.post('/super-admin/moderators', modData);
        },
        onSuccess: () => {
            onClose(); // Close the modal on success
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} moderator.`);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (permissionId: string) => {
        setFormData(prev => {
            const newPermissions = prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const dataToSubmit: any = {
            name: formData.name,
            email: formData.email,
            permissions: formData.permissions,
        };
        // Only include password if creating a new moderator
        if (!isEditing) {
            dataToSubmit.password = formData.password;
        }
        mutation.mutate(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg transition-all duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{isEditing ? 'Edit Moderator' : 'Add New Moderator'}</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark text-2xl transition-colors">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm transition-all duration-200">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-light-text dark:text-light-text-dark">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text dark:text-light-text-dark">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditing} className="mt-1 w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark disabled:opacity-70 disabled:cursor-not-allowed focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
                    </div>
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-light-text-dark">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-light-text dark:text-light-text-dark mb-2">Permissions</label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_PERMISSIONS.map(perm => (
                                <label key={perm.id} className="flex items-center space-x-2 p-2 border border-border-color dark:border-border-color-dark rounded-md bg-light-bg dark:bg-dark-bg transition-colors duration-150">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.permissions.includes(perm.id)}
                                        onChange={() => handlePermissionChange(perm.id)}
                                        className="h-4 w-4 rounded text-brand-primary dark:text-brand-secondary border-border-color dark:border-border-color-dark focus:ring-brand-primary transition-colors"
                                    />
                                    <span className="text-dark-text dark:text-dark-text-dark">{perm.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-border-color-dark transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:opacity-50 transition-colors duration-200">
                            {mutation.isPending ? 'Saving...' : 'Save Moderator'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModeratorFormModal;

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import RoleGuard from '@/RoleGuard';

interface MoreMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: {
        href?: string;
        action?: () => void;
        icon: React.ElementType;
        label: string;
        roles?: string[];
    }[];
    userRole: string | undefined;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose, navItems, userRole }) => {
    // Prevent body scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 z-[9998] md:hidden"
                onClick={onClose}
                style={{
                    backdropFilter: 'blur(8px)', 
                    WebkitBackdropFilter: 'blur(8px)',
                    touchAction: 'none'
                }}
            ></div>
            
            {/* Sliding Panel from the right */}
            <div 
                className="fixed top-0 right-0 h-full w-4/5 max-w-sm shadow-lg z-[9999] md:hidden"
                style={{
                    background: 'rgba(0, 0, 0, 0.85)', 
                    backdropFilter: 'blur(10px)', 
                    WebkitBackdropFilter: 'blur(10px)', 
                    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.5)',
                    overscrollBehavior: 'contain'
                }}
            >
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold text-white">More Options</h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 p-2 rounded-full bg-white/5"
                        style={{
                            touchAction: 'manipulation',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map(item => (
                        <RoleGuard key={item.label} allowed={item.roles || ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']}>
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    onClick={onClose}
                                    className="flex items-center space-x-4 p-4 rounded-lg text-white bg-white/5"
                                    style={{
                                        touchAction: 'manipulation',
                                        WebkitTapHighlightColor: 'transparent',
                                        minHeight: '56px'
                                    }}
                                >
                                    <item.icon size={24} className="text-blue-400" />
                                    <span className="font-semibold text-base">{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { item.action?.(); onClose(); }}
                                    className="flex items-center space-x-4 p-4 rounded-lg text-white bg-white/5 w-full text-left"
                                    style={{
                                        touchAction: 'manipulation',
                                        WebkitTapHighlightColor: 'transparent',
                                        minHeight: '56px'
                                    }}
                                >
                                    <item.icon size={24} className="text-blue-400" />
                                    <span className="font-semibold text-base">{item.label}</span>
                                </button>
                            )}
                        </RoleGuard>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default MoreMenuModal;

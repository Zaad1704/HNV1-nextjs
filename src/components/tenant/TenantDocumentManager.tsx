'use client';
import React from 'react';
import { FileText, Upload, Download, Eye, Trash2, Plus, Calendar, User, Shield } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'lease' | 'id' | 'income' | 'reference' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  isConfidential: boolean;
}

interface TenantDocumentManagerProps {
  tenantId: string;
  tenantName: string;
  className?: string;
}

const TenantDocumentManager: React.FC<TenantDocumentManagerProps> = ({
  tenantId,
  tenantName,
  className = ''
}) => {
  const [documents, setDocuments] = React.useState<Document[]>([
    {
      id: '1',
      name: 'Lease Agreement 2024.pdf',
      type: 'lease',
      url: '/documents/lease-2024.pdf',
      size: 2048000,
      uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Property Manager',
      isConfidential: true
    },
    {
      id: '2',
      name: 'Government ID Copy.jpg',
      type: 'id',
      url: '/documents/govt-id.jpg',
      size: 1024000,
      uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Tenant',
      isConfidential: true
    },
    {
      id: '3',
      name: 'Income Statement.pdf',
      type: 'income',
      url: '/documents/income.pdf',
      size: 512000,
      uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      uploadedBy: 'Tenant',
      isConfidential: true
    }
  ]);

  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadData, setUploadData] = React.useState({
    name: '',
    type: 'other',
    isConfidential: false
  });

  const documentTypes = [
    { value: 'lease', label: 'Lease Agreement', icon: FileText, color: 'blue' },
    { value: 'id', label: 'ID Document', icon: Shield, color: 'red' },
    { value: 'income', label: 'Income Proof', icon: Calendar, color: 'green' },
    { value: 'reference', label: 'Reference Letter', icon: User, color: 'purple' },
    { value: 'other', label: 'Other', icon: FileText, color: 'gray' }
  ];

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(t => t.value === type);
    const Icon = docType?.icon || FileText;
    return <Icon size={20} className={`text-${docType?.color || 'gray'}-600`} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: uploadData.name,
      type: uploadData.type as any,
      url: `/documents/${uploadData.name}`,
      size: Math.floor(Math.random() * 2000000) + 100000,
      uploadedAt: new Date(),
      uploadedBy: 'Property Manager',
      isConfidential: uploadData.isConfidential
    };

    setDocuments(prev => [newDoc, ...prev]);
    setUploadData({ name: '', type: 'other', isConfidential: false });
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-blue-600" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">Document Manager</h3>
                <p className="text-sm text-gray-600">Manage documents for {tenantName}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              <Upload size={16} />
              Upload Document
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Document Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-blue-800">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{documents.filter(d => d.isConfidential).length}</div>
              <div className="text-sm text-red-800">Confidential</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{documents.filter(d => d.type === 'lease').length}</div>
              <div className="text-sm text-green-800">Lease Docs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(documents.reduce((sum, d) => sum + d.size, 0))}
              </div>
              <div className="text-sm text-purple-800">Total Size</div>
            </div>
          </div>

          {/* Document Categories */}
          {Object.keys(groupedDocuments).length > 0 ? (
            <div className="space-y-6">
              {documentTypes.map(type => {
                const docs = groupedDocuments[type.value] || [];
                if (docs.length === 0) return null;

                return (
                  <div key={type.value}>
                    <div className="flex items-center gap-2 mb-3">
                      <type.icon size={18} className={`text-${type.color}-600`} />
                      <h4 className="font-semibold text-gray-900">{type.label}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {docs.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {docs.map(doc => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getDocumentIcon(doc.type)}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 truncate">{doc.name}</h5>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>{formatFileSize(doc.size)}</span>
                                  <span>•</span>
                                  <span>{doc.uploadedAt.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            {doc.isConfidential && (
                              <Shield size={16} className="text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Uploaded by {doc.uploadedBy}
                            </span>
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={14} />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
              <p className="text-gray-600 mb-4">Upload documents for {tenantName}</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Upload First Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter document name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={uploadData.isConfidential}
                    onChange={(e) => setUploadData({...uploadData, isConfidential: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="confidential" className="text-sm text-gray-700">
                    Mark as confidential
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadData.name}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantDocumentManager;
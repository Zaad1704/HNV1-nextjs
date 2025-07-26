import React from 'react';
import { Tag, Plus, X, Edit, Save, MessageSquare, Star, AlertTriangle } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  priority: 'low' | 'normal' | 'high';
  isPrivate: boolean;
}

interface TenantTag {
  id: string;
  name: string;
  color: string;
  category: 'status' | 'behavior' | 'preference' | 'custom';
}

interface TenantNotesAndTagsProps {
  tenantId: string;
  tenantName: string;
  className?: string;
}

const TenantNotesAndTags: React.FC<TenantNotesAndTagsProps> = ({
  tenantId,
  tenantName,
  className = ''
}) => {
  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: '1',
      content: 'Tenant prefers email communication over phone calls. Very responsive to maintenance requests.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: 'Property Manager',
      priority: 'normal',
      isPrivate: false
    },
    {
      id: '2',
      content: 'Has two cats. Make sure to schedule pet-friendly maintenance visits.',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdBy: 'Maintenance Team',
      priority: 'high',
      isPrivate: false
    }
  ]);

  const [tags, setTags] = React.useState<TenantTag[]>([
    { id: '1', name: 'Excellent Tenant', color: 'green', category: 'status' },
    { id: '2', name: 'Pet Owner', color: 'blue', category: 'preference' },
    { id: '3', name: 'Prefers Email', color: 'purple', category: 'preference' },
    { id: '4', name: 'Long Term', color: 'orange', category: 'behavior' }
  ]);

  const [newNote, setNewNote] = React.useState('');
  const [newTag, setNewTag] = React.useState('');
  const [editingNote, setEditingNote] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');

  const predefinedTags = [
    { name: 'Excellent Tenant', color: 'green', category: 'status' },
    { name: 'Good Tenant', color: 'blue', category: 'status' },
    { name: 'Late Payer', color: 'red', category: 'behavior' },
    { name: 'Pet Owner', color: 'purple', category: 'preference' },
    { name: 'Quiet', color: 'gray', category: 'behavior' },
    { name: 'Responsive', color: 'teal', category: 'behavior' },
    { name: 'Long Term', color: 'orange', category: 'behavior' },
    { name: 'Prefers Email', color: 'indigo', category: 'preference' },
    { name: 'Prefers Phone', color: 'pink', category: 'preference' }
  ];

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date(),
      createdBy: 'Property Manager',
      priority: 'normal',
      isPrivate: false
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const addTag = (tagName: string, color: string = 'blue', category: string = 'custom') => {
    if (tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) return;

    const tag: TenantTag = {
      id: Date.now().toString(),
      name: tagName,
      color,
      category: category as any
    };

    setTags(prev => [...prev, tag]);
    setNewTag('');
  };

  const removeTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const saveEditNote = () => {
    if (!editContent.trim()) return;

    setNotes(prev => prev.map(note => 
      note.id === editingNote 
        ? { ...note, content: editContent.trim() }
        : note
    ));
    setEditingNote(null);
    setEditContent('');
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={14} className="text-red-500" />;
      case 'normal': return <MessageSquare size={14} className="text-blue-500" />;
      case 'low': return <MessageSquare size={14} className="text-gray-500" />;
      default: return <MessageSquare size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-900">Notes & Tags</h3>
        <p className="text-sm text-gray-600">Track important information about {tenantName}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Tags</h4>
            <span className="text-sm text-gray-500">{tags.length} tags</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${tag.color}-100 text-${tag.color}-800`}
              >
                <Tag size={12} />
                {tag.name}
                <button
                  onClick={() => removeTag(tag.id)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
              placeholder="Add new tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              Add
            </button>
          </div>

          {/* Predefined Tags */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1">
              {predefinedTags
                .filter(predefined => !tags.some(tag => tag.name === predefined.name))
                .slice(0, 6)
                .map((predefined, index) => (
                <button
                  key={index}
                  onClick={() => addTag(predefined.name, predefined.color, predefined.category)}
                  className={`px-2 py-1 text-xs rounded-full border border-${predefined.color}-300 text-${predefined.color}-700 hover:bg-${predefined.color}-50`}
                >
                  {predefined.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Notes</h4>
            <span className="text-sm text-gray-500">{notes.length} notes</span>
          </div>

          {/* Add Note */}
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this tenant..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                <Plus size={14} />
                Add Note
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notes.map(note => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(note.priority)}
                    <span className="text-sm font-medium text-gray-900">{note.createdBy}</span>
                    <span className="text-xs text-gray-500">
                      {note.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditNote(note)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                
                {editingNote === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditNote}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        <Save size={10} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                )}
              </div>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notes yet. Add your first note above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantNotesAndTags;
import React from 'react';
import { Trash2, Edit, Check, X, Eye } from 'lucide-react';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onView?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showComplete?: boolean;
  showView?: boolean;
  size?: 'sm' | 'md';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onComplete,
  onView,
  showEdit = true,
  showDelete = true,
  showComplete = false,
  showView = false,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 16 : 20;
  const buttonClass = size === 'sm' 
    ? 'p-2 rounded-lg hover:bg-gray-100 transition-colors'
    : 'p-3 rounded-xl hover:bg-gray-100 transition-colors';

  return (
    <div className="flex items-center gap-1">
      {showView && onView && (
        <button
          onClick={onView}
          className={`${buttonClass} text-blue-600 hover:text-blue-800`}
          title="View"
        >
          <Eye size={iconSize} />
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className={`${buttonClass} text-gray-600 hover:text-gray-800`}
          title="Edit"
        >
          <Edit size={iconSize} />
        </button>
      )}
      
      {showComplete && onComplete && (
        <button
          onClick={onComplete}
          className={`${buttonClass} text-green-600 hover:text-green-800`}
          title="Mark Complete"
        >
          <Check size={iconSize} />
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className={`${buttonClass} text-red-600 hover:text-red-800`}
          title="Delete"
        >
          <Trash2 size={iconSize} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
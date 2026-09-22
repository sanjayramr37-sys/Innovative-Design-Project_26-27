import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SiloManagementForm } from './SiloManagementForm';

export const EditMedicationModal = ({
  medication,
  isOpen,
  onClose,
  onSave,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !medication) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 id="edit-modal-title" className="text-base font-bold text-slate-800">
            Edit Scheduled Medication
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <SiloManagementForm
            initialValues={medication}
            isEditing={true}
            onCancel={onClose}
            onSubmit={async (values) => {
              await onSave(medication._id, values);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

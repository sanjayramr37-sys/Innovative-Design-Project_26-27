import React, { useState, useMemo } from 'react';
import { Pill, Search } from 'lucide-react';
import { MedicationItem } from './MedicationItem';
import { getMedicationStatus, STATUS_TYPES } from '../../utils/statusUtils';

export const MedicationList = ({
  medications = [],
  onToggleStatus,
  onToggleSlotStatus,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeds = useMemo(() => {
    return medications.filter((med) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        med.medicineName.toLowerCase().includes(query) ||
        med.notes?.toLowerCase().includes(query) ||
        `silo ${med.siloId}`.includes(query);

      if (!matchesSearch) return false;

      const status = getMedicationStatus(med);
      if (filter === 'COMPLETED') return status.type === STATUS_TYPES.COMPLETED;
      if (filter === 'OVERDUE') return status.type === STATUS_TYPES.OVERDUE;
      if (filter === 'PENDING') return status.type !== STATUS_TYPES.COMPLETED;

      return true;
    });
  }, [medications, filter, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Title & Quick Counts */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            Today's Scheduled Medications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-dose IoT dispenser schedules assigned to Silos 1 through 4
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'PENDING'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({medications.filter((m) => getMedicationStatus(m).type !== STATUS_TYPES.COMPLETED).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({medications.filter((m) => getMedicationStatus(m).type === STATUS_TYPES.COMPLETED).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('OVERDUE')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'OVERDUE'
                ? 'bg-white text-rose-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue ({medications.filter((m) => getMedicationStatus(m).type === STATUS_TYPES.OVERDUE).length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by medicine name, instruction, silo..."
          className="w-full bg-transparent border-none text-sm placeholder-slate-400 focus:outline-none focus:ring-0"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Medication List or Empty States */}
      <div className="p-5 space-y-4">
        {filteredMeds.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              {searchQuery ? 'No matching medications found' : 'No medications scheduled in this view'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No schedule entries matched "${searchQuery}". Try clearing the search filter.`
                : 'All scheduled doses for this category have either been resolved or not assigned yet.'}
            </p>
            {onAddNew && (
              <button
                type="button"
                onClick={onAddNew}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              >
                + Assign New Medication
              </button>
            )}
          </div>
        ) : (
          filteredMeds.map((med) => (
            <MedicationItem
              key={med._id}
              medication={med}
              onToggleStatus={onToggleStatus}
              onToggleSlotStatus={onToggleSlotStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

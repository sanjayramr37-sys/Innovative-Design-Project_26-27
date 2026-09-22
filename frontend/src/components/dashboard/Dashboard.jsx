import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  Calendar,
  Layers,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { ProgressBar } from '../common/ProgressBar';
import { UpcomingCard } from './UpcomingCard';
import { MedicationList } from '../medications/MedicationList';
import { SiloManagementForm } from '../medications/SiloManagementForm';
import { MedicationHistory } from './MedicationHistory';
import { EditMedicationModal } from '../medications/EditMedicationModal';
import { SyncMatrixModal } from './SyncMatrixModal';
import { Alert } from '../common/Alert';

export const Dashboard = ({
  medications,
  metrics,
  loading,
  error,
  isLiveApi,
  onRefresh,
  onToggleStatus,
  onToggleSlotStatus,
  onAddMedication,
  onEditMedication,
  onRemoveMedication,
  user,
  isBleModalOpen,
  setIsBleModalOpen,
}) => {
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [systemAlert, setSystemAlert] = useState(null);

  const handleToggleSlot = async (medicationId, slotId, currentTaken) => {
    try {
      await onToggleSlotStatus(medicationId, slotId, currentTaken);
      setSystemAlert({
        type: 'success',
        message: `Dose slot marked as ${!currentTaken ? 'completed' : 'pending'}.`,
      });
      setTimeout(() => setSystemAlert(null), 3000);
    } catch (err) {
      setSystemAlert({
        type: 'error',
        message: err.message || 'Failed to update dose status.',
      });
    }
  };

  const handleCreate = async (payload) => {
    await onAddMedication(payload);
    setIsAddingMed(false);
    setSystemAlert({
      type: 'success',
      message: `New medication "${payload.medicineName}" scheduled for Silo ${payload.siloId} with ${payload.schedule.length} daily time slots!`,
    });
    setTimeout(() => setSystemAlert(null), 4000);
  };

  const handleUpdate = async (id, payload) => {
    await onEditMedication(id, payload);
    setSystemAlert({
      type: 'success',
      message: 'Medication multi-dose schedule updated successfully.',
    });
    setTimeout(() => setSystemAlert(null), 3000);
  };

  const handleDelete = async (id) => {
    await onRemoveMedication(id);
    setSystemAlert({
      type: 'info',
      message: 'Medication removed from schedule.',
    });
    setTimeout(() => setSystemAlert(null), 3000);
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Date & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDateString}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Patient Medication Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time multi-dose schedule for <span className="font-bold text-slate-800">{user?.name}</span> ({user?.caregiverContact}) • Silo Dispensers 1–4
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddingMed(!isAddingMed)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-sm transition-all"
            aria-expanded={isAddingMed}
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingMed ? 'Hide Form' : 'Assign to Silo'}</span>
          </button>
        </div>
      </div>

      {/* System Toast / Notification Alert */}
      {systemAlert && (
        <Alert
          type={systemAlert.type}
          message={systemAlert.message}
          onClose={() => setSystemAlert(null)}
        />
      )}

      {/* Network / Mock Fallback Notice */}
      {!isLiveApi && (
        <Alert
          type="info"
          title="Demonstration / Offline Mode"
          message="The dashboard is currently operating with local storage fallback data because the live MongoDB server is offline. All multi-dose additions, updates, and dose toggles will persist locally in your browser."
        />
      )}

      {/* Section 1: Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Completed Doses"
          value={metrics.completedDoses}
          subtitle={`Out of ${metrics.totalDoses} scheduled slots today`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Remaining Doses"
          value={metrics.remainingDoses}
          subtitle="Time slots pending confirmation"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Overdue Doses"
          value={metrics.overdueDoses}
          subtitle={metrics.overdueDoses > 0 ? 'Requires immediate attention' : 'All scheduled on track'}
          icon={AlertTriangle}
          variant={metrics.overdueDoses > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Daily Adherence"
          value={`${metrics.adherenceRate}%`}
          subtitle="Target: 100% adherence"
          icon={Activity}
          variant={metrics.adherenceRate === 100 ? 'success' : metrics.adherenceRate >= 50 ? 'warning' : 'default'}
        />
      </div>

      {/* Section 2: Visual Progress Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <ProgressBar
          percentage={metrics.adherenceRate}
          completed={metrics.completedDoses}
          total={metrics.totalDoses}
          label="Today's Medication Adherence Progress"
          size="lg"
        />
      </div>

      {/* Section 3: Next Upcoming Medication Highlight */}
      <UpcomingCard
        upcomingSlot={metrics.nextUpcomingSlot}
        onTakeSlot={handleToggleSlot}
      />

      {/* Section 4: Collapsible Silo Management Form */}
      {isAddingMed && (
        <section aria-labelledby="add-med-heading" className="animate-fadeIn">
          <SiloManagementForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddingMed(false)}
          />
        </section>
      )}

      {/* Section 5: Today's Scheduled Medications & History (2-column layout on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main 2-column: Medication List */}
        <div className="lg:col-span-2 space-y-6">
          <MedicationList
            medications={medications}
            onToggleStatus={onToggleStatus}
            onToggleSlotStatus={handleToggleSlot}
            onEdit={(med) => setEditingMed(med)}
            onDelete={handleDelete}
            onAddNew={() => setIsAddingMed(true)}
          />
        </div>

        {/* Side Column: History Log */}
        <div className="space-y-6">
          <MedicationHistory completedDoses={metrics.completedHistory} />

          {/* Quick Dispenser Silo Reference Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              Smart Dispenser Silo Map
            </h4>
            <div className="space-y-2.5 text-xs">
              {[1, 2, 3, 4].map((siloNum) => {
                const assignedMeds = medications.filter((m) => Number(m.siloId) === siloNum);
                return (
                  <div
                    key={siloNum}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 font-bold flex items-center justify-center text-[10px] text-slate-700">
                        {siloNum}
                      </span>
                      <span className="font-semibold text-slate-800">Silo {siloNum}</span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {assignedMeds.length === 0
                        ? 'Empty'
                        : assignedMeds
                            .map((m) => `${m.medicineName} (${m.schedule?.length || 0}x)`)
                            .join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Medication Dialog */}
      <EditMedicationModal
        medication={editingMed}
        isOpen={Boolean(editingMed)}
        onClose={() => setEditingMed(null)}
        onSave={handleUpdate}
      />

      {/* ESP32 BLE Sync Matrix Inspector Modal */}
      <SyncMatrixModal
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
        userId={user?._id}
      />
    </div>
  );
};

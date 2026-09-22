import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { useMedications } from './hooks/useMedications';
import { RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export function App() {
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);

  const {
    medications,
    metrics,
    loading,
    error,
    isLiveApi,
    refreshSchedule,
    toggleDoseStatus,
    toggleSlotStatus,
    addMedication,
    editMedication,
    removeMedication,
    user,
  } = useMedications();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Top Header */}
      <Header
        user={user}
        isLiveApi={isLiveApi}
        onRefresh={refreshSchedule}
        onOpenBleModal={() => setIsBleModalOpen(true)}
        loading={loading}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading && medications.length === 0 ? (
          // Initial Loading Skeleton
          <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading medication dashboard">
            <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-xl" />
              ))}
            </div>
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-36 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        ) : error && medications.length === 0 ? (
          // Fullscreen Error State
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Unable to Load Schedule</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={refreshSchedule}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <Dashboard
            medications={medications}
            metrics={metrics}
            loading={loading}
            error={error}
            isLiveApi={isLiveApi}
            onRefresh={refreshSchedule}
            onToggleStatus={toggleDoseStatus}
            onToggleSlotStatus={toggleSlotStatus}
            onAddMedication={addMedication}
            onEditMedication={editMedication}
            onRemoveMedication={removeMedication}
            user={user}
            isBleModalOpen={isBleModalOpen}
            setIsBleModalOpen={setIsBleModalOpen}
          />
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MediGuardian Smart Healthcare System • Patient: Sanjay (+91 XXXXXXXXXX) • WCAG 2.1 AA</span>
          </div>
          <div className="flex items-center gap-1">
            <span>ESP32 Multi-Dose Silo BLE Dispatch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

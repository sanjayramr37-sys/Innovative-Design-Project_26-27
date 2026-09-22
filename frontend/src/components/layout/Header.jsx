import React from 'react';
import { Pill, ShieldCheck, Bluetooth, User, Phone, RefreshCw } from 'lucide-react';

export const Header = ({
  user,
  isLiveApi,
  onRefresh,
  onOpenBleModal,
  loading,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Medi<span className="text-emerald-600">Guardian</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Smart Medication Adherence & IoT Silo Dispenser
              </p>
            </div>
          </div>

          {/* Right: Patient & Status actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Backend Connection Status Badge */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isLiveApi
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
              title={isLiveApi ? 'Connected to live MongoDB/Express backend' : 'Running in standalone demo/mock mode with local persistence'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isLiveApi ? 'Live API Connected' : 'Mock Mode Active'}</span>
            </div>

            {/* BLE Sync Matrix Button */}
            <button
              type="button"
              onClick={onOpenBleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
              title="Inspect ESP32 BLE sync matrix payload"
              aria-label="Inspect ESP32 BLE sync matrix payload"
            >
              <Bluetooth className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">BLE Matrix</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
              title="Refresh Schedule"
              aria-label="Refresh Schedule"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Patient Profile Card */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Patient'}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 leading-tight mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {user?.caregiverContact?.split('(')[0]?.trim() || 'Caregiver'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

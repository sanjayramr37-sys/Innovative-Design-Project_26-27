import React, { useState, useEffect } from 'react';
import { X, Cpu, Bluetooth, Copy, Check, RefreshCw } from 'lucide-react';
import { medicationApi } from '../../api/medicationApi';
import { minutesToTime, formatTime12Hour } from '../../utils/timeUtils';

export const SyncMatrixModal = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMatrix();
    }
  }, [isOpen, userId]);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const data = await medicationApi.getSyncMatrix(userId);
      setMatrix(data);
    } catch (err) {
      console.error('Failed to load sync matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(matrix, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const rawJson = JSON.stringify(matrix);
  const byteSize = new Blob([rawJson]).size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h2 id="matrix-modal-title" className="text-lg font-bold">
                ESP32 BLE Sync Matrix Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Endpoint: <code className="text-emerald-400">GET /api/users/:userId/sync-matrix</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">BLE Payload Design:</span> Minimal 3-element integer array <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">[siloId, timeInMinutesFromMidnight, doseCount]</code>.
            Sorted chronologically with zero string overhead to fit directly into standard BLE MTU packets for microcontroller parsing.
          </div>

          {/* Matrix Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400">Total Doses</p>
              <p className="text-xl font-bold text-slate-900">{matrix.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400">Payload Size</p>
              <p className="text-xl font-bold text-emerald-600">{byteSize} bytes</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400">BLE Transport</p>
              <p className="text-xl font-bold text-sky-600">GATT Char</p>
            </div>
          </div>

          {/* Decoded Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Decoded Hardware Schedule Items
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 font-semibold text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Index</th>
                    <th className="px-3 py-2">Silo (ID)</th>
                    <th className="px-3 py-2">Minutes Offset</th>
                    <th className="px-3 py-2">Clock Time</th>
                    <th className="px-3 py-2">Dose Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 text-slate-400">#{idx + 1}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">Silo {row[0]}</td>
                      <td className="px-3 py-2 text-indigo-600">{row[1]} min</td>
                      <td className="px-3 py-2 text-slate-700 font-sans font-medium">
                        {formatTime12Hour(minutesToTime(row[1]))} ({minutesToTime(row[1])})
                      </td>
                      <td className="px-3 py-2 font-bold text-emerald-700">{row[2]} unit</td>
                    </tr>
                  ))}
                  {matrix.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-400 font-sans">
                        No scheduled doses to serialize.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw JSON Matrix */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Raw Serialized JSON Stream (Transmitted to ESP32)
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
              {JSON.stringify(matrix, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={loadMatrix}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh BLE Matrix</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

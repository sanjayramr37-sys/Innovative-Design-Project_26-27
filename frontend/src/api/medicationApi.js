import { apiClient } from './client';
import {
  getStoredMedications,
  saveStoredMedications,
  DEFAULT_USER,
} from '../data/mockData';
import { timeToMinutes } from '../utils/timeUtils';

let isBackendAvailable = true;

export const checkBackendStatus = () => isBackendAvailable;
export const setBackendStatus = (status) => {
  isBackendAvailable = status;
};

export const medicationApi = {
  /**
   * GET /api/users/:userId/medications/today
   */
  async getTodayMedications(userId = DEFAULT_USER._id) {
    if (!isBackendAvailable) {
      return this.mockGetTodayMedications();
    }

    try {
      const response = await apiClient(`/api/users/${userId}/medications/today`);
      setBackendStatus(true);
      return response.data || [];
    } catch (error) {
      console.warn('[API Service] Backend unreachable, falling back to local mock data:', error.message);
      setBackendStatus(false);
      return this.mockGetTodayMedications();
    }
  },

  /**
   * GET /api/sync-matrix
   * Fetch flattened, chronologically sorted 2D JSON array for ESP32 BLE sync:
   * [[Silo_ID, Time_in_minutes_from_midnight, Dose_Count]]
   */
  async getSyncMatrix(userId = DEFAULT_USER._id) {
    if (!isBackendAvailable) {
      return this.mockGetSyncMatrix();
    }

    try {
      // Try global /api/sync-matrix first, then user-scoped fallback
      const matrix = await apiClient('/api/sync-matrix').catch(() =>
        apiClient(`/api/users/${userId}/sync-matrix`)
      );
      setBackendStatus(true);
      return Array.isArray(matrix) ? matrix : [];
    } catch (error) {
      console.warn('[API Service] Sync matrix API failed, falling back to local calculation:', error.message);
      setBackendStatus(false);
      return this.mockGetSyncMatrix();
    }
  },

  /**
   * PATCH /api/medications/:medicationId/status (or slot status)
   */
  async updateDoseStatus(medicationId, taken, slotId = null) {
    if (!isBackendAvailable) {
      return this.mockUpdateDoseStatus(medicationId, taken, slotId);
    }

    try {
      const url = slotId
        ? `/api/medications/${medicationId}/schedule/${slotId}/status`
        : `/api/medications/${medicationId}/status`;

      const response = await apiClient(url, {
        method: 'PATCH',
        body: JSON.stringify({ taken, slotId }),
      });
      setBackendStatus(true);
      return response.data;
    } catch (error) {
      console.warn('[API Service] Status update API failed, falling back to local update:', error.message);
      setBackendStatus(false);
      return this.mockUpdateDoseStatus(medicationId, taken, slotId);
    }
  },

  /**
   * POST /api/medications
   * Creates a new scheduled medication assigned to a silo with multi-dose slots
   */
  async createMedication(payload) {
    if (!isBackendAvailable) {
      return this.mockCreateMedication(payload);
    }

    try {
      const response = await apiClient('/api/medications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setBackendStatus(true);
      return response.data;
    } catch (error) {
      console.warn('[API Service] Create medication API failed, falling back to local storage:', error.message);
      setBackendStatus(false);
      return this.mockCreateMedication(payload);
    }
  },

  /**
   * PUT /api/medications/:medicationId
   */
  async updateMedication(medicationId, payload) {
    if (!isBackendAvailable) {
      return this.mockUpdateMedication(medicationId, payload);
    }

    try {
      const response = await apiClient(`/api/medications/${medicationId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setBackendStatus(true);
      return response.data;
    } catch (error) {
      console.warn('[API Service] Update medication API failed, falling back to local update:', error.message);
      setBackendStatus(false);
      return this.mockUpdateMedication(medicationId, payload);
    }
  },

  /**
   * DELETE /api/medications/:medicationId
   */
  async deleteMedication(medicationId) {
    if (!isBackendAvailable) {
      return this.mockDeleteMedication(medicationId);
    }

    try {
      const response = await apiClient(`/api/medications/${medicationId}`, {
        method: 'DELETE',
      });
      setBackendStatus(true);
      return response.data;
    } catch (error) {
      console.warn('[API Service] Delete medication API failed, falling back to local delete:', error.message);
      setBackendStatus(false);
      return this.mockDeleteMedication(medicationId);
    }
  },

  // --------------------------------------------------------------------------
  // Local Mock / Fallback implementations
  // --------------------------------------------------------------------------
  mockGetTodayMedications() {
    const meds = getStoredMedications();
    return [...meds].sort((a, b) => {
      const timeA = a.schedule?.[0]?.time ? timeToMinutes(a.schedule[0].time) : 0;
      const timeB = b.schedule?.[0]?.time ? timeToMinutes(b.schedule[0].time) : 0;
      return timeA - timeB;
    });
  },

  mockGetSyncMatrix() {
    const meds = getStoredMedications();
    const matrix = [];
    for (const med of meds) {
      if (Array.isArray(med.schedule)) {
        for (const slot of med.schedule) {
          if (slot?.time) {
            matrix.push([
              Number(med.siloId),
              timeToMinutes(slot.time),
              Number(slot.dose) || 1,
            ]);
          }
        }
      }
    }
    matrix.sort((a, b) => a[1] - b[1]);
    return matrix;
  },

  mockUpdateDoseStatus(medicationId, taken, slotId = null) {
    const meds = getStoredMedications();
    const index = meds.findIndex((m) => m._id === medicationId);
    if (index === -1) {
      throw new Error(`Medication not found with ID ${medicationId}`);
    }

    const med = meds[index];
    if (Array.isArray(med.schedule)) {
      if (slotId) {
        const slot = med.schedule.find((s) => s._id === slotId || s.time === slotId);
        if (slot) {
          slot.taken = Boolean(taken);
          slot.takenAt = taken ? new Date().toISOString() : null;
        }
      } else {
        // Toggle next untaken or all
        if (taken) {
          const untakenSlot = med.schedule.find((s) => !s.taken);
          if (untakenSlot) {
            untakenSlot.taken = true;
            untakenSlot.takenAt = new Date().toISOString();
          } else {
            med.schedule.forEach((s) => {
              s.taken = true;
              s.takenAt = new Date().toISOString();
            });
          }
        } else {
          med.schedule.forEach((s) => {
            s.taken = false;
            s.takenAt = null;
          });
        }
      }
    }

    med.updatedAt = new Date().toISOString();
    meds[index] = { ...med };
    saveStoredMedications(meds);
    return meds[index];
  },

  mockCreateMedication(payload) {
    const meds = getStoredMedications();
    const newMed = {
      _id: `med-${Date.now()}`,
      userId: payload.userId || DEFAULT_USER._id,
      medicineName: payload.medicineName.trim(),
      siloId: Number(payload.siloId),
      schedule: Array.isArray(payload.schedule)
        ? payload.schedule.map((s, idx) => ({
            _id: `slot-${Date.now()}-${idx}`,
            time: s.time,
            dose: Number(s.dose) || 1,
            instruction: s.instruction || 'After Food',
            taken: false,
            takenAt: null,
          }))
        : [],
      notes: payload.notes || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    meds.push(newMed);
    saveStoredMedications(meds);
    return newMed;
  },

  mockUpdateMedication(medicationId, payload) {
    const meds = getStoredMedications();
    const index = meds.findIndex((m) => m._id === medicationId);
    if (index === -1) {
      throw new Error(`Medication not found with ID ${medicationId}`);
    }

    const updated = {
      ...meds[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    meds[index] = updated;
    saveStoredMedications(meds);
    return updated;
  },

  mockDeleteMedication(medicationId) {
    const meds = getStoredMedications();
    const filtered = meds.filter((m) => m._id !== medicationId);
    saveStoredMedications(filtered);
    return { id: medicationId };
  },
};

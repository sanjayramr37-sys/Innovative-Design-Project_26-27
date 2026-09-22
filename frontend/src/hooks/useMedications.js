import { useState, useEffect, useCallback, useMemo } from 'react';
import { medicationApi, checkBackendStatus } from '../api/medicationApi';
import { DEFAULT_USER } from '../data/mockData';
import { timeToMinutes, getCurrentMinutes, isDoseOverdue } from '../utils/timeUtils';

export const useMedications = (userId = DEFAULT_USER._id) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveApi, setIsLiveApi] = useState(true);

  // Fetch medications
  const loadMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicationApi.getTodayMedications(userId);
      setMedications(data);
      setIsLiveApi(checkBackendStatus());
    } catch (err) {
      setError(err.message || 'Failed to load medication schedule.');
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Toggle dose taken status for a specific schedule slot
  const toggleSlotStatus = async (medicationId, slotId, currentTaken) => {
    const nextTaken = !currentTaken;

    // Optimistic UI update
    setMedications((prev) =>
      prev.map((med) => {
        if (med._id !== medicationId) return med;

        const updatedSchedule = med.schedule.map((slot, idx) => {
          const isTarget = slot._id === slotId || idx === slotId;
          if (isTarget) {
            return {
              ...slot,
              taken: nextTaken,
              takenAt: nextTaken ? new Date().toISOString() : null,
            };
          }
          return slot;
        });

        return { ...med, schedule: updatedSchedule };
      })
    );

    try {
      await medicationApi.updateDoseStatus(medicationId, nextTaken, slotId);
      setIsLiveApi(checkBackendStatus());
    } catch (err) {
      // Rollback on error
      setMedications((prev) =>
        prev.map((med) => {
          if (med._id !== medicationId) return med;
          const reverted = med.schedule.map((slot, idx) => {
            const isTarget = slot._id === slotId || idx === slotId;
            if (isTarget) {
              return { ...slot, taken: currentTaken };
            }
            return slot;
          });
          return { ...med, schedule: reverted };
        })
      );
      setError(`Failed to update dose: ${err.message}`);
      throw err;
    }
  };

  // Toggle whole medication status
  const toggleDoseStatus = async (medicationId, currentTakenStatus) => {
    const nextTaken = !currentTakenStatus;

    setMedications((prev) =>
      prev.map((m) => {
        if (m._id !== medicationId) return m;
        const updatedSlots = m.schedule.map((s) => ({
          ...s,
          taken: nextTaken,
          takenAt: nextTaken ? new Date().toISOString() : null,
        }));
        return { ...m, schedule: updatedSlots };
      })
    );

    try {
      await medicationApi.updateDoseStatus(medicationId, nextTaken);
      setIsLiveApi(checkBackendStatus());
    } catch (err) {
      loadMedications();
      setError(`Failed to update dose: ${err.message}`);
      throw err;
    }
  };

  // Add medication
  const addMedication = async (medData) => {
    try {
      const created = await medicationApi.createMedication({
        ...medData,
        userId,
      });

      setMedications((prev) => {
        const nextList = [...prev, created];
        return nextList.sort((a, b) => {
          const timeA = a.schedule?.[0]?.time ? timeToMinutes(a.schedule[0].time) : 0;
          const timeB = b.schedule?.[0]?.time ? timeToMinutes(b.schedule[0].time) : 0;
          return timeA - timeB;
        });
      });
      setIsLiveApi(checkBackendStatus());
      return created;
    } catch (err) {
      setError(`Failed to add medication: ${err.message}`);
      throw err;
    }
  };

  // Edit medication
  const editMedication = async (medicationId, updateData) => {
    try {
      const updated = await medicationApi.updateMedication(medicationId, updateData);
      setMedications((prev) => {
        const nextList = prev.map((m) => (m._id === medicationId ? { ...m, ...updated } : m));
        return nextList.sort((a, b) => {
          const timeA = a.schedule?.[0]?.time ? timeToMinutes(a.schedule[0].time) : 0;
          const timeB = b.schedule?.[0]?.time ? timeToMinutes(b.schedule[0].time) : 0;
          return timeA - timeB;
        });
      });
      setIsLiveApi(checkBackendStatus());
      return updated;
    } catch (err) {
      setError(`Failed to update medication: ${err.message}`);
      throw err;
    }
  };

  // Delete medication
  const removeMedication = async (medicationId) => {
    try {
      await medicationApi.deleteMedication(medicationId);
      setMedications((prev) => prev.filter((m) => m._id !== medicationId));
      setIsLiveApi(checkBackendStatus());
    } catch (err) {
      setError(`Failed to delete medication: ${err.message}`);
      throw err;
    }
  };

  // Comprehensive multi-dose analytics
  const metrics = useMemo(() => {
    // Flatten all slots across all medications
    const allSlots = [];
    medications.forEach((med) => {
      if (Array.isArray(med.schedule)) {
        med.schedule.forEach((slot, idx) => {
          allSlots.push({
            medicationId: med._id,
            medicineName: med.medicineName,
            siloId: med.siloId,
            notes: med.notes,
            slotId: slot._id || idx,
            time: slot.time,
            dose: slot.dose,
            instruction: slot.instruction,
            taken: slot.taken,
            takenAt: slot.takenAt,
          });
        });
      }
    });

    const totalDoses = allSlots.length;
    const completedDoses = allSlots.filter((s) => s.taken).length;
    const remainingDoses = totalDoses - completedDoses;
    const overdueDoses = allSlots.filter((s) => isDoseOverdue(s.time, s.taken)).length;
    const adherenceRate = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

    // Find the next upcoming dose slot
    const currentMins = getCurrentMinutes();
    const untakenSlots = allSlots
      .filter((s) => !s.taken)
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    let nextUpcomingSlot = untakenSlots.find((s) => timeToMinutes(s.time) >= currentMins);
    if (!nextUpcomingSlot && untakenSlots.length > 0) {
      nextUpcomingSlot = untakenSlots[0];
    }

    // Recent history: completed slots sorted newest taken first
    const completedHistory = allSlots
      .filter((s) => s.taken)
      .sort((a, b) => {
        const timeA = a.takenAt ? new Date(a.takenAt).getTime() : 0;
        const timeB = b.takenAt ? new Date(b.takenAt).getTime() : 0;
        return timeB - timeA;
      });

    return {
      totalDoses,
      completedDoses,
      remainingDoses,
      overdueDoses,
      adherenceRate,
      nextUpcomingSlot,
      completedHistory,
    };
  }, [medications]);

  return {
    medications,
    loading,
    error,
    isLiveApi,
    metrics,
    refreshSchedule: loadMedications,
    toggleDoseStatus,
    toggleSlotStatus,
    addMedication,
    editMedication,
    removeMedication,
    user: DEFAULT_USER,
  };
};

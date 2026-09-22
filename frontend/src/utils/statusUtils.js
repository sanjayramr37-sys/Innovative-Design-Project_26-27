import { isDoseOverdue } from './timeUtils';

export const STATUS_TYPES = {
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
  UPCOMING: 'UPCOMING',
};

/**
 * Resolves the operational status of an individual schedule slot.
 */
export const getSlotStatus = (slot) => {
  if (!slot) {
    return {
      type: STATUS_TYPES.UPCOMING,
      label: 'Scheduled',
      shortLabel: 'Pending',
      ariaLabel: 'Status: Pending',
      variant: 'info',
      icon: 'clock',
    };
  }

  if (slot.taken) {
    return {
      type: STATUS_TYPES.COMPLETED,
      label: 'Dose Taken',
      shortLabel: 'Taken',
      ariaLabel: 'Status: Dose completed and confirmed',
      variant: 'success',
      icon: 'check',
    };
  }

  if (isDoseOverdue(slot.time, slot.taken)) {
    return {
      type: STATUS_TYPES.OVERDUE,
      label: 'Overdue Dose',
      shortLabel: 'Overdue',
      ariaLabel: 'Status: Missed or overdue scheduled dose',
      variant: 'danger',
      icon: 'alert',
    };
  }

  return {
    type: STATUS_TYPES.UPCOMING,
    label: 'Upcoming Dose',
    shortLabel: 'Upcoming',
    ariaLabel: 'Status: Scheduled upcoming dose',
    variant: 'info',
    icon: 'clock',
  };
};

/**
 * Resolves overall operational status of a multi-dose medication.
 */
export const getMedicationStatus = (medication) => {
  if (!medication || !Array.isArray(medication.schedule) || medication.schedule.length === 0) {
    return {
      type: STATUS_TYPES.UPCOMING,
      label: 'Pending',
      shortLabel: 'Pending',
      ariaLabel: 'Status: Pending',
      variant: 'neutral',
    };
  }

  const allTaken = medication.schedule.every((s) => s.taken);
  if (allTaken) {
    return {
      type: STATUS_TYPES.COMPLETED,
      label: 'All Doses Taken',
      shortLabel: 'Completed',
      ariaLabel: 'Status: All scheduled doses completed for today',
      variant: 'success',
      icon: 'check',
    };
  }

  const anyOverdue = medication.schedule.some((s) => isDoseOverdue(s.time, s.taken));
  if (anyOverdue) {
    return {
      type: STATUS_TYPES.OVERDUE,
      label: 'Action: Overdue Dose',
      shortLabel: 'Overdue',
      ariaLabel: 'Status: Contains overdue dose',
      variant: 'danger',
      icon: 'alert',
    };
  }

  return {
    type: STATUS_TYPES.UPCOMING,
    label: 'Upcoming Doses',
    shortLabel: 'Upcoming',
    ariaLabel: 'Status: Doses upcoming today',
    variant: 'info',
    icon: 'clock',
  };
};

/**
 * Accessible styling configuration for Silo badges.
 */
export const getSiloDetails = (siloId) => {
  const id = Number(siloId) || 1;
  const config = {
    1: {
      name: 'Silo 1',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-700/10',
      dotClass: 'bg-sky-500',
    },
    2: {
      name: 'Silo 2',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-700/10',
      dotClass: 'bg-purple-500',
    },
    3: {
      name: 'Silo 3',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-700/10',
      dotClass: 'bg-emerald-500',
    },
    4: {
      name: 'Silo 4',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-700/10',
      dotClass: 'bg-amber-500',
    },
  };
  return config[id] || config[1];
};

import checklistData from '../data/checklists.json';

export const MODULES = checklistData.modules;

export function getModuleById(moduleId) {
  return MODULES.find((m) => m.id === moduleId);
}

export function getAllItemsForModules(moduleIds) {
  const items = [];
  MODULES.filter((m) => moduleIds.includes(m.id)).forEach((mod) => {
    mod.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        items.push({ ...item, moduleId: mod.id, moduleName: mod.name, categoryName: cat.name });
      });
    });
  });
  return items;
}

export function createTicket({ ticketId, ticketTitle, testerName }) {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ticketId: ticketId.trim(),
    ticketTitle: ticketTitle.trim(),
    testerName: testerName.trim(),
    createdAt: now,
    updatedAt: now,
    selectedModules: [],
    // itemStates[itemId] = { selected: bool, remark: string }
    itemStates: {},
    overallRemarks: '',
    step: 1,
  };
}

export function calcProgress(ticket) {
  const items = getAllItemsForModules(ticket.selectedModules || []);
  const total = items.length;
  if (total === 0) return { total: 0, selected: 0, withRemarks: 0, percent: 0 };
  const selected = items.filter((it) => ticket.itemStates?.[it.id]?.selected).length;
  const withRemarks = items.filter((it) => (ticket.itemStates?.[it.id]?.remark || '').trim().length > 0).length;
  const percent = Math.round((selected / total) * 100);
  return { total, selected, withRemarks, percent };
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

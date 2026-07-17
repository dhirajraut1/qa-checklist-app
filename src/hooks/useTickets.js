import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const TICKETS_KEY = 'qa_checklist_tickets_v1';
const LAST_TESTER_KEY = 'qa_checklist_last_tester_v1';

export function useTickets() {
  const [tickets, setTickets] = useLocalStorage(TICKETS_KEY, []);
  const [lastTesterName, setLastTesterName] = useLocalStorage(LAST_TESTER_KEY, '');

  const addTicket = useCallback((ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    if (ticket.testerName) setLastTesterName(ticket.testerName);
  }, [setTickets, setLastTesterName]);

  const updateTicket = useCallback((id, patch) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      )
    );
  }, [setTickets]);

  const deleteTicket = useCallback((id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, [setTickets]);

  const getTicket = useCallback((id) => tickets.find((t) => t.id === id), [tickets]);

  return { tickets, addTicket, updateTicket, deleteTicket, getTicket, lastTesterName };
}

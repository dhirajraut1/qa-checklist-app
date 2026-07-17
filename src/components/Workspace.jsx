import Stepper from './Stepper';
import ModuleSelector from './ModuleSelector';
import ChecklistStep from './ChecklistStep';
import ReviewStep from './ReviewStep';
import { calcProgress } from '../utils/ticketUtils';

export default function Workspace({ ticket, updateTicket, onBackHome, testerNameFallback }) {
  const step = ticket.step || 1;
  const progress = calcProgress(ticket);

  const setStep = (s) => updateTicket(ticket.id, { step: s });

  const toggleModule = (moduleId) => {
    const set = new Set(ticket.selectedModules);
    if (set.has(moduleId)) set.delete(moduleId);
    else set.add(moduleId);
    updateTicket(ticket.id, { selectedModules: Array.from(set) });
  };

  const toggleItem = (itemId) => {
    const current = ticket.itemStates?.[itemId] || { selected: false, remark: '' };
    updateTicket(ticket.id, {
      itemStates: {
        ...ticket.itemStates,
        [itemId]: { ...current, selected: !current.selected },
      },
    });
  };

  const setRemark = (itemId, remark) => {
    const current = ticket.itemStates?.[itemId] || { selected: true, remark: '' };
    updateTicket(ticket.id, {
      itemStates: { ...ticket.itemStates, [itemId]: { ...current, remark } },
    });
  };

  const setOverallRemarks = (val) => updateTicket(ticket.id, { overallRemarks: val });

  return (
    <div>
      <div className="workspace-header">
        <div>
          <span className="ticket-id">{ticket.ticketId || 'UNTITLED'}</span>
          <h1>{ticket.ticketTitle || 'Untitled ticket'}</h1>
          <span className="ticket-sub">
            {ticket.testerName || testerNameFallback || 'Unassigned'} · {progress.percent}% complete
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onBackHome}>All tickets</button>
      </div>

      <Stepper current={step} onJump={setStep} />

      {step === 1 && (
        <ModuleSelector
          selectedModules={ticket.selectedModules}
          onToggleModule={toggleModule}
          onNext={() => setStep(2)}
          onBackHome={onBackHome}
        />
      )}

      {step === 2 && (
        <ChecklistStep
          ticket={ticket}
          onToggleItem={toggleItem}
          onSetRemark={setRemark}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <ReviewStep
          ticket={ticket}
          onSetOverallRemarks={setOverallRemarks}
          onBack={() => setStep(2)}
          testerNameFallback={testerNameFallback}
        />
      )}
    </div>
  );
}

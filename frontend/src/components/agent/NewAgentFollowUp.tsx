import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { FollowUp } from "@/types/follow_up";
import { Edit, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"
import FollowUpModal from "../modal/FollowUpModal";
import { useSystemStore } from "@/store/system";
import { useFollowUpStore } from "@/store/follow-up";

const NewAgentFollowUp: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent } = useAgentStore();

  const { followUpTriggers, fetchCrmColumns, fetchFollowUpTriggers } = useSystemStore();

  const { followUps, fetchFollowUps, followUpMessages, deleteFollowUp } = useFollowUpStore();

  const [automaticFollowUpsEnabled, setAutomaticFollowUpsEnabled] = useState(true);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  useEffect(() => {
    fetchCrmColumns();
    fetchFollowUpTriggers();
  }, []);

  useEffect(() => {
    fetchFollowUps(agent.id);
  }, [fetchFollowUps, agent.id]);

  const handleDeleteFollowUp = (followUpId: number) => {
    deleteFollowUp(followUpId);
  };

  const handleFollowUpModalClose = () => {
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
    fetchFollowUps(agent.id);
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">{t.automaticFollowUps}</h3>

      <div className="form-control">
        <label className="cursor-pointer flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={automaticFollowUpsEnabled}
            onChange={(e) => setAutomaticFollowUpsEnabled(e.target.checked)}
          />
          <span>{t.enableFollowUps}</span>
        </label>
      </div>

      {(followUps.length > 0 || automaticFollowUpsEnabled) && (
        <div className="space-y-4">
          <div className="alert bg-base-200 border border-base-300">
            <div className="flex">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              <span className="text-base-content">{t.followUpsDesc}</span>
            </div>
          </div>

          <button
            onClick={() => setShowFollowUpModal(true)}
            className="btn btn-outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.createFollowUpSequence}
          </button>

          {/* Lista de Sequências */}
          {followUps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-base-content">{t.createdSequences}</h4>
              {followUps.map((sequence) => (
                <div key={sequence.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-base-content mb-1">{sequence.name}</h5>
                        <p className="text-sm text-neutral mb-2">{sequence.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-neutral">
                          <span>Trigger: {followUpTriggers.find(t => t.id === Number(sequence.trigger))?.name}</span>
                          <span>
                            {sequence.messages.length > 0 && sequence.messages[0].delayType === 'custom' && (
                              <>Delay: {sequence.messages[0].days ?? 0}d {sequence.messages[0].hours ?? 0}h {sequence.messages[0].minutes ?? 0}m</>
                            )}
                          </span>
                          {sequence.messages.length === 1 && (
                            <span>{sequence.messages.length} {t.message}</span>
                          )}
                          {sequence.messages.length > 1 && (
                            <span>{sequence.messages.length} {t.messages}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingFollowUp(sequence);
                            setShowFollowUpModal(true);
                          }}
                          className="btn btn-ghost btn-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteFollowUp(sequence.id!)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showFollowUpModal && (
        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={() => handleFollowUpModalClose()}
          followUp={editingFollowUp ?? undefined}
        />
      )}
    </div>
  )
}

export default NewAgentFollowUp

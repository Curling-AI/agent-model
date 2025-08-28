import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { FollowUp } from "@/types/follow_up";
import { Edit, MessageSquare, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react"
import FollowUpModal from "../FollowUpModal";

const NewAgentFollowUp: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent, setAgent, updateAgent } = useAgentStore();

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const addFollowUp = (followUp: FollowUp) => {
    agent.followUps.push(followUp);
    setAgent(agent);
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const editFollowUp = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setShowFollowUpModal(true);
  };

  const updateFollowUp = (updatedFollowUp: FollowUp) => {
    setAgent({
      ...agent,
      followUps: agent.followUps.map((followUp: FollowUp) =>
        followUp.id === updatedFollowUp.id ? updatedFollowUp : followUp
      )
    });
    setShowFollowUpModal(false);
    setEditingFollowUp(null);
  };

  const deleteFollowUp = (followUpId: number) => {
    setAgent({
      ...agent,
      followUps: agent.followUps.filter((followUp: FollowUp) =>
          followUp.id === followUpId ? null : followUp
      ),
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">{t.automaticFollowUps}</h3>

      <div className="form-control">
        <label className="cursor-pointer flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={agent.followUps.length > 0}
          // onChange={(e) => updateAgentData('followUps', { enabled: e.target.checked })}
          />
          <span>{t.enableFollowUps}</span>
        </label>
      </div>

      {agent.followUps.length > 0 && (
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
          {agent.followUps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-base-content">{t.createdSequences}</h4>
              {agent.followUps[0].messageSequences.map((sequence) => (
                <div key={sequence.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-base-content mb-1">{''}</h5>
                        <p className="text-sm text-neutral mb-2">{''}</p>
                        <div className="flex items-center space-x-4 text-xs text-neutral">
                          <span>Trigger: {''}</span>
                          <span>
                            Delay: `${sequence.days ?? 0}d ${sequence.hours ?? 0}h ${sequence.minutes ?? 0}m`

                          </span>
                          {/* <span>{sequence..length} mensagens</span> */}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          // onClick={() => editFollowUp(sequence)}
                          className="btn btn-ghost btn-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteFollowUp(sequence.id)}
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
          onClose={() => {
            setShowFollowUpModal(false);
            setEditingFollowUp(null);
          }}
          onSave={editingFollowUp ? updateFollowUp : addFollowUp}
          followUp={editingFollowUp}
        />
      )}
    </div>
  )
}

export default NewAgentFollowUp

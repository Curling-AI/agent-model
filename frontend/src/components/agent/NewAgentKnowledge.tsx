import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import WebsiteInput from "../WebsiteInput";
import FileUploader from "../FileUploader";
import YoutubeInput from "../YoutubeInput";
import FaqInput from "../FaqInput";
import DocumentChunking from "../DocumentChunking";
import { useNotifications } from "@/context/NotificationsProvider";
import { Document } from "@/types/agent";
import { useDocumentStore } from "@/store/document";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import FaqModal from "../FaqModal";

const NewAgentKnowledge: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent } = useAgentStore();
  const { documents, setDocuments, fetchDocuments, deleteDocument } = useDocumentStore();

  const { addNotification } = useNotifications();

  const [showFaqModal, setShowFaqModal] = useState(false);

  const [editFaq, setEditFaq] = useState<Document | null>(null);

  useEffect(() => {
    if (agent) {
       fetchDocuments(agent.id);
    } else {
      addNotification('Agente não encontrado ao buscar documentos.', 'error');
    }
  }, [documents.length]);

  const removeChunk = (chunkId: number) => {
    setDocuments(documents.map((doc) => ({
      ...doc,
      chunks: doc.chunks!.filter((chunk) => chunk.id !== chunkId),
    })))
    addNotification('Chunk removido com sucesso!', 'success')
  }

  const removeAllChunks = async (documentId: number) => {
    try {
      setDocuments(
        documents.map((doc) => ({
          ...doc,
          chunks: doc.chunks!.filter((chunk) => chunk.id !== documentId),
        }))
      )
      addNotification('Documento e todos os seus chunks removidos com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao remover todos os chunks:', error)
      addNotification('Erro ao remover documento e seus chunks.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">{t.knowledgeBaseTitle}</h3>

      <WebsiteInput />

      <FileUploader />

      <YoutubeInput />

      <FaqInput onClick={() => setShowFaqModal(true)} />

      {showFaqModal && (
        <FaqModal
          isOpen={showFaqModal}
          onClose={() => {
            setShowFaqModal(false);
            setEditFaq(null);
          }}
          document={editFaq ?? undefined}
        />
      )}

      {/* Lista de FAQs */}
        {documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base-content mb-2">{doc.name}</h4>
                      <p className="text-sm text-neutral">{doc.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      { doc.type === 'faq' && (
                        <button
                          onClick={() => {
                            setEditFaq(doc); 
                            setShowFaqModal(true);
                          }}
                          className="btn btn-ghost btn-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={async () => await deleteDocument(doc.id)}
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

      {documents.length > 0 && (
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          <h3 style={{ marginTop: '16px', marginBottom: '16px' }}>Documentos Processados</h3>
          {documents.map((doc: Document) => (
            <DocumentChunking
              key={doc.id}
              documentId={doc.id}
              documentName={doc.name}
              chunks={doc.chunks}
              status={'processed'}
              onChunkRemove={removeChunk}
              onAllChunksRemove={removeAllChunks}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default NewAgentKnowledge

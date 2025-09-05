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
import { useEffect } from "react";

const NewAgentKnowledge: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent } = useAgentStore();
  const { documents, setDocuments, fetchDocuments } = useDocumentStore();

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (agent) {
      fetchDocuments(agent.id, 'all');
    } else {
      addNotification('Agente não encontrado ao buscar documentos.', 'error');
    }
  }, []);

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

      <FaqInput  />

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

import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { Document } from "@/types/agent";
import WebsiteInput from "../WebsiteInput";
import FileUploader from "../FileUploader";
import YoutubeInput from "../YoutubeInput";
import FaqInput from "../FaqInput";
import DocumentChunking from "../DocumentChunking";

const NewAgentKnowledge: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent, setAgent } = useAgentStore();

  const removeChunk = (chunkId: number) => {
    // setConfiguration({
    //   processedDocuments: configuration.processedDocuments.map((doc) => ({
    //     ...doc,
    //     chunks: doc.chunks.filter((chunk) => chunk.id !== chunkId),
    //     totalTokens: doc.chunks.reduce(
    //       (sum, chunk) => (chunk.id !== chunkId ? sum + chunk.tokens : sum),
    //       0,
    //     ),
    //   })),
    // })
    // addNotification('Chunk removido com sucesso!', 'success')
  }

  const removeAllChunks = async (documentId: number) => {
    // try {
    //   const statusItem = processedDocumentsStatus.find((item) => item.id === documentId)
    //   if (statusItem?.channel) {
    //     await supabase.removeChannel(statusItem.channel)
    //     delete processedDocChannels.current[documentId]
    //     setProcessedDocumentsStatus((prev) => prev.filter((item) => item.id !== documentId))
    //   }

    //   await handleDeleteDocument(Number(documentId))
    //   setConfiguration({
    //     processedDocuments: configuration.processedDocuments.filter((doc) => doc.id !== documentId),
    //   })
    //   addNotification('Documento e todos os seus chunks removidos com sucesso!', 'success')
    // } catch (error) {
    //   console.error('Erro ao remover todos os chunks:', error)
    //   addNotification('Erro ao remover documento e seus chunks.', 'error')
    // }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">{t.knowledgeBaseTitle}</h3>

      <WebsiteInput />

      <FileUploader agent={agent} onCreateDocument={function (document: Document): void {
        throw new Error("Function not implemented.");
      }} />

      <YoutubeInput agent={agent} />

      <FaqInput agent={agent} onCreateDocument={function (document: Document): void {
        throw new Error("Function not implemented.");
      }} />

      {agent.documents.length > 0 && (
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          <h3 style={{ marginTop: '16px', marginBottom: '16px' }}>Documentos Processados</h3>
          {agent.documents.map((doc) => (
            <DocumentChunking
              key={doc.id}
              documentId={doc.id}
              documentName={doc.name}
              chunks={doc.chunks}
              status={'pending'}
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

import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationsProvider";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { Agent, Document } from "@/types/agent";
import { processWebsite, processYoutube } from "@/utils/chunk";
import { useCallback, useState } from "react"

interface WebsiteDocument extends Document {
  type: 'website';
}


const WebsiteInput: React.FC= () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent, setAgent } = useAgentStore();

  const [websiteDocument, setWebsiteDocument] = useState<WebsiteDocument>({id: Date.now(), type: 'website', name: '', content: '', agentId: agent.id});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const { addNotification } = useNotifications()

  const analyzeWebsite = async () => {
    if (!websiteDocument.name.trim()) {
      addNotification('Por favor, insira uma URL válida primeiro.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simular progresso da análise
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    const chunks = await processWebsite(websiteDocument.name);
    console.log(chunks)

    // Simular análise completa após 5 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      alert(t.siteAnalysisComplete);
    }, 5000);
  };

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, [])

  // const handleAddWebsite = async () => {
  //   if (!configuration.websiteUrl || !isValidUrl(configuration.websiteUrl)) {
  //     addNotification('Por favor, insira uma URL de website válida.', 'error')
  //     return
  //   }

  //   setIsLoading(true)
  //   try {
  //     const response = await fetch(`/api/documents/website?url=${configuration.websiteUrl}`, {
  //       credentials: 'include',
  //     })
  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       const errorMessage =
  //         errorData.message || `Erro ao buscar título do website (${response.status}).`
  //       addNotification(`Falha ao adicionar website: ${errorMessage}`, 'error')
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }

  //     const { title } = await response.json()
  //     const website: WebsiteDocument = {
  //       type: 'Website',
  //       name: title ? title : configuration.websiteUrl,
  //       url: configuration.websiteUrl,
  //       metadata: {},
  //       new: true,
  //     }
  //     const id = await handleCreateDocument(website)
  //     if (id !== -1) {
  //       setConfiguration({
  //         websites: [
  //           ...configuration.websites,
  //           {
  //             id: id,
  //             type: 'Website',
  //             name: title ? title : configuration.websiteUrl,
  //             url: configuration.websiteUrl,
  //             metadata: {},
  //             new: true,
  //             status: 'processing',
  //           },
  //         ],
  //         websiteUrl: '',
  //       })
  //       addNotification(
  //         `Website '${title || configuration.websiteUrl}' adicionado com sucesso!`,
  //         'success',
  //       )

  //       const channel = supabase
  //         .channel(`documentUpdate_${id}`)
  //         .on(
  //           'postgres_changes',
  //           { event: 'UPDATE', schema: 'public', table: 'documents', filter: `id=eq.${id}` },
  //           (payload) => {
  //             setNewDocumentsStatus((prev) =>
  //               prev.map((website) =>
  //                 website.id === id
  //                   ? { id, channel: website.channel, status: payload.new.status }
  //                   : website,
  //               ),
  //             )
  //           },
  //         )
  //         .subscribe()
  //       setNewDocumentsStatus((prev) => [
  //         ...prev,
  //         { id: id, channel: channel, status: 'processing' },
  //       ])
  //     }
  //   } catch (error) {
  //     console.error('Erro ao adicionar website:', error)
  //     addNotification('Erro ao adicionar website.', 'error')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div>
      <label className="label">
        <span className="label-text font-medium">{t.websiteUrl}</span>
      </label>
      <div className="flex space-x-3">
        <input
          type="url"
          placeholder={t.websiteUrlPlaceholder}
          className="input input-bordered flex-1"
          value={websiteDocument ? websiteDocument.name : ''}
          onChange={(e) => setWebsiteDocument({ ...websiteDocument, name: e.target.value })}
        />
        <button
          onClick={analyzeWebsite}
          disabled={isAnalyzing || !websiteDocument?.name.trim()}
          className="btn btn-primary"
        >
          {isAnalyzing ? (
            <>
              <div className="loading loading-spinner loading-sm"></div>
              {t.analyzing}
            </>
          ) : (
            t.analyzeSite
          )}
        </button>
      </div>
      <div className="label">
        <span className="label-text-alt">{t.analyzeSiteHelp}</span>
      </div>

      {/* Barra de Progresso */}
      {isAnalyzing && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-neutral mb-2">
            <span>{t.analyzingSite}</span>
            <span>{analysisProgress}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={analysisProgress}
            max="100"
          ></progress>
        </div>
      )}
    </div>
  )
}

export default WebsiteInput

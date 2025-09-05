import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationsProvider";
import { generateChunksFromUrl } from "@/services/chunker";
import { useAgentStore } from "@/store/agent";
import { useTranslation } from "@/translations";
import { Document } from "@/types/agent";
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
    if (!isValidUrl(websiteDocument.name)) {
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

    const result = await generateChunksFromUrl(websiteDocument.name);

    websiteDocument.chunks = result.chunks;
    websiteDocument.name = result.chunks[0].metadata.title;
    websiteDocument.content = result.chunks[0].metadata.source;

    setAgent({
      ...agent,
      documents: [...agent.documents, websiteDocument]
    });

    setWebsiteDocument({ ...websiteDocument, name: '' });

    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      addNotification(t.siteAnalysisComplete);
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

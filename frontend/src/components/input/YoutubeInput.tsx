import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationsProvider";
import { useAgentStore } from "@/store/agent";
import { useDocumentStore } from "@/store/document";
import { useTranslation } from "@/translations";
import { Document } from "@/types/agent";
import { useState } from "react";

const YoutubeInput: React.FC = () => {

  const language = useLanguage();
  const t = useTranslation(language);

  const { agent } = useAgentStore();
  const { createDocument, fetchDocuments } = useDocumentStore();

  const { addNotification } = useNotifications();

  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');

  
  const [ videoDocument ] = useState<Document>({id: -Date.now(), type: 'video', name: '', content: '', agentId: agent.id});
  
  const analyzeYouTubeVideo = async (videoUrl: string) => {
    if (!videoUrl.trim()) {
      addNotification('Por favor, insira uma URL válida do YouTube primeiro.');
      return;
    }

    // Validar se é uma URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
      addNotification('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    setIsAnalyzingVideo(true);
    setVideoAnalysisProgress(0);

    videoDocument.name = `Vídeo do YouTube`;
    videoDocument.content = videoUrl;

    await createDocument(videoDocument);

    await fetchDocuments(agent.id);

    const progressInterval = setInterval(() => {
      setVideoAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzingVideo(false);
          return 100;
        }
        return prev + 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzingVideo(false);
      setVideoAnalysisProgress(100);

      addNotification(t.videoAnalysisComplete);
    }, 3000);
  };

  return (
    <div>
        <label className="label">
          <span className="label-text label-medium-custom">{t.youtubeVideos}</span>
        </label>
        <p className="text-sm text-neutral mb-4">{t.youtubeVideosDesc}</p>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="url"
              placeholder={t.youtubeUrlPlaceholder}
              className="input input-bordered flex-1"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              disabled={isAnalyzingVideo}
            />
            <button
              onClick={() => {
                analyzeYouTubeVideo(youtubeVideoUrl);
                setYoutubeVideoUrl('');
              }}
              disabled={isAnalyzingVideo || !youtubeVideoUrl.trim()}
              className="btn btn-primary"
            >
              {isAnalyzingVideo ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  {t.analyzing}
                </>
              ) : (
                t.analyzeVideo
              )}
            </button>
          </div>

          {isAnalyzingVideo && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-neutral mb-2">
                <span>{t.analyzingVideo}</span>
                <span>{videoAnalysisProgress}%</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={videoAnalysisProgress}
                max="100"
              ></progress>
            </div>
          )}
        </div>
      </div>
  );
};

export default YoutubeInput;
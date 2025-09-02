import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/translations";
import { Agent, Document } from "@/types/agent";
import { processYoutube } from "@/utils/chunk";
import { extractYouTubeVideoId } from "@/utils/video";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface VideoDocument extends Document {
  type: 'video';
}


const YoutubeInput: React.FC = () => {

  const [documents, setDocuments] = useState<Document[]>([]);
  const language = useLanguage();
  const t = useTranslation(language);

  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');

  
  const [videoDocument, setVideoDocument] = useState<VideoDocument>({id: Date.now(), type: 'video', name: '', content: '', agentId: 0});
  
  const analyzeYouTubeVideo = async (videoUrl: string) => {
    if (!videoUrl.trim()) {
      alert('Por favor, insira uma URL válida do YouTube primeiro.');
      return;
    }

    // Validar se é uma URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
      alert('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    setIsAnalyzingVideo(true);
    setVideoAnalysisProgress(0);

    const chunks = await processYoutube(videoUrl);

    console.log(chunks);

    // Simular progresso da análise
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

    // Simular análise completa após 3 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzingVideo(false);
      setVideoAnalysisProgress(100);

      // Extrair ID do vídeo da URL
      const videoId = extractYouTubeVideoId(videoUrl);
      const videoTitle = `Vídeo do YouTube (${videoId})`;

      // Adicionar vídeo à base de conhecimento
      const newVideo = {
        id: Date.now(),
        url: videoUrl,
        title: videoTitle,
        description: 'Conteúdo extraído do vídeo do YouTube',
        transcript: 'Transcrição simulada do vídeo...',
        addedAt: new Date().toISOString()
      };

      // setAgent(prev => ({
      //   ...prev,
      //   knowledgeBase: {
      //     ...prev.knowledgeBase,
      //     youtubeVideos: [...prev.knowledgeBase.youtubeVideos, newVideo]
      //   }
      // }));

      alert(t.videoAnalysisComplete);
    }, 3000);
  };

  // const removeYouTubeVideo = (videoId: number) => {
  //   setAgent(prev => ({
  //     ...prev,
  //     knowledgeBase: {
  //       ...prev.knowledgeBase,
  //       youtubeVideos: prev.knowledgeBase.youtubeVideos.filter(video => video.id !== videoId)
  //     }
  //   }));
  // };

  return (
    <div>
        <label className="label">
          <span className="label-text font-medium">{t.youtubeVideos}</span>
        </label>
        <p className="text-sm text-neutral mb-4">{t.youtubeVideosDesc}</p>

        <div className="space-y-4">
          {/* Input para URL do vídeo */}
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

          {/* Barra de Progresso */}
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

          {/* Lista de vídeos adicionados */}
          {documents.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-base-content mb-3">{t.addedVideos}</h4>
              <div className="space-y-3">
                {documents.map((video) => (
                  <div key={video.id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                            </div>
                            <h5 className="font-semibold text-base-content">{''}</h5>
                          </div>
                          <p className="text-sm text-neutral mb-2">{''}</p>
                          <p className="text-xs text-neutral">{t.addedOn} {new Date('').toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => window.open('', '_blank')}
                            className="btn btn-ghost btn-xs"
                            title={t.openVideo}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <button
                            // onClick={() => removeYouTubeVideo(video.id)}
                            className="btn btn-ghost btn-xs text-error"
                            title={t.removeVideo}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default YoutubeInput;
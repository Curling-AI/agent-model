import { useLanguage } from "@/context/LanguageContext";
import { useAgentStore } from "@/store/agent";
import { useSystemStore } from "@/store/system";
import { useTranslation } from "@/translations";
import { useEffect, useRef, useState } from "react";
import WPOficialButton from "@/components/WPOficialButton";
import { FacebookAccessToken } from "@/types/facebook";
import { useIntegrationStore } from "@/store/integration";
import * as Dialog from '@radix-ui/react-dialog'
import modalStyles from '../modal/Modal.module.css'

const NewAgentChannel: React.FC = () => {
  const language = useLanguage();
  const t = useTranslation(language);
  const { serviceProviders, fetchServiceProviders } = useSystemStore();
  const { agent } = useAgentStore();
  const { subscribeFacebookApp, registerFacebookNumber, upsertIntegration, deleteIntegration } = useIntegrationStore();
  const { integrations, fetchIntegrations, getZapiInstance, getZapiQrCode } = useIntegrationStore();
  const wppConnectionMonitorRef = useRef<NodeJS.Timeout | null>(null)
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false)
  const [qrcode, setQrcode] = useState<string | null>(null)

  useEffect(() => {
    fetchServiceProviders();
    fetchIntegrations(agent.id);
  }, [fetchServiceProviders, fetchIntegrations, agent.id]);

  const connectChannel = async (channelId: number) => {
    if (channelId === 1) {
      document.getElementById('whatsapp-oficial-button')?.click();
      return;
    } else if (channelId === 2) {
      const instance = await getZapiInstance();

      if (instance) {
        await upsertIntegration({
          agentId: agent.id,
          serviceProviderId: 2,
          metadata: {
            ...instance
          }
        });

        generateWhatsappQrCode();
      }
      return;
    }
  };

  const generateWhatsappQrCode = () => {
    setIsWhatsappModalOpen(true)

    const checkWhatsappConnection = async () => {

      const result = await getZapiQrCode();

      if (!result.data) {
        setIsWhatsappModalOpen(false)
      } else {
        wppConnectionMonitorRef.current = setTimeout(checkWhatsappConnection, 5000)
      }
      setQrcode(result.data.qrCode)
      fetchIntegrations(agent.id);
      return;
    }

    wppConnectionMonitorRef.current = setTimeout(checkWhatsappConnection, 3000)
  }

  const handleWhatsappModalClose = () => {
    setIsWhatsappModalOpen(false)

    if (wppConnectionMonitorRef.current) {
      clearTimeout(wppConnectionMonitorRef.current)
    }
  }

  const disconnectChannel = (channelId: number) => {
    deleteIntegration(agent.id, channelId);
  };

  const handleConnectWhatsappOficial = async (data: FacebookAccessToken) => {
    await subscribeFacebookApp(data)

    const result = await upsertIntegration({
      agentId: agent.id,
      serviceProviderId: 1,
      metadata: {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        phoneNumberId: data.phone_number_id,
        businessId: data.business_id,
        wabaId: data.waba_id,
      }
    })

    if (!result.data) {
      console.error('Não foi possível conectar ao WhatsApp Oficial')
    } else {
      const result = await registerFacebookNumber(data.phone_number_id, data.access_token)
      console.log('Número do WhatsApp Oficial registrado com sucesso:', result)
      fetchIntegrations(agent.id);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">{t.serviceChannels}</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {serviceProviders.map(channel => {
          const isConnected = integrations.some(i => i.serviceProviderId === channel.id && i.agentId === agent.id);

          return (
            <div key={channel.id} className="card bg-base-200 hover:bg-base-300 transition-colors">
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${channel.id > 2 ? '' : 'bg-green-500'
                      }`} style={{
                        minWidth: '48px',
                        minHeight: '48px',
                        backgroundColor: channel.id > 2 ? '#4884e4' : undefined
                      }}>
                      {channel.id > 2 ? (
                        <img
                          src="/images/hubsoft-logo.png"
                          alt="Hubsoft Logo"
                          className="w-8 h-8 object-contain flex-shrink-0"
                          style={{ width: '32px', height: '32px' }}
                        />
                      ) : (
                        <svg className="w-6 h-6 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base-content">{channel.name}</h4>
                      <p className="text-sm text-neutral mt-1">{channel.description_pt}</p>
                    </div>
                  </div>
                  <div className={`badge ${isConnected ? 'badge-success-custom' : 'badge-neutral'}`}>
                    {isConnected ? t.connected : t.disconnected}
                  </div>
                </div>

                {
                  channel.id === 1 ? (
                    <WPOficialButton
                      id="whatsapp-oficial-button"
                      visible={false}
                      appId={import.meta.env.VITE_FACEBOOK_APP_ID || ''}
                      graphApiVersion={import.meta.env.VITE_FACEBOOK_GRAPH_API_VERSION || ''}
                      configurationId={import.meta.env.VITE_FACEBOOK_CONFIGURATION_ID || ''}
                      featureType={import.meta.env.VITE_FACEBOOK_FEATURE_TYPE || ''}
                      onLoginSuccess={handleConnectWhatsappOficial}
                    />
                  ) : null}

                {isConnected ? (
                  <button
                    onClick={() => disconnectChannel(channel.id)}
                    className="btn btn-outline btn-error w-full"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t.disconnect}
                  </button>
                ) : (

                  <button
                    onClick={() => connectChannel(channel.id)}
                    className="btn btn-primary w-full"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t.connect}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isWhatsappModalOpen && (
        <Dialog.Root open={isWhatsappModalOpen} onOpenChange={(open) => {
          setIsWhatsappModalOpen(open);
          if (!open) {
            handleWhatsappModalClose();
          }
        }}>
          <Dialog.Portal>
            <Dialog.Overlay className={modalStyles.dialogOverlay} />
            <Dialog.Content className={modalStyles.dialogContent}>
              <Dialog.Title className={modalStyles.dialogTitle}>{t.connectWhatsApp}</Dialog.Title>
              <Dialog.Description className={modalStyles.dialogDescription}>
                {t.scanQrCodeToConnect}
              </Dialog.Description>

              <div className={modalStyles.qrcodeContainer}>
                <img
                  src={qrcode!}
                  alt="QR Code"
                  width={348}
                  height={348}
                />
              </div>

              <div className={modalStyles.dialogActions}>
                <Dialog.Close asChild>
                  <button className={modalStyles.cancelButton} onClick={handleWhatsappModalClose} style={{ textTransform: 'uppercase' }}>
                    {t.close}
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  )
}

export default NewAgentChannel

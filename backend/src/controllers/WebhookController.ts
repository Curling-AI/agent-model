import { getByFilter, getById, upsert } from '@/services/storage';
import { Request, Response } from 'express';
import { AiExecutor } from '@/services/ai/ai-executor';
import { getMediaContent, sendMedia, sendMessage } from '@/services/uazapi';
import { sendMessage as sendMessageZapi } from '@/services/zapi';
import { getMetaMediaContent } from '@/services/facebook';


export const WebhookController = {

  validateMeta: async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifique se o token de verificação corresponde ao esperado
    const verifyToken = process.env.META_VERIFY_TOKEN; // Substitua pela variável de ambiente ou valor fixo

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  },

  upsertMeta: async (req: Request, res: Response) => {

    // Used to avoid multiple responses
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;

      // Verifica se o evento é do tipo mensagem
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          const entryId = entry.id;
          for (const change of entry.changes) {
            const value = change.value;
            const field = change.field;

            // Mapeamento dos campos principais do objeto recebido
            const metadata = value.metadata; // Informações da conta
            const contacts = value.contacts; // Contatos envolvidos
            const messages = value.messages; // Mensagens recebidas

            if (messages && Array.isArray(messages)) {
              for (const message of messages) {
                const messageId = message.id;
                const from = message.from;
                const timestamp = message.timestamp;
                const type = message.type;
                const text = message.text?.body;
                const interactive = message.interactive;
                const image = message.image;
                const audio = message.audio;
                const video = message.video;
                const document = message.document;

                const integrations = await getByFilter('integrations', { 'metadata->>phoneNumberId': metadata.phone_number_id });

                if (!integrations || integrations.length === 0) {
                  return res.status(404).json({ error: 'Integration not found' });
                }

                let conversation;
                const phone = from.replace(/[^0-9]/g, '')
                const agent = await getById('agents', integrations[0]['agent_id']);

                if (!agent) {
                  return res.status(404).json({ error: 'Agent not found' });
                }

                let lead = await getByFilter('leads', { phone });

                if (lead && lead.length > 0) {
                  const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
                  conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
                } else {
                  const newLead = await upsert('leads', { phone: phone, name: contacts[0].profile || 'Desconhecido', organization_id: agent['organization_id'], value: 0, source: 'whatsapp' });
                  conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
                }

                await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: text, metadata: message, timestamp: new Date(timestamp) });

                if (conversation['mode'] === 'agent') {
                  let message;

                  if (type !== 'text') {
                    const mediaContent = await getMetaMediaContent(message, integrations[0]['metadata']['accessToken']);
                    message = await AiExecutor.executeAgentMedia(agent['id'], conversation['lead_id'], mediaContent, type);
                  } else {
                    message = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], text);
                  }

                  await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.outputText, metadata: message, timestamp: new Date() });

                  res.status(200).json({ message: 'Webhook processed successfully', conversation });

                  // if (message.type === 'audio') {
                  //   await sendMedia(phone, message.output, 'audio', webhookContent.token);
                  // } else {
                  //   await sendMessage(phone, message.outputText, webhookContent.token);
                  // }

                }

                console.log({
                  entryId,
                  field,
                  metadata,
                  contacts,
                  messageId,
                  from,
                  timestamp,
                  type,
                  text,
                  interactive,
                  image,
                  audio,
                  video,
                  document,
                });
              }
            }
          }
        }
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to process webhook', details: err });
    }
  },

  upsertZapi: async (req: Request, res: Response) => {
    try {
      const webhookContent = req.body;
      let conversation;
      const integrations = await getByFilter('integrations', { 'metadata->instance->>id': webhookContent.instanceId });

      if (!integrations) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const agent = await getById('agents', integrations[0]['agent_id']);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      let lead = await getByFilter('leads', { phone: webhookContent.phone });

      if (lead && lead.length > 0) {
        const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
        conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
      } else {
        const newLead = await upsert('leads', { phone: webhookContent.phone, name: webhookContent.senderName || 'Desconhecido', organization_id: agent['organization_id'], value: 0 });
        conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
      }

      await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: webhookContent.text.message, metadata: webhookContent, timestamp: new Date(webhookContent.momment) });

      if (conversation['mode'] === 'agent') {
        const message = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], webhookContent.text.message);

        await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.output, metadata: message, timestamp: new Date() });
        await sendMessageZapi('5521997363927', message.output);
      }

      res.status(200).json({ message: 'Webhook processed successfully', conversation });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },

  upsertUazapi: async (req: Request, res: Response) => {
    try {
      const webhookContent = req.body;

      if (webhookContent.message.fromMe) {
        return res.status(200).json({ message: 'Message from self, ignoring.' });
      }

      const integrations = await getByFilter('integrations', { 'metadata->instance->>token': webhookContent.token });

      if (!integrations || integrations.length === 0) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      let conversation;
      const phone = webhookContent.message.sender_pn.replace(/[^0-9]/g, '')
      const agent = await getById('agents', integrations[0]['agent_id']);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      let lead = await getByFilter('leads', { phone });

      if (lead && lead.length > 0) {
        const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
        conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
      } else {
        const newLead = await upsert('leads', { phone: phone, name: webhookContent.message.senderName || 'Desconhecido', organization_id: agent['organization_id'], value: 0, source: 'whatsapp' });
        conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
      }

      await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: webhookContent.message.text, metadata: webhookContent, timestamp: new Date(webhookContent.message.messageTimestamp) });

      if (conversation['mode'] === 'agent') {
        let message;

        if (webhookContent.message.type === 'media') {
          const mediaContent = await getMediaContent(webhookContent.message.messageid, webhookContent.token);
          message = await AiExecutor.executeAgentMedia(agent['id'], conversation['lead_id'], mediaContent, webhookContent.message.messageType === 'ImageMessage' ? 'image' : 'audio');
        } else {
          message = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], webhookContent.message.text);
        }

        await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.outputText, metadata: message, timestamp: new Date() });

        res.status(200).json({ message: 'Webhook processed successfully', conversation });

        if (message.type === 'audio') {
          await sendMedia(phone, message.output, 'audio', webhookContent.token);
        } else {
          await sendMessage(phone, message.outputText, webhookContent.token);
        }

      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },

}
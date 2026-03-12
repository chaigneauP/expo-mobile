import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Conversation } from '../types';

function formatConversation(conversation: Conversation): string {
  const lines: string[] = [];

  lines.push(`=== ${conversation.title} ===`);
  lines.push(`Date: ${conversation.createdAt.toLocaleString()}`);
  lines.push('');

  for (const message of conversation.messages) {
    const role = message.role === 'user' ? 'Vous' : 'ChatGPT';
    const time = message.timestamp.toLocaleTimeString();
    lines.push(`[${time}] ${role}:`);
    lines.push(message.content);
    lines.push('');
  }

  return lines.join('\n');
}

export async function exportConversation(conversation: Conversation): Promise<void> {
  const content = formatConversation(conversation);
  const filename = `chatgpt-${conversation.id}-${Date.now()}.txt`;
  const fileUri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: 'Exporter la conversation',
    UTI: 'public.plain-text',
  });
}

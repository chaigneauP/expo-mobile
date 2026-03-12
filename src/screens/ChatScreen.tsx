import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Message, Conversation } from '../types';
import { sendMessage, isApiKeyConfigured } from '../services/openai';
import { exportConversation } from '../services/export';
import MessageBubble from '../components/MessageBubble';

let _idCounter = 0;
function generateId(): string {
  _idCounter += 1;
  return `${Date.now().toString(36)}-${_idCounter.toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export default function ChatScreen() {
  const [conversation, setConversation] = useState<Conversation>({
    id: generateId(),
    title: 'Nouvelle conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    if (!isApiKeyConfigured()) {
      Alert.alert(
        'Clé API manquante',
        'Veuillez configurer votre clé API OpenAI dans le fichier .env :\n\nEXPO_PUBLIC_OPENAI_API_KEY=sk-...',
        [{ text: 'OK' }]
      );
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation: Conversation = {
      ...conversation,
      title:
        conversation.messages.length === 0
          ? text.substring(0, 50)
          : conversation.title,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    setConversation(updatedConversation);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const responseContent = await sendMessage(updatedMessages);
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date(),
      }));
      scrollToBottom();
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Une erreur est survenue.';
      Alert.alert('Erreur', errMsg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, conversation, scrollToBottom]);

  const handleExport = useCallback(async () => {
    if (conversation.messages.length === 0) {
      Alert.alert(
        'Aucun message',
        'La conversation est vide. Commencez à discuter avant d\'exporter.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await exportConversation(conversation);
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Erreur lors de l\'export.';
      Alert.alert('Erreur d\'export', errMsg, [{ text: 'OK' }]);
    }
  }, [conversation]);

  const handleNewConversation = useCallback(() => {
    if (conversation.messages.length === 0) return;

    Alert.alert(
      'Nouvelle conversation',
      'Voulez-vous démarrer une nouvelle conversation ? La conversation actuelle sera effacée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Nouvelle',
          style: 'destructive',
          onPress: () => {
            setConversation({
              id: generateId(),
              title: 'Nouvelle conversation',
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          },
        },
      ]
    );
  }, [conversation.messages.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleNewConversation}>
          <Text style={styles.headerButtonText}>＋</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {conversation.title}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
          <Text style={styles.headerButtonText}>⬆</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>ChatGPT Mobile</Text>
              <Text style={styles.emptySubtitle}>
                Posez votre première question pour commencer la conversation.
              </Text>
            </View>
          }
          onContentSizeChange={scrollToBottom}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#10a37f" />
            <Text style={styles.typingText}>ChatGPT réfléchit…</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Envoyer un message…"
            placeholderTextColor="#666"
            multiline
            maxLength={4000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingText: {
    color: '#888',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10a37f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});

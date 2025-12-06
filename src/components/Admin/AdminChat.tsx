import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageCircle, Send, Loader2, CheckCircle, Clock, X, Trash2, RefreshCw } from 'lucide-react';
import { chatService, Conversation, Message } from '../../services/chatService';
import { RealtimeChannel } from '@supabase/supabase-js';

const MessageItem = memo(({ message }: { message: Message }) => (
  <div className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
        message.is_admin
          ? 'bg-teal-600 text-white'
          : 'bg-white text-gray-800 border border-gray-200'
      }`}
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    >
      {!message.is_admin && (
        <p className="text-xs font-semibold text-gray-600 mb-1">Cliente</p>
      )}
      <p className="text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{message.content}</p>
      <p
        className={`text-xs mt-1 ${
          message.is_admin ? 'text-teal-100' : 'text-gray-500'
        }`}
      >
        {new Date(message.created_at).toLocaleTimeString('es-DO', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  </div>
));

export function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
  const conversationUpdateChannelRef = useRef<RealtimeChannel | null>(null);
  const allMessagesChannelRef = useRef<RealtimeChannel | null>(null);
  const shouldScrollRef = useRef(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (shouldScrollRef.current && messagesContainerRef.current) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const msgs = await chatService.getMessages(conversationId);
    setMessages(msgs);
    shouldScrollRef.current = true;
  }, []);

  // ✅ CORRECCIÓN: Convertir loadConversations en useCallback estable
  const loadConversations = useCallback(async () => {
    const convs = await chatService.getAllConversations();
    setConversations(convs);
    setLoading(false);
  }, []);

  // ✅ CORRECCIÓN: Cleanup sincrónico, sin wrapper async innecesario
  useEffect(() => {
    loadConversations();

    conversationsChannelRef.current = chatService.subscribeToConversations(() => {
      loadConversations();
    });

    allMessagesChannelRef.current = chatService.subscribeToAllMessages(() => {
      loadConversations();
    });

    return () => {
      // Cleanup sincrónico - los métodos unsubscribe deberían manejar la limpieza
      if (channelRef.current) {
        chatService.unsubscribe(channelRef.current);
      }
      if (conversationsChannelRef.current) {
        chatService.unsubscribe(conversationsChannelRef.current);
      }
      if (conversationUpdateChannelRef.current) {
        chatService.unsubscribe(conversationUpdateChannelRef.current);
      }
      if (allMessagesChannelRef.current) {
        chatService.unsubscribe(allMessagesChannelRef.current);
      }
    };
  }, [loadConversations]);

  // ✅ CORRECCIÓN: Cleanup sincrónico aquí también
  useEffect(() => {
    const setupChannel = async () => {
      if (selectedConversation) {
        loadMessages(selectedConversation);

        if (channelRef.current) {
          await chatService.unsubscribe(channelRef.current);
          channelRef.current = null;
        }

        if (conversationUpdateChannelRef.current) {
          await chatService.unsubscribe(conversationUpdateChannelRef.current);
          conversationUpdateChannelRef.current = null;
        }

        channelRef.current = chatService.subscribeToMessages(selectedConversation, (message) => {
          console.log('AdminChat received new message:', message);
          setMessages((prev) => {
            const isDuplicate = prev.some(m => m.id === message.id);
            if (isDuplicate) {
              console.log('AdminChat: Duplicate message ignored');
              return prev;
            }
            console.log('AdminChat: Adding new message to state');
            return [...prev, message];
          });
          shouldScrollRef.current = true;
        });

        conversationUpdateChannelRef.current = chatService.subscribeToConversationUpdates(selectedConversation, (conversation) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === conversation.id ? conversation : c))
          );
        });
      }
    };

    setupChannel();

    return () => {
      // Cleanup sincrónico
      if (channelRef.current) {
        chatService.unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      if (conversationUpdateChannelRef.current) {
        chatService.unsubscribe(conversationUpdateChannelRef.current);
        conversationUpdateChannelRef.current = null;
      }
    };
  }, [selectedConversation, loadMessages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);

    const messageContent = newMessage.trim();
    setNewMessage('');
    shouldScrollRef.current = true;

    const success = await chatService.sendMessage(selectedConversation, messageContent, true);

    if (!success) {
      setNewMessage(messageContent);
    }

    setSending(false);
  }, [newMessage, selectedConversation, sending]);

  const handleMessagesScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  const handleCloseConversation = async (conversationId: string) => {
    await chatService.closeConversation(conversationId);
    await loadConversations();
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    const success = await chatService.deleteConversation(conversationId);

    if (success) {
      await loadConversations();
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    }

    setDeleting(false);
  };

  const handleReopenConversation = async (conversationId: string) => {
    const success = await chatService.reopenConversation(conversationId);
    if (success) {
      await loadConversations();
    }
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración - Chat</h1>
          <p className="text-gray-600 mt-2">Gestiona las conversaciones con los clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px', maxHeight: '700px' }}>
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0">
            <div className="bg-teal-600 text-white p-4">
              <h2 className="font-bold text-lg">Conversaciones</h2>
              <p className="text-sm text-teal-100">
                {conversations.filter((c) => c.status === 'open').length} activas
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay conversaciones</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-gray-800 truncate">
                            {conversation.user_email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {conversation.status === 'open' ? (
                              <span className="flex items-center text-xs text-green-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Activa
                              </span>
                            ) : (
                              <span className="flex items-center text-xs text-gray-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Cerrada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conversation.status === 'open' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseConversation(conversation.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              aria-label="Cerrar conversación"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {conversation.status === 'closed' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReopenConversation(conversation.id);
                                }}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                aria-label="Reabrir conversación"
                                title="Reabrir conversación"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                                disabled={deleting}
                                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                aria-label="Eliminar conversación"
                                title="Eliminar conversación"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.last_message_at).toLocaleString('es-DO', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg flex flex-col min-h-0 overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {selectedConvData?.user_email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Estado:{' '}
                        <span
                          className={
                            selectedConvData?.status === 'open'
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-500'
                          }
                        >
                          {selectedConvData?.status === 'open' ? 'Activa' : 'Cerrada'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedConvData?.status === 'open' && (
                        <button
                          onClick={() => handleCloseConversation(selectedConversation)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          Cerrar Chat
                        </button>
                      )}
                      {selectedConvData?.status === 'closed' && (
                        <>
                          <button
                            onClick={() => {
                              if (selectedConversation) {
                                handleReopenConversation(selectedConversation);
                              }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Reabrir</span>
                          </button>
                          <button
                            onClick={() => {
                              if (selectedConversation) {
                                handleDeleteConversation(selectedConversation);
                              }
                            }}
                            disabled={deleting}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 will-change-transform min-h-0"
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No hay mensajes en esta conversación</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageItem key={message.id} message={message} />
                    ))
                  )}
                </div>

                {selectedConvData?.status === 'open' && (
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-200 bg-white"
                  >
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Enviar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg">Selecciona una conversación</p>
                  <p className="text-sm">para comenzar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, Message } from '../../services/chatService';
import { RealtimeChannel } from '@supabase/supabase-js';

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<'open' | 'closed'>('open');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const conversationChannelRef = useRef<RealtimeChannel | null>(null);
  const shouldScrollRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (shouldScrollRef.current && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ CORRECCIÓN: Usar useRef para evitar cambios en la referencia
  const initializeChatRef = useRef<() => Promise<void>>();

  initializeChatRef.current = useCallback(async () => {
    setLoading(true);

    // ✅ CORRECCIÓN: Limpiar intervalo anterior si existe
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    const convId = await chatService.getOrCreateConversation();

    if (convId) {
      setConversationId(convId);

      const conversation = await chatService.getConversationById(convId);
      if (conversation) {
        setConversationStatus(conversation.status);
      }

      const msgs = await chatService.getMessages(convId);
      setMessages(msgs);
      shouldScrollRef.current = true;

      if (channelRef.current) {
        await chatService.unsubscribe(channelRef.current);
        channelRef.current = null;
      }

      if (conversationChannelRef.current) {
        await chatService.unsubscribe(conversationChannelRef.current);
        conversationChannelRef.current = null;
      }

      channelRef.current = chatService.subscribeToMessages(convId, (message) => {
        console.log('ChatWidget received new message:', message);
        setMessages((prev) => {
          const isDuplicate = prev.some(m => m.id === message.id);
          if (isDuplicate) {
            console.log('ChatWidget: Duplicate message ignored');
            return prev;
          }
          console.log('ChatWidget: Adding new message to state');
          return [...prev, message];
        });
        shouldScrollRef.current = true;
      });

      conversationChannelRef.current = chatService.subscribeToConversationUpdates(convId, (conversation) => {
        console.log('ChatWidget received conversation status update:', conversation.status);
        setConversationStatus(conversation.status);
        if (conversation.status === 'closed' && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      });

      pollIntervalRef.current = setInterval(async () => {
        const { data: convData } = await chatService.checkConversationStatus(convId);
        if (convData && convData.status === 'closed') {
          console.log('Conversation closed detected via polling');
          setConversationStatus('closed');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }, 2000);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      if (!conversationId) {
        initializeChatRef.current?.();
      } else {
        const setupSubscriptions = async () => {
          if (channelRef.current) {
            await chatService.unsubscribe(channelRef.current);
            channelRef.current = null;
          }

          if (conversationChannelRef.current) {
            await chatService.unsubscribe(conversationChannelRef.current);
            conversationChannelRef.current = null;
          }

          channelRef.current = chatService.subscribeToMessages(conversationId, (message) => {
            console.log('ChatWidget received new message:', message);
            setMessages((prev) => {
              const isDuplicate = prev.some(m => m.id === message.id);
              if (isDuplicate) {
                console.log('ChatWidget: Duplicate message ignored');
                return prev;
              }
              console.log('ChatWidget: Adding new message to state');
              return [...prev, message];
            });
            shouldScrollRef.current = true;
          });

          conversationChannelRef.current = chatService.subscribeToConversationUpdates(conversationId, (conversation) => {
            console.log('ChatWidget received conversation status update:', conversation.status);
            setConversationStatus(conversation.status);
            if (conversation.status === 'closed' && pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          });
        };

        setupSubscriptions();
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (channelRef.current) {
        chatService.unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      if (conversationChannelRef.current) {
        chatService.unsubscribe(conversationChannelRef.current);
        conversationChannelRef.current = null;
      }
    };
  }, [isOpen, user, conversationId]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    const success = await chatService.sendMessage(conversationId, newMessage.trim(), false);

    if (success) {
      setNewMessage('');
      shouldScrollRef.current = true;
    }

    setSending(false);
  }, [newMessage, conversationId, sending]);

  const handleContainerScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  // ✅ CORRECCIÓN: Hacer async/await correctamente
  const handleNewConversation = useCallback(async () => {
    setConversationId(null);
    setConversationStatus('open');
    setMessages([]);
    setNewMessage('');
    
    if (channelRef.current) {
      await chatService.unsubscribe(channelRef.current);
      channelRef.current = null;
    }
    if (conversationChannelRef.current) {
      await chatService.unsubscribe(conversationChannelRef.current);
      conversationChannelRef.current = null;
    }
    
    await initializeChatRef.current?.();
  }, []);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200 hover:scale-110 z-50"
        aria-label="Chat con soporte"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-5rem)] sm:h-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col animate-scaleIn">
          <div className="bg-teal-600 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">Chat de Soporte</h3>
            <p className="text-sm text-teal-100">Estamos aquí para ayudarte</p>
          </div>

          <div
            ref={containerRef}
            onScroll={handleContainerScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 will-change-transform"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              </div>
            ) : conversationStatus === 'closed' ? (
              <>
                <div className="space-y-3 mb-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          message.is_admin
                            ? 'bg-white text-gray-800 border border-gray-200'
                            : 'bg-teal-600 text-white'
                        }`}
                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                      >
                        {message.is_admin && (
                          <p className="text-xs font-semibold text-teal-600 mb-1">
                            Soporte
                          </p>
                        )}
                        <p className="text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.is_admin ? 'text-gray-500' : 'text-teal-100'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString('es-DO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 bg-white rounded-b-2xl">
                  <div className="text-center text-gray-600 space-y-4 p-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-orange-500" />
                    <div>
                      <p className="font-semibold text-base mb-1">Conversación finalizada</p>
                      <p className="text-xs text-gray-500 mb-4">El soporte ha cerrado esta conversación.</p>
                    </div>
                    <button
                      onClick={handleNewConversation}
                      className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-semibold w-full"
                    >
                      Iniciar nueva conversación
                    </button>
                  </div>
                </div>
              </>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Inicia la conversación</p>
                  <p className="text-sm">Te responderemos pronto</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      message.is_admin
                        ? 'bg-white text-gray-800 border border-gray-200'
                        : 'bg-teal-600 text-white'
                    }`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    {message.is_admin && (
                      <p className="text-xs font-semibold text-teal-600 mb-1">
                        Soporte
                      </p>
                    )}
                    <p className="text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.is_admin ? 'text-gray-500' : 'text-teal-100'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString('es-DO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {conversationStatus === 'open' && (
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Enviar mensaje"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
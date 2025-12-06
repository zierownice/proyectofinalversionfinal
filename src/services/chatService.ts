import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  user_email?: string;
}

export const chatService = {
  async isAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin === true;
  },

  async getOrCreateConversation(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();

    if (existingConversation) {
      return existingConversation.id;
    }

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        status: 'open',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConversation.id;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data as Message[];
  },

  async sendMessage(conversationId: string, content: string, isAdmin: boolean = false): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          is_admin: isAdmin,
        });

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception sending message:', error);
      return false;
    }
  },

  subscribeToMessages(conversationId: string, callback: (message: Message) => void): RealtimeChannel {
    const channel = supabase
      .channel(`messages:${conversationId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages channel:', conversationId);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to messages channel');
        }
      });

    return channel;
  },

  async getAllConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        user_id,
        status,
        created_at,
        updated_at,
        last_message_at
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const conversationsWithEmails = await Promise.all(
      (data as Conversation[]).map(async (conv) => {
        const { data: emailData, error: emailError } = await supabase
          .rpc('get_user_email', { user_uuid: conv.user_id });

        if (emailError) {
          console.error('Error fetching user email:', emailError);
        }

        return {
          ...conv,
          user_email: emailData || 'Unknown',
        };
      })
    );

    return conversationsWithEmails;
  },

  async closeConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error closing conversation:', error);
      return false;
    }

    return true;
  },

  async deleteConversation(conversationId: string): Promise<boolean> {
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return false;
    }

    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      return false;
    }

    return true;
  },

  subscribeToConversationUpdates(conversationId: string, callback: (conversation: Conversation) => void): RealtimeChannel {
    const channel = supabase
      .channel(`conversation-updates:${conversationId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Conversation update received:', payload.new);
          callback(payload.new as Conversation);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to conversation updates:', conversationId);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to conversation updates');
        }
      });

    return channel;
  },

  subscribeToConversations(callback: () => void): RealtimeChannel {
    const channel = supabase
      .channel(`conversations:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          callback();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          callback();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to conversations channel');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to conversations channel');
        }
      });

    return channel;
  },

  subscribeToAllMessages(callback: () => void): RealtimeChannel {
    const channel = supabase
      .channel(`all-messages:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          callback();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to all messages channel');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to all messages channel');
        }
      });

    return channel;
  },

  async checkConversationStatus(conversationId: string) {
    return await supabase
      .from('conversations')
      .select('id, status')
      .eq('id', conversationId)
      .maybeSingle();
  },

  async reopenConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('reopen_conversation', {
        conv_id: conversationId,
      });

      if (error) {
        console.error('Error reopening conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception reopening conversation:', error);
      return false;
    }
  },

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data as Conversation;
  },

  // ✅ CORRECCIÓN: Método sincrónico para compatibilidad con cleanup de React
  unsubscribe(channel: RealtimeChannel): void {
    try {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
    }
  },
};
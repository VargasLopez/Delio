import { supabase } from './supabase';

export const ChatService = {
  /**
   * Resolves or creates a peer-to-peer chat thread regarding a specific errand.
   * @param {string} jobId - Associated job listing ID
   * @param {string} receiverId - ID of recipient user
   * @param {string} currentUserId - ID of active logged in user
   */
  async getOrCreateChat(jobId, receiverId, currentUserId) {
    try {
      // 1. Fetch job title and posters names to store in chat metadata
      const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      const { data: senderProfile } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
      const { data: receiverProfile } = await supabase.from('profiles').select('*').eq('id', receiverId).single();

      const jobTitle = job ? job.title : 'Mandado P2P';
      const senderName = senderProfile ? senderProfile.full_name : 'Usuario';
      const receiverName = receiverProfile ? receiverProfile.full_name : 'Usuario';

      // 2. Query to see if thread exists
      // Real Supabase SQL: select * where (user_a = a and user_b = b) or (user_a = b and user_b = a)
      const { data: existingChats } = await supabase
        .from('chats')
        .select('*')
        .eq('job_id', jobId)
        .execute();

      const chatThread = existingChats?.find(c => 
        (c.user_a === currentUserId && c.user_b === receiverId) ||
        (c.user_a === receiverId && c.user_b === currentUserId)
      );

      if (chatThread) return { data: chatThread, error: null };

      // 3. Thread doesn't exist, insert new chat row
      const newChatRow = {
        job_id: jobId,
        job_title: jobTitle,
        user_a: currentUserId,
        user_a_name: senderName,
        user_b: receiverId,
        user_b_name: receiverName,
        created_at: new Date().toISOString()
      };

      const { data: inserted, error } = await supabase
        .from('chats')
        .insert(newChatRow)
        .select();

      if (error) throw error;
      return { data: inserted[0], error: null };
    } catch (err) {
      console.error("[ChatService] Error resolving chat thread:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetches all direct messaging threads for a given user.
   */
  async getChats(userId) {
    try {
      // Fetch threads where user is user_a OR user_b
      const { data: chatsA, error: errA } = await supabase
        .from('chats')
        .select('*')
        .eq('user_a', userId)
        .execute();

      const { data: chatsB, error: errB } = await supabase
        .from('chats')
        .select('*')
        .eq('user_b', userId)
        .execute();

      if (errA) throw errA;
      if (errB) throw errB;

      // Combine arrays and sort descending
      const combined = [...(chatsA || []), ...(chatsB || [])];
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return { data: combined, error: null };
    } catch (err) {
      console.error("[ChatService] Error loading user chats:", err);
      return { data: [], error: err };
    }
  },

  /**
   * Loads all historical messages in a thread.
   */
  async getMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error(`[ChatService] Error loading messages for ${chatId}:`, err);
      return { data: [], error: err };
    }
  },

  /**
   * Posts a new message text string to the thread.
   */
  async sendMessage(chatId, senderId, text) {
    try {
      const messageRow = {
        chat_id: chatId,
        sender_id: senderId,
        message_text: text,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageRow)
        .select();

      if (error) throw error;
      
      // Update parent chat 'created_at' timestamp to push thread to top of list
      await supabase.from('chats').update({ created_at: new Date().toISOString() }).eq('id', chatId).select();

      return { data: data[0], error: null };
    } catch (err) {
      console.error("[ChatService] Error sending message:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Listens to real-time additions of chat messages for a specific chat.
   * @param {string} chatId
   * @param {Function} onNewMessageCallback
   */
  subscribeToMessages(chatId, onNewMessageCallback) {
    const channel = supabase.channel(`chat-room-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.new && payload.new.chat_id === chatId) {
            onNewMessageCallback(payload.new);
          }
        }
      )
      .subscribe();

    return channel;
  }
};

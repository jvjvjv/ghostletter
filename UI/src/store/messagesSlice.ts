import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { Message, MessageType } from "@/types/Message";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  getConversation,
  sendMessage as apiSendMessage,
  markMessageAsRead as apiMarkAsRead,
  markMessageAsViewed as apiMarkAsViewed,
  getAllMessages,
} from "@/clientApi/messages";

export interface MessagesState {
  messages: Array<Message>;
  loading: boolean;
  error: string | null;
  conversationLoading: Record<number, boolean>; // Track loading per conversation
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  error: null,
  conversationLoading: {},
};

// Async thunks
export const fetchConversationThunk = createAsyncThunk(
  "messages/fetchConversation",
  async ({ friendId, currentUserId }: { friendId: number; currentUserId: number }, { rejectWithValue }) => {
    try {
      const messages = await getConversation(friendId, currentUserId);
      return { friendId, messages };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch conversation");
    }
  },
);

export const fetchAllMessagesThunk = createAsyncThunk(
  "messages/fetchAllMessages",
  async ({ currentUserId }: { currentUserId: number }, { rejectWithValue }) => {
    try {
      const messages = await getAllMessages(currentUserId);
      return messages;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch messages");
    }
  },
);

export const sendMessageThunk = createAsyncThunk(
  "messages/sendMessage",
  async (
    {
      recipientId,
      content,
      type,
      currentUserId,
      imageId,
    }: {
      recipientId: number;
      content: string;
      type: MessageType;
      currentUserId: number;
      imageId?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const message = await apiSendMessage(recipientId, content, type, currentUserId, imageId);
      return message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to send message");
    }
  },
);

export const markReadThunk = createAsyncThunk(
  "messages/markRead",
  async ({ messageId, currentUserId }: { messageId: number; currentUserId: number }, { rejectWithValue }) => {
    try {
      const message = await apiMarkAsRead(messageId, currentUserId);
      return message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to mark message as read");
    }
  },
);

export const markViewedThunk = createAsyncThunk(
  "messages/markViewed",
  async ({ messageId, currentUserId }: { messageId: number; currentUserId: number }, { rejectWithValue }) => {
    try {
      const message = await apiMarkAsViewed(messageId, currentUserId);
      return message;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to mark message as viewed");
    }
  },
);

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.messages = state.messages.filter((message) => message.id !== action.payload);
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex((message) => message.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    markMessageAsRead: (state, action: PayloadAction<number>) => {
      const index = state.messages.findIndex((message) => message.id === action.payload);
      if (index !== -1) state.messages[index].isRead = true;
    },
    setExpiryTimestamp: (state, action: PayloadAction<{ id: number; expiryTimestamp: number }>) => {
      const index = state.messages.findIndex((message) => message.id === action.payload.id);
      if (index !== -1) state.messages[index].expiryTimestamp = action.payload.expiryTimestamp;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch conversation thunk
    builder.addCase(fetchConversationThunk.pending, (state, action) => {
      state.conversationLoading[action.meta.arg.friendId] = true;
      state.error = null;
    });
    builder.addCase(fetchConversationThunk.fulfilled, (state, action) => {
      state.conversationLoading[action.payload.friendId] = false;

      // Replace messages for this conversation
      const otherMessages = state.messages.filter((msg) => msg.friendId !== action.payload.friendId);
      state.messages = [...otherMessages, ...action.payload.messages];
      state.error = null;
    });
    builder.addCase(fetchConversationThunk.rejected, (state, action) => {
      state.conversationLoading[action.meta.arg.friendId] = false;
      state.error = action.payload as string;
    });

    // Fetch all messages thunk
    builder.addCase(fetchAllMessagesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllMessagesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload;
      state.error = null;
    });
    builder.addCase(fetchAllMessagesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Send message thunk
    builder.addCase(sendMessageThunk.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });

    // Mark read thunk
    builder.addCase(markReadThunk.fulfilled, (state, action) => {
      const index = state.messages.findIndex((msg) => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    });

    // Mark viewed thunk
    builder.addCase(markViewedThunk.fulfilled, (state, action) => {
      const index = state.messages.findIndex((msg) => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    });
  },
});

export const { addMessage, removeMessage, updateMessage, markMessageAsRead, setExpiryTimestamp, setMessages } =
  messagesSlice.actions;

export const selectMessages = (state: { messages: MessagesState }) => state.messages.messages;
export const selectMessagesLoading = (state: { messages: MessagesState }) => state.messages.loading;
export const selectMessagesError = (state: { messages: MessagesState }) => state.messages.error;
export const selectConversationLoading = (state: { messages: MessagesState }, friendId: number) =>
  state.messages.conversationLoading[friendId] || false;
export const selectMessageById = (state: { messages: MessagesState }, messageId: number) =>
  state.messages.messages.find((message) => message.id === messageId);
export const selectMessagesByFriendId = (state: { messages: MessagesState }, friendId: number) =>
  state.messages.messages.filter((message) => message.friendId === friendId);

export default messagesSlice.reducer;

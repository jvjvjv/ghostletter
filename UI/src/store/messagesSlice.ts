import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { Message } from "@/types/Message";

import MessagesData from "@/data/messages.json";

export interface MessagesState {
  messages: Array<Message>;
}

const initialState: MessagesState = {
  messages: MessagesData as Array<Message>,
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const highestId = state.messages.reduce((id, message) => Math.max(id, message.id), 0);
      const message = { ...action.payload, id: highestId + 1 };
      state.messages.push(message);
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
  },
});
export const { addMessage, removeMessage, updateMessage, markMessageAsRead, setExpiryTimestamp } =
  messagesSlice.actions;

export const selectMessages = (state: { messages: MessagesState }) => state.messages.messages;
export const selectMessageById = (state: { messages: MessagesState }, messageId: number) =>
  state.messages.messages.find((message) => message.id === messageId);
export const selectMessagesByFriendId = (state: { messages: MessagesState }, friendId: number) =>
  state.messages.messages.filter((message) => message.friendId === friendId);

export default messagesSlice.reducer;

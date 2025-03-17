import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { Friend } from "@/types/Friend";

import FriendsData from "@/data/friends.json";

export interface FriendsState {
  friends: Array<Friend>;
}

const initialState: FriendsState = {
  friends: FriendsData as Array<Friend>,
};

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<number>) => {
      state.friends = state.friends.filter((friend) => friend.id !== action.payload);
    },
    updateFriend: (state, action: PayloadAction<Friend>) => {
      const index = state.friends.findIndex((friend) => friend.id === action.payload.id);
      if (index !== -1) {
        state.friends[index] = action.payload;
      }
    },
  },
  extraReducers: (_builder) => {
    // Handle any additional actions here
  },
});
export const { addFriend, removeFriend, updateFriend } = friendsSlice.actions;

export const selectFriends = (state: { friends: FriendsState }) => state.friends.friends;
export const selectFriendById = (state: { friends: FriendsState }, friendId: number) =>
  state.friends.friends.find((friend) => friend.id === friendId);
export const selectFriendByName = (state: { friends: FriendsState }, name: string) =>
  state.friends.friends.find((friend) => friend.name.toLowerCase() === name.toLowerCase());

export default friendsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { Friend } from "@/types/Friend";
import type { PayloadAction } from "@reduxjs/toolkit";

import { getFriendsList } from "@/clientApi/friends";

export interface FriendsState {
  friends: Array<Friend>;
  loading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchFriendsThunk = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const friends = await getFriendsList();
      return friends;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch friends",
      );
    }
  },
);

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<number>) => {
      state.friends = state.friends.filter(
        (friend) => friend.id !== action.payload,
      );
    },
    updateFriend: (state, action: PayloadAction<Friend>) => {
      const index = state.friends.findIndex(
        (friend) => friend.id === action.payload.id,
      );
      if (index !== -1) {
        state.friends[index] = action.payload;
      }
    },
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch friends thunk
    builder.addCase(fetchFriendsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFriendsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.friends = action.payload;
      state.error = null;
    });
    builder.addCase(fetchFriendsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { addFriend, removeFriend, updateFriend, setFriends } =
  friendsSlice.actions;

export const selectFriends = (state: { friends: FriendsState }) =>
  state.friends.friends;
export const selectFriendsLoading = (state: { friends: FriendsState }) =>
  state.friends.loading;
export const selectFriendsError = (state: { friends: FriendsState }) =>
  state.friends.error;
export const selectFriendById = (
  state: { friends: FriendsState },
  friendId: number,
) => state.friends.friends.find((friend) => friend.id === friendId);
export const selectFriendByName = (
  state: { friends: FriendsState },
  name: string,
) =>
  state.friends.friends.find(
    (friend) => friend.name.toLowerCase() === name.toLowerCase(),
  );

export default friendsSlice.reducer;

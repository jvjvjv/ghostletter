import { createSlice } from "@reduxjs/toolkit";

import type { User } from "@/types/User";
import type { PayloadAction } from "@reduxjs/toolkit";

import UsersData from "@/data/users.json";

export interface UsersState {
  users: Array<User>;
}
const initialState: UsersState = {
  users: UsersData as Array<User>,
};
export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((user) => user.username === action.payload.username);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
});
export const { updateUser } = usersSlice.actions;
export const selectUsers = (state: { users: UsersState }) => state.users.users;
export const selectUserByUsername = (state: { users: UsersState }, username: string) =>
  state.users.users.find((user) => user.username === username);
export const selectUserById = (state: { users: UsersState }, id: number) =>
  state.users.users.find((user) => user.id === id);

export default usersSlice.reducer;

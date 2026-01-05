import type { ApiUser } from "./api";
import { apiUserToUser } from "./User";

export interface Friend {
  id: number;
  name: string;
  initials: string;
  color: string;
  imageUrl?: string;
}

// Mapper function to convert API user to Friend
export function apiUserToFriend(apiUser: ApiUser): Friend {
  const user = apiUserToUser(apiUser);

  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    color: user.color,
    imageUrl: apiUser.avatar_url || undefined,
  };
}

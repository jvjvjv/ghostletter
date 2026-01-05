import type { ApiUser } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  password: null | undefined;
  name: string;
  initials: string;
  color: string;
}

// Helper function to generate initials from name
function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper function to generate a random color
function generateColor(): string {
  const colors = [
    "#3498db", // Blue
    "#e74c3c", // Red
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Turquoise
    "#34495e", // Dark Blue
    "#e67e22", // Carrot
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Mapper function to convert API user to frontend User
export function apiUserToUser(apiUser: ApiUser): User {
  // Generate initials if not provided
  const initials = apiUser.initials || generateInitials(apiUser.name);

  // Generate color if not provided
  const color = apiUser.color || generateColor();

  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    password: undefined,
    name: apiUser.name,
    initials,
    color,
  };
}

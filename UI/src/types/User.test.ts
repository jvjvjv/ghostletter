import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiUserToUser } from './User';
import type { ApiUser } from './api';

describe('User Type Mappers', () => {
  describe('apiUserToUser', () => {
    it('should map API user to frontend User with all fields', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        initials: 'TU',
        color: '#3498db',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: undefined,
        name: 'Test User',
        initials: 'TU',
        color: '#3498db',
      });
    });

    it('should generate initials from name when not provided', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 2,
        username: 'johndoe',
        email: 'john@example.com',
        name: 'John Doe',
        initials: null,
        color: '#e74c3c',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.initials).toBe('JD'); // First letter of first + last name
      expect(user.name).toBe('John Doe');
    });

    it('should generate two-letter initials for single name', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 3,
        username: 'madonna',
        email: 'madonna@example.com',
        name: 'Madonna',
        initials: null,
        color: '#2ecc71',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.initials).toBe('MA'); // First two letters
    });

    it('should generate initials for multi-word name (first + last)', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 4,
        username: 'jvs',
        email: 'jvs@example.com',
        name: 'John Vincent Smith',
        initials: null,
        color: '#f39c12',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.initials).toBe('JS'); // First + Last (not middle)
    });

    it('should generate random color when not provided', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 5,
        username: 'colorless',
        email: 'colorless@example.com',
        name: 'Colorless User',
        initials: 'CU',
        color: null,
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.color).toMatch(/^#[0-9a-f]{6}$/); // Valid hex color
      expect([
        '#3498db',
        '#e74c3c',
        '#2ecc71',
        '#f39c12',
        '#9b59b6',
        '#1abc9c',
        '#34495e',
        '#e67e22',
      ]).toContain(user.color); // One of the predefined colors
    });

    it('should handle name with extra whitespace', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 6,
        username: 'spacey',
        email: 'spacey@example.com',
        name: '  John   Doe  ',
        initials: null,
        color: '#9b59b6',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.initials).toBe('JD');
      expect(user.name).toBe('  John   Doe  '); // Original name preserved
    });

    it('should always set password to undefined', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 7,
        username: 'secure',
        email: 'secure@example.com',
        name: 'Secure User',
        initials: 'SU',
        color: '#1abc9c',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.password).toBeUndefined();
    });

    it('should generate consistent initials for same name', () => {
      // Arrange
      const apiUser1: ApiUser = {
        id: 8,
        username: 'user1',
        email: 'user1@example.com',
        name: 'Alice Bob',
        initials: null,
        color: '#3498db',
        avatar_url: null,
      };

      const apiUser2: ApiUser = {
        id: 9,
        username: 'user2',
        email: 'user2@example.com',
        name: 'Alice Bob',
        initials: null,
        color: '#e74c3c',
        avatar_url: null,
      };

      // Act
      const user1 = apiUserToUser(apiUser1);
      const user2 = apiUserToUser(apiUser2);

      // Assert
      expect(user1.initials).toBe(user2.initials);
      expect(user1.initials).toBe('AB');
    });

    it('should generate different colors for different calls (random)', () => {
      // Arrange
      const apiUser1: ApiUser = {
        id: 10,
        username: 'random1',
        email: 'random1@example.com',
        name: 'Random One',
        initials: 'RO',
        color: null,
        avatar_url: null,
      };

      const apiUser2: ApiUser = {
        id: 11,
        username: 'random2',
        email: 'random2@example.com',
        name: 'Random Two',
        initials: 'RT',
        color: null,
        avatar_url: null,
      };

      // Act - Generate multiple users
      const users = [];
      for (let i = 0; i < 20; i++) {
        users.push(apiUserToUser(apiUser1));
      }

      // Assert - At least some variation in colors (randomness)
      const uniqueColors = new Set(users.map((u) => u.color));
      expect(uniqueColors.size).toBeGreaterThan(1); // Should have multiple different colors
    });

    it('should preserve username exactly as provided', () => {
      // Arrange
      const apiUser: ApiUser = {
        id: 12,
        username: 'user_with_underscore',
        email: 'user@example.com',
        name: 'User Name',
        initials: 'UN',
        color: '#34495e',
        avatar_url: null,
      };

      // Act
      const user = apiUserToUser(apiUser);

      // Assert
      expect(user.username).toBe('user_with_underscore');
    });
  });
});

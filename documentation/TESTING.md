# Ghost Letter Testing Documentation

This document outlines the comprehensive testing strategy for the Ghost Letter ephemeral messaging platform.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [API Unit Tests](#api-unit-tests)
3. [E2E Tests](#e2e-tests)
4. [Test Commands](#test-commands)

---

## Testing Overview

### Testing Stack

| Layer | Framework | Location |
|-------|-----------|----------|
| API Unit Tests | PHPUnit | `API/tests/Unit/` |
| API Feature Tests | PHPUnit | `API/tests/Feature/` |
| E2E Tests | Playwright | `UI/e2e/` |

### Test Database

- API tests use SQLite in-memory database for isolation and speed
- E2E tests run against a test environment with seeded data

---

## API Unit Tests

### Repository Tests

Located in `API/tests/Unit/Repositories/`

#### FriendRepositoryTest

| Test Case | Description |
|-----------|-------------|
| `test_get_all_for_user_returns_friends_with_pagination` | Returns paginated friends list with eager-loaded user data |
| `test_get_all_for_user_returns_empty_when_no_friends` | Returns empty collection for user with no friends |
| `test_find_for_user_returns_friendship` | Returns specific friendship with friend user data |
| `test_find_for_user_returns_null_for_other_users_friendship` | Returns null when accessing another user's friendship |
| `test_exists_returns_true_when_friendship_exists` | Correctly identifies existing friendship |
| `test_exists_returns_false_when_no_friendship` | Returns false for non-existent friendship |
| `test_create_creates_friendship_record` | Creates new friendship in database |
| `test_delete_removes_friendship` | Soft deletes friendship record |

#### MessageRepositoryTest

| Test Case | Description |
|-----------|-------------|
| `test_get_all_for_user_returns_sent_and_received_messages` | Returns all messages where user is sender or recipient |
| `test_get_all_for_user_with_pagination` | Properly paginates message results |
| `test_get_conversation_returns_bilateral_messages` | Returns messages in both directions between two users |
| `test_get_conversation_orders_by_created_at` | Conversation messages ordered chronologically |
| `test_find_for_user_returns_message_when_sender` | User can find messages they sent |
| `test_find_for_user_returns_message_when_recipient` | User can find messages they received |
| `test_find_for_user_returns_null_for_unrelated_message` | Returns null for messages user isn't involved with |
| `test_find_for_recipient_returns_message` | Finds message where user is recipient |
| `test_find_for_recipient_returns_null_when_sender` | Returns null when user is sender, not recipient |
| `test_find_for_sender_returns_message` | Finds message where user is sender |
| `test_find_for_sender_returns_null_when_recipient` | Returns null when user is recipient, not sender |
| `test_create_creates_message_record` | Creates new message in database |
| `test_update_modifies_message` | Updates message attributes |
| `test_delete_soft_deletes_message` | Soft deletes message record |

#### ImageRepositoryTest

| Test Case | Description |
|-----------|-------------|
| `test_create_stores_file_and_creates_record` | Uploads file to storage and creates database record |
| `test_create_extracts_image_dimensions` | Correctly extracts width and height from uploaded image |
| `test_create_stores_correct_metadata` | Stores mime_type, size, filename correctly |
| `test_find_returns_image` | Finds image by ID |
| `test_find_returns_null_for_nonexistent` | Returns null for non-existent image ID |
| `test_soft_delete_marks_as_deleted` | Soft deletes image without removing file |
| `test_get_all_for_user_returns_user_images` | Returns only images belonging to specific user |
| `test_get_image_dimensions_extracts_correctly` | Correctly extracts dimensions from various image formats |

### Service Tests

Located in `API/tests/Unit/Services/`

#### FriendServiceTest

| Test Case | Description |
|-----------|-------------|
| `test_get_all_friends_returns_paginated_friends` | Returns friends through repository with pagination |
| `test_get_friends_list_returns_friend_users` | Returns friend user objects, not friendship records |
| `test_get_friend_returns_specific_friendship` | Returns single friendship by ID |
| `test_get_friend_throws_not_found_for_invalid` | Throws ModelNotFoundException for invalid ID |
| `test_add_friend_creates_friendship` | Creates new friendship record |
| `test_add_friend_throws_when_already_friends` | Throws exception when friendship already exists |
| `test_add_friend_throws_when_friending_self` | Throws exception when user tries to friend themselves |
| `test_add_friend_throws_when_friend_user_not_found` | Throws exception when friend user doesn't exist |
| `test_remove_friend_deletes_friendship` | Removes existing friendship |
| `test_remove_friend_throws_not_found_for_invalid` | Throws exception for non-existent friendship |

#### MessageServiceTest

| Test Case | Description |
|-----------|-------------|
| `test_get_all_messages_returns_user_messages` | Returns all messages for user |
| `test_get_conversation_returns_messages_with_friend` | Returns conversation between two users |
| `test_get_message_returns_specific_message` | Returns message by ID |
| `test_get_message_throws_not_found_for_invalid` | Throws exception for non-existent message |
| `test_get_message_throws_not_found_for_unrelated` | Throws exception when user not involved with message |
| `test_send_message_creates_text_message` | Creates text message with correct attributes |
| `test_send_message_creates_image_message` | Creates image message with image_id reference |
| `test_send_message_sets_default_status` | New messages have "sent" status |
| `test_update_message_modifies_content` | Updates message content |
| `test_update_message_throws_when_not_sender` | Only sender can update message |
| `test_mark_as_read_updates_is_read` | Sets is_read to true |
| `test_mark_as_read_updates_status_to_read` | Changes status to "read" |
| `test_mark_as_read_throws_when_not_recipient` | Only recipient can mark as read |
| `test_mark_image_as_viewed_sets_img_viewed` | Sets img_viewed to true |
| `test_mark_image_as_viewed_sets_expiry_timestamp` | Sets expiry 30 seconds in future |
| `test_mark_image_as_viewed_only_sets_expiry_on_first_view` | Subsequent views don't reset expiry |
| `test_mark_image_as_viewed_throws_when_not_recipient` | Only recipient can mark as viewed |
| `test_delete_message_removes_message` | Soft deletes message |
| `test_delete_message_throws_when_not_sender` | Only sender can delete message |

#### ImageServiceTest

| Test Case | Description |
|-----------|-------------|
| `test_upload_image_stores_and_returns_image` | Uploads image and returns Image model |
| `test_upload_image_associates_with_user` | Image record linked to uploading user |
| `test_get_image_returns_image` | Returns image by ID |
| `test_get_image_returns_null_for_nonexistent` | Returns null for invalid ID |
| `test_delete_image_soft_deletes` | Soft deletes image record |
| `test_get_user_images_returns_only_user_images` | Returns images filtered by user |

### Model Tests

Located in `API/tests/Unit/Models/`

#### UserModelTest

| Test Case | Description |
|-----------|-------------|
| `test_user_has_many_friends` | Friends relationship returns Friend collection |
| `test_user_has_many_sent_messages` | sentMessages relationship works correctly |
| `test_user_has_many_received_messages` | receivedMessages relationship works correctly |
| `test_user_has_many_images` | Images relationship returns Image collection |
| `test_user_hidden_attributes` | Password and remember_token are hidden |
| `test_user_fillable_attributes` | Correct attributes are mass assignable |

#### FriendModelTest

| Test Case | Description |
|-----------|-------------|
| `test_friend_belongs_to_user` | user() relationship returns User |
| `test_friend_belongs_to_friend_user` | friendUser() relationship returns User |
| `test_friend_uses_soft_deletes` | Model supports soft deletion |
| `test_friend_has_correct_fillable` | Correct fillable attributes |

#### MessageModelTest

| Test Case | Description |
|-----------|-------------|
| `test_message_belongs_to_sender` | sender() returns User |
| `test_message_belongs_to_recipient` | recipient() returns User |
| `test_message_belongs_to_image` | image() returns Image when set |
| `test_message_image_is_nullable` | image() returns null when no image |
| `test_message_uses_soft_deletes` | Model supports soft deletion |
| `test_message_casts_boolean_fields` | is_read and img_viewed cast to boolean |
| `test_message_casts_expiry_timestamp` | expiry_timestamp cast to datetime |
| `test_message_has_correct_fillable` | Correct fillable attributes |

#### ImageModelTest

| Test Case | Description |
|-----------|-------------|
| `test_image_belongs_to_user` | user() returns User |
| `test_image_has_many_messages` | messages() returns Message collection |
| `test_image_uses_soft_deletes` | Model supports soft deletion |
| `test_image_casts_integer_fields` | size, width, height cast to integer |
| `test_image_has_correct_fillable` | Correct fillable attributes |

---

## API Feature Tests

Located in `API/tests/Feature/`

### Authentication Tests

#### AuthenticationTest

| Test Case | Description |
|-----------|-------------|
| `test_user_can_login_with_valid_credentials` | Returns token on successful login |
| `test_user_cannot_login_with_invalid_credentials` | Returns 401 for wrong password |
| `test_user_cannot_login_with_nonexistent_email` | Returns 401 for unknown email |
| `test_user_can_logout` | Invalidates token on logout |
| `test_unauthenticated_user_cannot_access_protected_routes` | Returns 401 for protected endpoints |
| `test_authenticated_user_can_access_user_endpoint` | Returns user data with valid token |

### Friend Controller Tests

#### FriendControllerTest

| Test Case | Description |
|-----------|-------------|
| `test_index_returns_paginated_friends` | GET /friends returns paginated list |
| `test_index_returns_empty_when_no_friends` | Returns empty array for new user |
| `test_friends_list_returns_friend_users` | GET /friends-list returns user objects |
| `test_store_creates_friendship` | POST /friends creates new friendship |
| `test_store_validates_friend_user_id_required` | Returns 422 without friend_user_id |
| `test_store_validates_friend_user_id_exists` | Returns 422 for non-existent user |
| `test_store_prevents_duplicate_friendship` | Returns 409 when already friends |
| `test_store_prevents_self_friending` | Returns 422 when friending self |
| `test_show_returns_friendship` | GET /friends/{id} returns friendship |
| `test_show_returns_404_for_invalid_id` | Returns 404 for non-existent friendship |
| `test_show_returns_404_for_other_users_friendship` | Cannot view others' friendships |
| `test_destroy_removes_friendship` | DELETE /friends/{id} removes friend |
| `test_destroy_returns_404_for_invalid_id` | Returns 404 for non-existent friendship |

### Message Controller Tests

#### MessageControllerTest

| Test Case | Description |
|-----------|-------------|
| `test_index_returns_all_messages` | GET /messages returns all user messages |
| `test_index_with_pagination` | Pagination parameters work correctly |
| `test_conversation_returns_bilateral_messages` | GET /conversations/{id} returns both directions |
| `test_conversation_returns_empty_for_no_messages` | Empty array when no messages exist |
| `test_store_creates_text_message` | POST /messages creates text message |
| `test_store_creates_image_message` | Creates message with image_id |
| `test_store_validates_recipient_required` | Returns 422 without recipient_id |
| `test_store_validates_content_required_for_text` | Returns 422 for text without content |
| `test_store_validates_image_id_required_for_image` | Returns 422 for image type without image_id |
| `test_show_returns_message` | GET /messages/{id} returns message |
| `test_show_returns_404_for_invalid_id` | Returns 404 for non-existent message |
| `test_show_returns_404_for_unrelated_message` | Cannot view others' messages |
| `test_update_modifies_message` | PATCH /messages/{id} updates message |
| `test_update_returns_403_when_not_sender` | Only sender can update |
| `test_mark_as_read_updates_message` | POST /messages/{id}/mark-read works |
| `test_mark_as_read_returns_403_when_not_recipient` | Only recipient can mark read |
| `test_mark_as_read_updates_status` | Status changes to "read" |
| `test_mark_image_as_viewed_updates_message` | POST /messages/{id}/mark-viewed works |
| `test_mark_image_as_viewed_sets_expiry` | Expiry timestamp set correctly |
| `test_mark_image_as_viewed_returns_403_when_not_recipient` | Only recipient can mark viewed |
| `test_destroy_deletes_message` | DELETE /messages/{id} removes message |
| `test_destroy_returns_403_when_not_sender` | Only sender can delete |

### Image Controller Tests

#### ImageControllerTest

| Test Case | Description |
|-----------|-------------|
| `test_upload_stores_image` | POST /images/upload stores file |
| `test_upload_returns_image_data` | Returns image record with URL |
| `test_upload_validates_file_required` | Returns 422 without file |
| `test_upload_validates_file_is_image` | Returns 422 for non-image file |
| `test_upload_validates_file_max_size` | Returns 422 for file over 10MB |
| `test_upload_extracts_dimensions` | Response includes width/height |
| `test_upload_associates_with_user` | Image linked to authenticated user |

---

## E2E Tests

Located in `UI/e2e/`

### Authentication Workflows

#### auth.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display login form` | Login page renders correctly |
| `should show validation errors for empty form` | Form validation works |
| `should show error for invalid credentials` | Error message displayed |
| `should login successfully with valid credentials` | Redirects to main app |
| `should store auth token in cookies` | Token persisted correctly |
| `should redirect authenticated users away from login` | Login page redirects if already authenticated |
| `should logout user and redirect to login` | Logout clears session |
| `should protect main routes from unauthenticated access` | Redirects to login |

### Friends Workflows

#### friends.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display friends list` | Friends shown on chat page |
| `should show empty state when no friends` | Empty state with CTA |
| `should navigate to chat when friend clicked` | Opens conversation view |
| `should display friend initials and color` | Avatar styling correct |
| `should show add friend functionality` | Add friend UI works |
| `should remove friend` | Friend removal works |

### Chat Workflows

#### chat.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display chat list with recent messages` | Chat previews shown |
| `should show unread indicator for unread text messages` | Dot indicator visible |
| `should show emoji indicator for unread image messages` | Image emoji visible |
| `should sort conversations by latest message` | Most recent first |
| `should truncate long message previews` | Text truncated properly |
| `should navigate to conversation on click` | Opens chat view |
| `should show loading state while fetching` | Loading indicator shown |
| `should show empty state when no conversations` | Empty state displayed |

### Conversation Workflows

#### conversation.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display conversation messages` | Messages rendered correctly |
| `should differentiate sent vs received messages` | Different styling applied |
| `should load friend details in header` | Friend name shown |
| `should send text message` | Message created and displayed |
| `should send message on Enter key` | Keyboard shortcut works |
| `should mark text messages as read on view` | API called automatically |
| `should scroll to bottom on new messages` | Auto-scroll works |
| `should display message timestamps` | Time shown correctly |
| `should handle API errors gracefully` | Error state shown |

### Image Message Workflows

#### image-messages.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display "Click to view photo" for unviewed images` | Button shown initially |
| `should show image on click` | Image becomes visible |
| `should start countdown timer on first view` | Timer displayed |
| `should show 30 second countdown` | Correct duration |
| `should update countdown every second` | Timer decrements |
| `should mark image as expired when timer reaches zero` | Status updated |
| `should blur expired images` | Visual blur applied |
| `should show "Expired" label on expired images` | Label displayed |
| `should not reset timer on subsequent views` | Timer persists |
| `should call mark-viewed API on first view` | API called once |

### Camera Workflows

#### camera.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should request camera permission on mount` | Permission prompt triggered |
| `should display camera stream when permitted` | Video element shows stream |
| `should show error when permission denied` | Error message displayed |
| `should capture photo on button click` | Photo taken successfully |
| `should display captured photo preview` | Preview image shown |
| `should show confirm and discard buttons after capture` | Action buttons visible |
| `should save photo to localStorage on confirm` | Data persisted |
| `should return to camera stream on discard` | Camera view restored |
| `should navigate to send-to on confirm` | Navigation occurs |

### Send To Workflows

#### send-to.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display captured image` | Preview shown |
| `should redirect to camera if no image` | Navigation to camera |
| `should display friends list` | All friends shown |
| `should upload image on friend selection` | API called |
| `should send message after upload` | Message created |
| `should show success notification` | Toast displayed |
| `should show error notification on failure` | Error toast shown |
| `should clear localStorage after success` | Data removed |
| `should return to camera after sending` | Navigation to camera |

### Navigation Workflows

#### navigation.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should navigate between main tabs` | Tab navigation works |
| `should maintain state during navigation` | Redux state preserved |
| `should handle browser back button` | History works correctly |
| `should show correct active tab indicator` | Visual indicator correct |

### Error Handling Workflows

#### error-handling.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should display error state when API fails` | Error UI shown |
| `should allow retry on error` | Retry button works |
| `should handle network timeout` | Timeout handled gracefully |
| `should handle 401 and redirect to login` | Auth error redirects |
| `should handle 404 errors` | Not found handled |
| `should handle 500 server errors` | Server error displayed |

### Real-time Updates

#### realtime.spec.ts

| Test Case | Description |
|-----------|-------------|
| `should update chat list when new message received` | List refreshes |
| `should update unread count on new message` | Counter updates |
| `should update conversation on new message` | Message appears |
| `should handle message status updates` | Status changes shown |

---

## Test Commands

### Running API Tests

```bash
# Run all API tests
cd API && php artisan test

# Run only unit tests
cd API && php artisan test --testsuite=Unit

# Run only feature tests
cd API && php artisan test --testsuite=Feature

# Run specific test file
cd API && php artisan test tests/Unit/Services/MessageServiceTest.php

# Run specific test method
cd API && php artisan test --filter=test_send_message_creates_text_message

# Run with coverage
cd API && php artisan test --coverage

# From monorepo root
pnpm --filter ghost-letter-api test
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time)
cd UI && npx playwright install

# Run all E2E tests
cd UI && npx playwright test

# Run specific test file
cd UI && npx playwright test e2e/auth.spec.ts

# Run tests in headed mode (see browser)
cd UI && npx playwright test --headed

# Run tests in specific browser
cd UI && npx playwright test --project=chromium

# Run with UI mode for debugging
cd UI && npx playwright test --ui

# Generate test report
cd UI && npx playwright show-report

# From monorepo root
pnpm --filter ghost-letter-ui test:e2e
```

### CI/CD Test Commands

```bash
# Run all tests (monorepo)
pnpm test

# Run tests in parallel
pnpm test --parallel

# Run with coverage report
pnpm test:coverage
```

---

## Test Data & Fixtures

### API Test Fixtures

Located in `API/database/factories/`

- **UserFactory** - Creates test users with unique emails
- **FriendFactory** - Creates friendship relationships
- **MessageFactory** - Creates test messages (text and image types)
- **ImageFactory** - Creates test image records

### E2E Test Fixtures

Located in `UI/e2e/fixtures/`

- **users.json** - Test user credentials
- **messages.json** - Sample message data
- **images/** - Test image files for upload

---

## Coverage Goals

| Area | Target Coverage |
|------|-----------------|
| API Repositories | 95%+ |
| API Services | 95%+ |
| API Controllers | 90%+ |
| API Models | 85%+ |
| E2E Critical Paths | 100% |
| E2E Happy Paths | 90%+ |
| E2E Error Handling | 80%+ |

---

## Test Priorities

### P0 - Critical (Must Pass)

- User authentication (login/logout)
- Message sending and receiving
- Image upload and viewing
- Ephemeral image expiry
- Friend management

### P1 - High Priority

- Pagination on all list endpoints
- Authorization checks (ownership validation)
- Message status transitions
- Error handling and validation

### P2 - Medium Priority

- UI loading states
- Empty states
- Navigation flows
- Notifications

### P3 - Low Priority

- Edge cases
- Performance under load
- Browser compatibility

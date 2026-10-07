# Security Specification for LuraSpark

## 1. Data Invariants
1. A User profile (`/users/{userId}`) can only be created, read, and updated by the authenticated user whose `request.auth.uid == userId`.
2. A Chat document (`/chats/{chatId}`) can only be created, read, updated, or deleted by its owner (`userId == request.auth.uid`).
3. A Message document (`/chats/{chatId}/messages/{messageId}`) can only be created, read, or deleted if the parent Chat document belongs to `request.auth.uid` and the message's `userId` matches `request.auth.uid`.
4. Message role must be one of `['user', 'model', 'system']`.
5. Content length is bounded (up to 50,000 characters).
6. Strict key checking prevents shadow fields.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated User Profile Read**: An unauthenticated user attempts to read `/users/victim_123`. -> MUST FAIL (403)
2. **Cross-User Profile Hijack**: User B tries to write to `/users/userA`. -> MUST FAIL (403)
3. **Chat Creation Spoof**: User B creates a chat with `userId: "userA"`. -> MUST FAIL (403)
4. **Chat Hijack / Read**: User B queries or fetches `/chats/chatOfUserA`. -> MUST FAIL (403)
5. **Chat Unauthorized Delete**: User B deletes `/chats/chatOfUserA`. -> MUST FAIL (403)
6. **Chat Timestamp Spoof**: User attempts to forge `createdAt` far in the future or not `request.time`. -> MUST FAIL (403)
7. **Message Injection across Tenant**: User B attempts to insert a message into User A's `/chats/chatOfUserA/messages/msg_1`. -> MUST FAIL (403)
8. **Message Role Poisoning**: User creates a message with role `"admin_override"`. -> MUST FAIL (403)
9. **Oversized Message Attack**: User submits a 2MB message payload exceeding max size. -> MUST FAIL (403)
10. **ID Traversal / Junk Characters**: Creating a doc with an invalid ID like `../system/escape`. -> MUST FAIL (403)
11. **Shadow Key Injection**: Injecting `{ "isSuperAdmin": true }` into a Chat or User update. -> MUST FAIL (403)
12. **Blanket Query Scraping**: User attempts `chats.where('isPinned', '==', true)` without scoping `userId == request.auth.uid`. -> MUST FAIL (403)

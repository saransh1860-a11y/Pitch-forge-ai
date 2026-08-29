# Security Specification & Test Payloads

## Invariants
1. **Ownership & Identity Isolation**: Every project must belong to the authenticated user (`ownerId == request.auth.uid`). Users can only create, read, update, or delete their own pitch projects.
2. **Path ID Integrity**: Document ID `{projectId}` in path must match `isValidId(projectId)` and match `request.resource.data.id` on creation.
3. **Immutability of Core Ownership**: `ownerId` and `createdAt` cannot be altered during updates.
4. **Data Sizing & Injection Prevention**: Strings and arrays are strictly bounded (e.g. startupName <= 200 chars, slides <= 30 items, versions <= 100 items).

## Dirty Dozen Payloads (Targeting `/projects/{projectId}`)
1. **Unauthenticated Read**: Attempting to read project documents without an active Firebase Auth token -> **PERMISSION_DENIED**.
2. **Cross-User Project Access**: User B attempts `get` or `list` on User A's project document -> **PERMISSION_DENIED**.
3. **Owner Spoofing on Create**: User A submits `ownerId: "user_victim_b"` in the payload -> **PERMISSION_DENIED**.
4. **Path ID Mismatch**: Submitting a payload with `id: "proj-123"` to path `/projects/proj-456` -> **PERMISSION_DENIED**.
5. **Path ID Injection**: Attempting to create at path `/projects/..%2Fhack` or path length > 128 chars -> **PERMISSION_DENIED**.
6. **Owner Hijack on Update**: User A attempts to update `ownerId` to someone else -> **PERMISSION_DENIED**.
7. **Created Date Tampering**: User A attempts to modify original `createdAt` -> **PERMISSION_DENIED**.
8. **Invalid Status Injection**: User sends `status: "super_admin_mode"` outside valid enums -> **PERMISSION_DENIED**.
9. **Denial of Wallet Payload**: Sending oversized arrays with 50,000 slides or huge strings -> **PERMISSION_DENIED**.
10. **Blanket Query Scraping**: Running collection-wide query without owner filtering `where('ownerId', '==', auth.uid)` -> **PERMISSION_DENIED**.
11. **Shadow Field Injection**: Injecting unauthorized top-level keys like `isAdmin: true` into the project document -> **PERMISSION_DENIED**.
12. **Malformed Non-String Startup Name**: Sending boolean or array for `startupName` -> **PERMISSION_DENIED**.

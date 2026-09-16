# Authentication Spec — Role-Based Access Control (RBAC)

## Roles & Permissions

| Role | Access Level | Console Access |
|---|---|---|
| `admin` | Full Administrator | ✅ Can access Audit Log Console (`dashboard.html`) |
| `audit.viewer` | Compliance Auditor | ✅ Can access Audit Log Console (`dashboard.html`) |
| `broker` | Broker Platform User | ❌ **DENIED** access to Audit Log Console |

## Admin Credentials (Audit Console Access)
- **Admin ID**: `ADM001` or `admin@company.com`
- **Password**: `Admin@1234`
- **Session Role**: `admin`

## Broker Access Restriction Policy
- **Broker Identifier**: `AB Number` (format `^AB\d{5,7}$`, e.g. `AB12345`)
- **Access Rule**: Brokers are strictly prohibited from viewing audit logs across the platform.
- **Enforcement**:
  1. Entering a Broker AB Number on the Audit Console login will trigger an immediate **RBAC Access Denied** error (`403 Forbidden`).
  2. Direct navigation to `dashboard.html` without `session_role === 'admin'` or `'audit.viewer'` is blocked and redirected to `index.html?error=unauthorized`.
  3. Every unauthorized access attempt by a Broker is logged to the security audit trail.

## Lockout Policy
- 5 failed attempts → 15-minute lock.

## Session Policy
- Auto-logout after 15 min inactivity.
- Session stored in `localStorage` with explicit `session_role` parameter.
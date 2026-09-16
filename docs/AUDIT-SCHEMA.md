# Audit Log — DB Schema & API

## Table: `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | auto |
| `ab_number` | VARCHAR(9) | FK to brokers |
| `session_id` | VARCHAR(64) | per-session |
| `timestamp` | TIMESTAMP | UTC |
| `ip_address` | VARCHAR(45) | |
| `user_agent` | TEXT | |
| `tool` | VARCHAR(64) | tool name or NULL |
| `action` | VARCHAR(32) | Login/View/Generate/Download |
| `details` | TEXT | free text |
| `status` | ENUM | Success / Failure |
| `report_name` | VARCHAR(255) | if download |
| `report_format` | VARCHAR(16) | PDF/Excel/CSV |

Indexes: `ab_number`, `timestamp`, `tool`, `action`

## REST Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate AB + password |
| POST | `/api/audit/log` | Write an audit entry |
| GET | `/api/audit/activity` | List activity logs |
| GET | `/api/audit/logins` | List login logs |
| GET | `/api/audit/downloads` | List downloads |
| GET | `/api/audit/security` | Security events |
| GET | `/api/audit/broker-summary` | Broker analytics |
| GET | `/api/audit/tool-usage` | Tool analytics |
| POST | `/api/audit/export` | Generate CSV/PDF/Excel |

## Retention
- 7 years (regulatory)
- Immutable (append-only)

## RBAC
- Only `audit.viewer` and `admin` roles can access the console
- Every export is itself logged
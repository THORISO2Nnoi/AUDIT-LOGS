# Authentication Spec — AB Number + Password

## Login Field
- **AB Number** — unique per broker, format `^AB\d{5,7}$`

## Password Rules
- Min 8 chars
- 1 uppercase, 1 lowercase, 1 digit, 1 special

## Lockout Policy
- 5 failed attempts → 15-minute lock

## Session Policy
- Auto-logout after 15 min inactivity
- Single active session per AB Number

## Audit Logging
Every login attempt (success or fail) is recorded with:
- `ab_number`, `timestamp`, `ip_address`, `user_agent`, `status`, `reason`

## Why AB Number
- Regulatory-recognized broker identifier
- Unique per broker → traceable audit trail
- Removes need for shared usernames
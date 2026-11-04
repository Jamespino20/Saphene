# Demo memory

The demo service exposes a `healthCheck` endpoint for operational checks.
User sessions use JWT tokens scoped by `tenant_id` in the session module.
The offline sync queue retries failed pushes through `retrySyncQueue`.

# Environment configuration for Mini App services

The "Explore Services" experience depends on the following public environment variables. Ensure they are available at build and runtime (e.g. through Vercel project settings or `.env.local`).

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_FEATURE_NEW_SERVICES` | Optional | Set to `true` to enable the Explore Services hub. Leave unset or `false` to hide the feature entirely. |
| `NEXT_PUBLIC_APPLICATION_URL` | ✅ | Base URL for the Exadoo mini-app API. Must include the protocol (e.g. `https://example.com`). |
| `NEXT_PUBLIC_APPLICATION_SECRET` | ✅ | Bearer token used for authenticating the mini-app requests. The value is injected into the `secret` header. |
| `NEXT_PUBLIC_TEST_MODE` | Optional | When set to `true`, the UI falls back to Telegram ID `5113997414` to simplify browser testing. A `Test Mode` badge is rendered to highlight the state. |
| `ALLOW_SNAPSHOT_WRITE` | Optional | Server-side flag (non public) that allows the `/api/miniapp-snapshot` helper to persist snapshots outside of `development`. |

## Snapshot output

On the first successful data fetch per session the client calls `/api/miniapp-snapshot` to persist a trimmed snapshot under `.snapshots/miniapp-YYYYMMDD.json`. Only non-sensitive fields (ids, titles, pricing, schedules) are stored for regression diffing.

## Failure behaviour

The client will fail fast and surface a warning banner if `NEXT_PUBLIC_APPLICATION_URL` or `NEXT_PUBLIC_APPLICATION_SECRET` are missing. Validation issues detected by Zod are only shown in development mode through a dedicated banner.

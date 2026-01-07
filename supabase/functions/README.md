# Supabase Edge Functions for ElevenLabs API

This directory contains Supabase Edge Functions that proxy requests to the ElevenLabs API, keeping the API key secure on the server side.

## Functions

### 1. `elevenlabs-conversations`
Proxies requests to the ElevenLabs Conversations API.

**Endpoints:**
- `GET /?agent_id=xxx&user_id=xxx` - List conversations
- `GET /{conversation_id}` - Get conversation details

### 2. `elevenlabs-conversation-audio`
Proxies requests to get conversation audio.

**Endpoint:**
- `GET /{conversation_id}` - Get conversation audio blob

## Setup

### 1. Environment Variables

Set the following environment variable in your Supabase project:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**To set in Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add a new secret: `ELEVENLABS_API_KEY` with your ElevenLabs API key

**Or using Supabase CLI:**
```bash
supabase secrets set ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 2. Deploy Functions

Deploy the functions using Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy elevenlabs-conversations
supabase functions deploy elevenlabs-conversation-audio
```

### 3. Local Development

To test functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve
```

## Authentication

All functions require authentication via Supabase Auth. The client must include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <supabase_session_token>
```

The functions verify the user's authentication before proxying requests to ElevenLabs.

## CORS

All functions include CORS headers to allow requests from the frontend application.

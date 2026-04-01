# AGENT.md - KrutAI Package Usage Guide for AI Assistants

This document provides comprehensive guidance for AI assistants on how to use the KrutAI packages in this Next.js project.

---

## Overview

This project uses four KrutAI packages that provide AI, database, email, and Excel comparison capabilities:

1. **@krutai/ai-provider** - AI/LLM integration with LangChain server
2. **@krutai/db-service** - PostgreSQL database configuration client
3. **@krutai/email-services** - Google OAuth email operations
4. **@krutai/excel-comparison** - Excel/CSV file comparison service

All packages require a `KRUTAI_API_KEY` environment variable for authentication.

---

## 1. @krutai/ai-provider (v0.2.15)

### Purpose
Fetch-based client for communicating with a deployed LangChain server. Provides AI chat capabilities with streaming support, structured output, and multimodal input.

### When to Use
- When user asks to add AI chat functionality
- When implementing conversational interfaces
- When needing structured AI responses (JSON output)
- When working with vision/multimodal AI features
- When building API routes that stream AI responses

### Installation Requirements
```bash
npm install @krutai/ai-provider
```

### Environment Variables
```env
KRUTAI_API_KEY=your-api-key-here
```

### Basic Usage Pattern

**Simple Chat:**
```typescript
import { krutAI } from '@krutai/ai-provider';

const ai = krutAI({
  apiKey: process.env.KRUTAI_API_KEY!,
  serverUrl: 'https://krut.ai', // Optional, defaults to http://localhost:8000
  model: 'gemini-3.1-pro-preview', // Optional
});

await ai.initialize();

const response = await ai.chat('Your prompt here');
```

**Multi-turn Conversation:**
```typescript
const response = await ai.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library...' },
  { role: 'user', content: 'How do I use hooks?' },
]);
```

**Structured Output (JSON):**
```typescript
interface UserProfile {
  name: string;
  age: number;
  skills: string[];
}

const profile = await ai.chat<UserProfile>(
  'Generate a profile for a senior developer named Sarah',
  {
    isStructure: true,
    output_structure: ['name', 'age', 'skills'],
  }
);
```

**Streaming in Next.js API Route:**
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const ai = krutAI({
    apiKey: process.env.KRUTAI_API_KEY!,
  });
  
  await ai.initialize();
  const response = await ai.streamChatResponse(messages);
  
  return response; // Proxy SSE stream directly
}
```

**Multimodal (Vision):**
```typescript
const response = await ai.chat([
  {
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image_url', image_url: { url: 'https://example.com/photo.jpg' } }
    ]
  }
], {
  model: 'gemini-3.1-pro-preview',
  images: ['https://example.com/another.jpg'],
});
```

### AI Assistant Implementation Guidelines

**When implementing AI chat features:**
1. Always validate `KRUTAI_API_KEY` exists before initializing
2. Call `initialize()` to validate the API key (unless `validateOnInit: false`)
3. Use streaming for better UX in chat interfaces
4. For API routes, use `streamChatResponse()` and proxy the response directly
5. For structured output (forms, data extraction), use `isStructure: true`
6. Handle errors from `KrutAIKeyValidationError`

**Configuration Options:**
```typescript
{
  apiKey: string;           // Required
  serverUrl?: string;       // Optional, default: 'http://localhost:8000'
  model?: string;           // Optional, passed to server
  validateOnInit?: boolean; // Optional, default: true
}
```

**GenerateOptions:**
```typescript
{
  system?: string;
  maxTokens?: number;
  temperature?: number;
  isStructure?: boolean;
  output_structure?: string[] | object;
  images?: string[];
  documents?: string[];
  pdf?: string[];
}
```

---

## 2. @krutai/db-service (v1.0.1)

### Purpose
Client for fetching PostgreSQL database configuration from KrutAI DB service. Returns connection URLs and credentials.

### When to Use
- When user needs to set up database connections
- When implementing database-dependent features
- When configuring PostgreSQL for a project
- When needing dynamic database configuration from KrutAI service

### Installation Requirements
```bash
npm install @krutai/db-service
```

### Environment Variables
```env
KRUTAI_API_KEY=your-api-key-here
```

### Basic Usage Pattern

```typescript
import { DbService } from '@krutai/db-service';

const dbClient = new DbService({
  apiKey: process.env.KRUTAI_API_KEY!,
  serverUrl: 'http://localhost:8000', // Optional
});

await dbClient.initialize();

const config = await dbClient.getDbConfig({
  projectId: 'my-project',
  dbName: 'production-db',
});

console.log(config.dbUrl); // postgres://...
```

### AI Assistant Implementation Guidelines

**When setting up database connections:**
1. Ensure `KRUTAI_API_KEY` environment variable is set
2. Always call `initialize()` before fetching config (validates API key)
3. Store database URLs securely (use environment variables)
4. Handle `DbServiceKeyValidationError` for invalid keys

**Configuration Options:**
```typescript
{
  apiKey: string;           // Required
  serverUrl?: string;       // Optional, default: 'http://localhost:8000'
  validateOnInit?: boolean; // Optional, default: true
}
```

**Usage with popular ORMs:**

With Prisma:
```typescript
const config = await dbClient.getDbConfig({ projectId: 'myapp', dbName: 'prod' });
// Set DATABASE_URL in .env or pass to Prisma client
```

With Drizzle:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const config = await dbClient.getDbConfig({ projectId: 'myapp', dbName: 'prod' });
const sql = postgres(config.dbUrl);
const db = drizzle(sql);
```

---

## 3. @krutai/email-services (v1.0.3)

### Purpose
Library for handling Google OAuth and email operations (read, send, mark as read) through a backend email service.

### When to Use
- When user needs to read emails programmatically
- When implementing email sending features
- When building email management interfaces
- When needing Gmail integration with OAuth
- When creating email automation workflows

### Installation Requirements
```bash
npm install @krutai/email-services
```

### Basic Usage Pattern

**Initialize Client:**
```typescript
import { EmailServiceClient } from '@krutai/email-services';

const emailClient = new EmailServiceClient({
  apiKey: process.env.KRUTAI_API_KEY!,
  serverUrl: 'http://localhost:8000', // Optional
});
```

**OAuth Flow:**
```typescript
// Step 1: Get login URL
const loginUrl = emailClient.getLoginUrl();
// Redirect user: window.location.href = loginUrl;

// Step 2: After OAuth callback, you'll receive tokens
// Use these tokens for subsequent operations
```

**Read Emails:**
```typescript
import { EmailFilterOptions } from '@krutai/email-services';

const filters: EmailFilterOptions = {
  unread: true,
  maxResults: 10,
};

const emailData = await emailClient.readEmail(tokens, filters);
console.log('Emails:', emailData.messages);
console.log('Count:', emailData.count);
```

**Send Email:**
```typescript
const result = await emailClient.sendEmail(
  tokens,
  'recipient@example.com',
  'Subject Line',
  'Email body content'
);
```

**Mark as Read:**
```typescript
await emailClient.markAsRead(tokens, messageId);
```

### AI Assistant Implementation Guidelines

**When implementing email features:**
1. Guide user through OAuth setup (getLoginUrl → callback → store tokens)
2. Always handle OAuth tokens securely (never log or expose)
3. Provide error handling for authentication failures
4. Use filters to limit email fetching (maxResults, unread, etc.)
5. Implement proper token refresh logic if needed

**Common Implementation Patterns:**

Next.js API Route for Reading Emails:
```typescript
// app/api/email/read/route.ts
export async function POST(req: Request) {
  const { tokens, filters } = await req.json();
  
  const emailClient = new EmailServiceClient({
    apiKey: process.env.KRUTAI_API_KEY!,
  });
  
  try {
    const emails = await emailClient.readEmail(tokens, filters);
    return Response.json(emails);
  } catch (error) {
    return Response.json({ error: 'Failed to read emails' }, { status: 500 });
  }
}
```

OAuth Callback Handler:
```typescript
// app/api/auth/callback/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  // Exchange code for tokens with your OAuth provider
  // Store tokens securely (database, encrypted session, etc.)
  
  return redirect('/dashboard');
}
```

---

## 4. @krutai/excel-comparison (v0.0.8)

### Purpose
API-driven library for comparing Excel and CSV files with intelligent column matching and professional difference reports. Offloads heavy processing to backend service.

### When to Use
- When user needs to compare two Excel or CSV files
- When building data reconciliation features
- When implementing file diff/comparison tools
- When needing to identify changes between spreadsheet versions
- When creating audit or compliance reporting tools

### Installation Requirements
```bash
npm install @krutai/excel-comparison
```

### Environment Variables
```env
KRUTAI_API_KEY=your-api-key-here
KRUTAI_SERVER_URL=http://localhost:8000  # Optional
```

### Basic Usage Pattern

**Initialize Client:**
```typescript
import { krutExcelComparison } from '@krutai/excel-comparison';

const comparisonClient = krutExcelComparison({
  apiKey: process.env.KRUTAI_API_KEY!,
  serverUrl: process.env.KRUTAI_SERVER_URL ?? 'http://localhost:8000',
  validateOnInit: false,
});

await comparisonClient.initialize();
```

**Compare Files (Browser/Next.js File Objects):**
```typescript
import { CompareFilesOptions } from '@krutai/excel-comparison';

const options: CompareFilesOptions = {
  matchColumn: 'ID', // Column to match rows on
  caseSensitive: false,
};

const result = await comparisonClient.compareFilesFromFileObjects(
  file1, // File object from form upload
  file2,
  options
);

if (result.success) {
  console.log('Summary:', result.result.summary);
  console.log('Download report:', result.downloadUrl);
}
```

**Compare Files (Node.js Buffers):**
```typescript
import fs from 'fs';

const buffer1 = fs.readFileSync('file1.xlsx');
const buffer2 = fs.readFileSync('file2.xlsx');

const result = await comparisonClient.compareFiles(
  buffer1,
  'file1.xlsx',
  buffer2,
  'file2.xlsx',
  { matchColumn: 'ID' }
);
```

**Preview Files:**
```typescript
const preview = await comparisonClient.previewFiles(file1, file2);
console.log('File 1 columns:', preview.file1.columns);
console.log('File 2 columns:', preview.file2.columns);
```

### AI Assistant Implementation Guidelines

**When implementing Excel comparison features:**
1. Validate file types (only .xlsx, .xls, .csv supported)
2. Use `previewFiles()` first to show user available columns
3. Allow user to specify match column (or auto-detect)
4. Provide clear summary of comparison results
5. Handle large files gracefully (API does heavy lifting)
6. Display download link for detailed Excel report

**Next.js API Route Pattern (Recommended):**
```typescript
// app/api/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { krutExcelComparison, type CompareFilesOptions } from "@krutai/excel-comparison";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file1 = formData.get("file1");
  const file2 = formData.get("file2");

  if (!(file1 instanceof File) || !(file2 instanceof File)) {
    return NextResponse.json({ error: "Both files required" }, { status: 400 });
  }

  const client = krutExcelComparison({
    apiKey: process.env.KRUTAI_API_KEY!,
    validateOnInit: false,
  });
  
  await client.initialize();

  const result = await client.compareFilesFromFileObjects(file1, file2, {
    matchColumn: 'ID',
    caseSensitive: false,
  });

  return NextResponse.json(result);
}
```

**Response Structure:**
```typescript
{
  success: boolean;
  result?: {
    summary: {
      totalRows: number;
      matchesFound: number;
      differencesFound: number;
      uniqueToFile1: number;
      uniqueToFile2: number;
      status: 'SUCCESS' | 'PARTIAL' | 'NO_MATCH';
    };
    matchColumn: string;
    metadata: {
      file1Name: string;
      file1Columns: string[];
      file1RowCount: number;
      file2Name: string;
      file2Columns: string[];
      file2RowCount: number;
    };
  };
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}
```

---

## Common Implementation Scenarios

### Scenario 1: Building an AI Chat Interface

**User Request:** "Add an AI chatbot to the homepage"

**Implementation Steps:**
1. Create API route using `@krutai/ai-provider`
2. Use `streamChatResponse()` for real-time streaming
3. Create frontend component to consume SSE stream
4. Handle conversation history with multi-turn chat

**Example API Route:**
```typescript
// app/api/ai/chat/route.ts
import { krutAI } from '@krutai/ai-provider';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const ai = krutAI({
    apiKey: process.env.KRUTAI_API_KEY!,
  });
  
  await ai.initialize();
  
  return await ai.streamChatResponse(messages);
}
```

### Scenario 2: Database Setup

**User Request:** "Set up PostgreSQL database connection"

**Implementation Steps:**
1. Use `@krutai/db-service` to fetch database configuration
2. Store connection URL in environment variables or secrets
3. Initialize database client (Prisma, Drizzle, pg, etc.)
4. Create database utilities for the project

**Example:**
```typescript
// lib/db-config.ts
import { DbService } from '@krutai/db-service';

export async function getDbUrl() {
  const dbClient = new DbService({
    apiKey: process.env.KRUTAI_API_KEY!,
  });
  
  await dbClient.initialize();
  
  const config = await dbClient.getDbConfig({
    projectId: 'nextjs-starter',
    dbName: 'production',
  });
  
  return config.dbUrl;
}
```

### Scenario 3: Email Integration

**User Request:** "Add email reading/sending functionality"

**Implementation Steps:**
1. Create OAuth callback route to handle Google OAuth
2. Use `@krutai/email-services` to get login URL
3. Store tokens securely after authentication
4. Create API routes for reading/sending emails
5. Build UI components for email management

**Example OAuth Flow:**
```typescript
// app/api/email/auth/route.ts
import { EmailServiceClient } from '@krutai/email-services';

export async function GET() {
  const client = new EmailServiceClient({
    apiKey: process.env.KRUTAI_API_KEY!,
  });
  
  const loginUrl = client.getLoginUrl();
  return Response.redirect(loginUrl);
}

// app/api/email/callback/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Extract tokens from callback
  // Store tokens securely
  return Response.redirect('/dashboard');
}
```

### Scenario 4: Excel File Comparison Tool

**User Request:** "Build a tool to compare two Excel files"

**Implementation Steps:**
1. Create file upload form with two file inputs
2. Create API route using `@krutai/excel-comparison`
3. Optionally preview files first to show columns
4. Display comparison summary with statistics
5. Provide download link for detailed report

**Complete Example:**
```typescript
// app/api/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { krutExcelComparison } from "@krutai/excel-comparison";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file1 = formData.get("file1") as File;
  const file2 = formData.get("file2") as File;
  const matchColumn = formData.get("matchColumn") as string;

  const client = krutExcelComparison({
    apiKey: process.env.KRUTAI_API_KEY!,
    validateOnInit: false,
  });
  
  await client.initialize();

  const result = await client.compareFilesFromFileObjects(file1, file2, {
    matchColumn,
    caseSensitive: false,
  });

  return NextResponse.json(result);
}
```

---

## Environment Setup Checklist

When implementing features with KrutAI packages, ensure:

- [ ] `KRUTAI_API_KEY` is set in `.env.local`
- [ ] `.env.local` is added to `.gitignore`
- [ ] API key is validated using `initialize()` method
- [ ] Error handling is implemented for authentication failures
- [ ] Server URL is configurable (defaults work for local development)

---

## Error Handling Patterns

### API Key Validation Errors

```typescript
import { KrutAIKeyValidationError } from '@krutai/ai-provider';
import { DbServiceKeyValidationError } from '@krutai/db-service';

try {
  await ai.initialize();
} catch (error) {
  if (error instanceof KrutAIKeyValidationError) {
    console.error('Invalid API key:', error.message);
    // Prompt user to check KRUTAI_API_KEY
  }
}
```

### General Error Handling

```typescript
try {
  const result = await comparisonClient.compareFilesFromFileObjects(file1, file2);
  
  if (!result.success) {
    console.error('Comparison failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

---

## Best Practices for AI Assistants

### When User Asks to Implement Features:

1. **Identify which KrutAI packages are needed**
   - AI chat → `@krutai/ai-provider`
   - Database setup → `@krutai/db-service`
   - Email features → `@krutai/email-services`
   - File comparison → `@krutai/excel-comparison`

2. **Check environment configuration**
   - Verify `.env.local` exists and contains `KRUTAI_API_KEY`
   - Create `.env.example` with placeholder values

3. **Create API routes first (Next.js App Router)**
   - Use `app/api/` directory structure
   - Export POST/GET handlers as needed
   - Handle FormData for file uploads
   - Return proper JSON responses with error handling

4. **Implement frontend components second**
   - Use existing UI components from `src/components/ui/`
   - Handle loading and error states
   - Provide user feedback for async operations
   - Use React Query (already installed) for data fetching

5. **Test initialization**
   - Always test that `initialize()` succeeds
   - Verify API key is working
   - Check server connectivity

### Code Organization

```
project/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── chat/route.ts          # AI provider endpoints
│   │   ├── db/
│   │   │   └── config/route.ts        # DB service endpoints
│   │   ├── email/
│   │   │   ├── read/route.ts          # Email read endpoint
│   │   │   ├── send/route.ts          # Email send endpoint
│   │   │   └── auth/route.ts          # OAuth endpoints
│   │   └── compare/
│   │       └── route.ts               # Excel comparison endpoint
│   └── page.tsx
├── lib/
│   ├── ai-client.ts                   # AI provider singleton
│   ├── db-client.ts                   # DB service singleton
│   └── email-client.ts                # Email service singleton
└── .env.local                         # KRUTAI_API_KEY
```

### Security Considerations

- **Never expose API keys in client-side code**
- All KrutAI operations should happen in API routes or server components
- Store OAuth tokens securely (encrypted database or secure session storage)
- Validate user input before passing to KrutAI services
- Use environment variables for all sensitive configuration

---

## Testing Recommendations

### Unit Tests

```typescript
// Mock the client for testing
jest.mock('@krutai/ai-provider', () => ({
  krutAI: jest.fn(() => ({
    initialize: jest.fn(),
    chat: jest.fn().mockResolvedValue('Mocked response'),
  })),
}));
```

### Integration Tests

```typescript
// Set validateOnInit: false for tests
const ai = krutAI({
  apiKey: 'test-key',
  serverUrl: 'http://localhost:3000',
  validateOnInit: false,
});

const text = await ai.chat('Hello!');
```

---

## Package Dependencies

All KrutAI packages are lightweight with minimal dependencies:

- **@krutai/ai-provider**: `krutai` (peer dependency)
- **@krutai/db-service**: Zero dependencies
- **@krutai/email-services**: `axios`
- **@krutai/excel-comparison**: `exceljs`, `xlsx`

---

## Troubleshooting Guide

### Common Issues

**Issue: "API key validation failed"**
- Solution: Check that `KRUTAI_API_KEY` is set correctly in `.env.local`
- Verify the key is valid by testing with the validation endpoint

**Issue: "Connection refused to localhost:8000"**
- Solution: Check if `serverUrl` is configured correctly
- Verify the KrutAI backend service is running
- Update `KRUTAI_SERVER_URL` in environment variables

**Issue: "File comparison failing"**
- Solution: Verify files are in supported formats (.xlsx, .xls, .csv)
- Check that matchColumn exists in both files
- Ensure files aren't corrupted or empty

**Issue: "OAuth tokens expired"**
- Solution: Implement token refresh logic
- Prompt user to re-authenticate
- Store token expiration time and check before operations

---

## Version Information

- `@krutai/ai-provider`: v0.2.15 (Published: Mar 23, 2026)
- `@krutai/db-service`: v1.0.1 (Published: Apr 1, 2026)
- `@krutai/email-services`: v1.0.3 (Published: Mar 31, 2026)
- `@krutai/excel-comparison`: v0.0.8 (Published: Mar 27, 2026)

---

## Additional Resources

- GitHub Repository: https://github.com/AccountantAIOrg/krut_packages
- License: MIT (all packages)
- Support: Check the GitHub repository for issues and discussions

---

## Quick Reference Card

| Package | Primary Method | Returns | Use Case |
|---------|---------------|---------|----------|
| `@krutai/ai-provider` | `ai.chat()` | `string` or `T` | AI responses, chatbots |
| `@krutai/ai-provider` | `ai.streamChatResponse()` | `Response` | Streaming SSE |
| `@krutai/db-service` | `dbClient.getDbConfig()` | `{ dbUrl }` | PostgreSQL connection |
| `@krutai/email-services` | `emailClient.readEmail()` | `{ messages, count }` | Read emails |
| `@krutai/email-services` | `emailClient.sendEmail()` | `Promise<any>` | Send emails |
| `@krutai/excel-comparison` | `client.compareFilesFromFileObjects()` | `ComparisonApiResponse` | Compare spreadsheets |

---

## Notes for AI Assistants

- All packages follow similar patterns: initialize → validate → use
- All packages require `KRUTAI_API_KEY` environment variable
- All packages support optional `serverUrl` configuration
- All packages are TypeScript-first with full type definitions
- All packages are designed for Next.js and serverless environments
- Use API routes (server-side) for all KrutAI operations to protect API keys
- Never expose API keys or tokens in client-side code

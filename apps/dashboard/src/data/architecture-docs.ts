/**
 * Architecture Documentation Data
 * 
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * 
 * This file is generated from:
 *   - docs/architecture/infrastructure.md
 *   - docs/architecture/patterns.md
 * 
 * To update, modify the source markdown files and run:
 *   npm run sync:docs
 * 
 * Generated: 2026-01-31T20:10:22.941Z
 */

export interface InfrastructurePattern {
  title: string
  description: string
  diagram: string
  benefits: string[]
  whenToUse: string[]
}

export interface ArchitecturePatternBenefit {
  title: string
  description: string
}

export interface ArchitecturePatternTable {
  headers: string[]
  rows: string[][]
}

export interface ArchitecturePattern {
  title: string
  description: string
  codeExample?: string
  benefits?: ArchitecturePatternBenefit[]
  table?: ArchitecturePatternTable
}

export const infrastructurePatterns: InfrastructurePattern[] = [
  {
    "title": "Serverless API Pattern",
    "description": "Lambda + API Gateway for stateless APIs:",
    "diagram": "┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│  API Gateway│────▶│   Lambda    │────▶│  DynamoDB   │\n│             │     │  (Node.js)  │     │             │\n└─────────────┘     └─────────────┘     └─────────────┘",
    "benefits": [
      "Auto-scaling",
      "Pay per request",
      "No server management"
    ],
    "whenToUse": [
      "REST/GraphQL APIs",
      "Event processing",
      "Scheduled tasks"
    ]
  },
  {
    "title": "Container Platform Pattern",
    "description": "ECS/Fargate for long-running services:",
    "diagram": "┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│     ALB     │────▶│    ECS      │────▶│    RDS      │\n│             │     │  (Fargate)  │     │ (PostgreSQL)│\n└─────────────┘     └─────────────┘     └─────────────┘",
    "benefits": [
      "Consistent runtime",
      "Horizontal scaling",
      "Complex dependencies"
    ],
    "whenToUse": [
      "Stateful services",
      "Long-running processes",
      "WebSocket connections"
    ]
  },
  {
    "title": "Event-Driven Pattern",
    "description": "EventBridge + SQS for decoupled systems:",
    "diagram": "┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│ EventBridge │────▶│    SQS      │────▶│   Lambda    │\n│             │     │             │     │  (Handler)  │\n└─────────────┘     └─────────────┘     └─────────────┘",
    "benefits": [
      "Loose coupling",
      "Retry handling",
      "Dead letter queues"
    ],
    "whenToUse": []
  },
  {
    "title": "Static Site Pattern",
    "description": "S3 + CloudFront for dashboards:",
    "diagram": "┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│ CloudFront  │────▶│     S3      │     │   Route53   │\n│    (CDN)    │     │  (Static)   │     │   (DNS)     │\n└─────────────┘     └─────────────┘     └─────────────┘",
    "benefits": [],
    "whenToUse": []
  },
  {
    "title": "Data Lake Pattern",
    "description": "S3 + Athena for analytics:",
    "diagram": "┌─────────────┐     ┌─────────────┐     ┌─────────────┐\n│   Kinesis   │────▶│     S3      │────▶│   Athena    │\n│  (Firehose) │     │ (Parquet)   │     │  (Query)    │\n└─────────────┘     └─────────────┘     └─────────────┘",
    "benefits": [],
    "whenToUse": []
  }
]

export const architecturePatterns: ArchitecturePattern[] = [
  {
    "title": "Fluent Facade Pattern",
    "description": "All external-facing code goes through the fluent facade layer:",
    "codeExample": "import { sdk } from '@federated/facade';\n\n// Instead of importing individual services\nsdk.errors().capture(err).send();\nsdk.auth().loginWithCode(code).execute();\nsdk.telemetry().metric('latency').value(100).send();",
    "benefits": [
      {
        "title": "Discoverability",
        "description": "Single entry point to explore"
      },
      {
        "title": "Consistency",
        "description": "Chainable, predictable API"
      },
      {
        "title": "Abstraction",
        "description": "Implementation details hidden"
      },
      {
        "title": "Versioning",
        "description": "Facade versioned independently"
      }
    ]
  },
  {
    "title": "Plugin Architecture",
    "description": "SDKs are implemented as plugins that register with the core:",
    "codeExample": "interface Plugin {\n  name: string;\n  version: string;\n  initialize(core: CoreSDK): Promise<void>;\n  destroy(): Promise<void>;\n}"
  },
  {
    "title": "Centralized Cross-Cutting Concerns",
    "description": "Never implement these yourself:",
    "table": {
      "headers": [
        "Concern",
        "SDK",
        "Usage"
      ],
      "rows": [
        [
          "Authentication",
          "`@federated/auth`",
          "`sdk.auth()`"
        ],
        [
          "Error Handling",
          "`@federated/error-handling`",
          "`sdk.errors()`"
        ],
        [
          "Telemetry",
          "`@federated/telemetry`",
          "`sdk.telemetry()`"
        ],
        [
          "UI Config",
          "`@federated/ui-config`",
          "`sdk.ui()`"
        ]
      ]
    }
  },
  {
    "title": "Event-Driven Communication",
    "description": "Components communicate via events, not direct calls:",
    "codeExample": "// Publish event\nsdk.events().publish('user.created', { userId: '123' });\n\n// Subscribe to events\nsdk.events().subscribe('user.created', async (event) => {\n  await sendWelcomeEmail(event.userId);\n});"
  },
  {
    "title": "Configuration Hierarchy",
    "description": "Configuration flows from environment → project → runtime:",
    "codeExample": "Environment Variables\n        ↓\n   Project Config\n        ↓\n   Runtime Config\n        ↓\n   Final Config"
  }
]

export const lastUpdated = '2026-01-31T20:10:22.941Z'

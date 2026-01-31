# Infrastructure Patterns

AWS infrastructure patterns for the Ecosystem platform.

## 1. Serverless API Pattern

Lambda + API Gateway for stateless APIs:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  API Gateway│────▶│   Lambda    │────▶│  DynamoDB   │
│             │     │  (Node.js)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Benefits

- Auto-scaling
- Pay per request
- No server management

### When to Use

- REST/GraphQL APIs
- Event processing
- Scheduled tasks

## 2. Container Platform Pattern

ECS/Fargate for long-running services:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│     ALB     │────▶│    ECS      │────▶│    RDS      │
│             │     │  (Fargate)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Benefits

- Consistent runtime
- Horizontal scaling
- Complex dependencies

### When to Use

- Stateful services
- Long-running processes
- WebSocket connections

## 3. Event-Driven Pattern

EventBridge + SQS for decoupled systems:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ EventBridge │────▶│    SQS      │────▶│   Lambda    │
│             │     │             │     │  (Handler)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Benefits

- Loose coupling
- Retry handling
- Dead letter queues

## 4. Static Site Pattern

S3 + CloudFront for dashboards:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CloudFront  │────▶│     S3      │     │   Route53   │
│    (CDN)    │     │  (Static)   │     │   (DNS)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 5. Data Lake Pattern

S3 + Athena for analytics:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Kinesis   │────▶│     S3      │────▶│   Athena    │
│  (Firehose) │     │ (Parquet)   │     │  (Query)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

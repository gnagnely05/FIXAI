# Replicate AI Integration Guide

This document describes the complete Replicate integration in FixAI for image generation and analysis.

## Overview

Replicate is used for three main AI capabilities:
- **Image Generation**: Create new images from text prompts (FLUX Pro)
- **Image-to-Image Transformation**: Modify existing images based on prompts
- **Vision Analysis**: Analyze images using Llama Vision
- **Text Completion**: Generate text using Llama 3.3

## Backend Setup

### Installation

The `replicate` npm package is installed in `apps/api`:

```bash
npm install replicate
```

### Configuration

Set the environment variable in your deployment:

```
REPLICATE_API_TOKEN=your_token_here
```

### Service: ReplicateService

Located in `apps/api/src/modules/ai/replicate.service.ts`

**Key Methods:**

- `generateImage(prompt, options?)`: Generate image from prompt
  - `prompt`: Text description
  - `options.baseImageUrl`: Optional base image for image-to-image
  - `options.width`: Image width (default: 1024)
  - `options.height`: Image height (default: 1024)
  - `options.promptStrength`: Influence of base image (0-1, default: 0.75)

- `inpaintImage(prompt, imageUrl, maskUrl)`: Modify specific image regions
  - `prompt`: What to change
  - `imageUrl`: Base image
  - `maskUrl`: Mask indicating areas to modify

- `analyzeWithVision(prompt, imageUrl?)`: Analyze images with vision
  - `prompt`: Question or analysis request
  - `imageUrl`: Optional image to analyze

- `complete(prompt, systemPrompt?)`: Text generation
  - `prompt`: User request
  - `systemPrompt`: Optional system context

## API Routes

### Backend Endpoints

#### POST /api/ai/generate

Generate or transform an image.

**Request:**
```json
{
  "prompt": "Transform this living room in Scandinavian modern style",
  "imageUrl": "https://example.com/room.jpg" (optional)
}
```

**Response:**
```json
{
  "imageUrl": "https://replicate.delivery/..."
}
```

**Required**: JWT authentication (user must have active AI subscription)

#### POST /api/ai/analyze

Analyze an image using vision capabilities.

**Request:**
```json
{
  "prompt": "Describe the interior design style of this room",
  "imageUrl": "https://example.com/room.jpg"
}
```

**Response:**
```json
{
  "analysis": "This room features a modern minimalist design..."
}
```

#### POST /api/ai/decoration/visualize

Existing decoration visualization (with product integration).

## Frontend Integration

### Hook: useImageGeneration

Located in `apps/mobile/src/hooks/useImageGeneration.ts`

```typescript
const { generateImage, analyzeImage, imageUrl, loading, error } = useImageGeneration();

// Generate image
const result = await generateImage(
  "Transform to Scandinavian style",
  baseImageUrl
);

// Analyze image
const analysis = await analyzeImage(
  "Describe the style",
  imageUrl
);
```

### Example Screen

See `apps/mobile/src/app/decoration/generate.tsx` for a complete example of image generation UI.

## Usage Examples

### 1. Room Transformation

Client uploads a photo of their room and requests a style change:

```typescript
const imageUrl = await generateImage(
  "Transform this living room in modern minimalist style with neutral tones"
);
```

### 2. Interior Analysis

Before generating suggestions:

```typescript
const description = await analyzeImage(
  "Analyze the current interior design style and identify improvement areas",
  roomPhotoUrl
);
```

### 3. Design Iteration

Start with base image, refine through iterations:

```typescript
// First iteration
let result = await generateImage(
  "Modern Scandinavian style living room",
  originalPhoto
);

// Second iteration (refine based on result)
result = await generateImage(
  "Same style but with warmer wood tones and more texture",
  result
);
```

## Cost Considerations

- **FLUX Pro**: ~$0.05-0.08 per image
- **Vision Analysis**: ~$0.10-0.15 per image
- **Text Completion**: ~$0.01-0.03 per request

Costs are metered through Replicate. Implement rate limiting and usage quotas.

## Models Used

| Purpose | Model | Provider |
|---------|-------|----------|
| Image Generation | FLUX Pro | Black Forest Labs |
| Image Modification | FLUX Fill | Black Forest Labs |
| Vision Analysis | Llama 3.2 90B Vision | Meta |
| Text Completion | Llama 3.3 70B | Meta |

## Error Handling

All Replicate service methods throw `ServiceUnavailableException` on failure:

```typescript
try {
  const imageUrl = await replicateService.generateImage(prompt);
} catch (e) {
  // ServiceUnavailableException thrown
  // Error message is user-friendly, e.g., "Image generation failed. Please try again."
}
```

## Subscription Integration

Image generation routes check user subscriptions:

```typescript
await this.subscriptions.assertAiAllowed(userId);
// ... generate image ...
await this.subscriptions.consumeAiRequest(userId);
```

Users must have an active AI subscription to use generation features.

## Rate Limiting

**Recommended:**
- Standard plan: 10 AI requests/month
- Pro plan: 50 AI requests/month
- Premium plan: 200+ AI requests/month

## Future Enhancements

- [ ] Webhook support for long-running generations (>90s)
- [ ] Image upscaling with Real-ESRGAN
- [ ] Advanced inpainting with precise masks
- [ ] Multi-step prompting workflows
- [ ] Image style extraction for consistency
- [ ] Batch processing for multiple rooms

## Debugging

Enable logging in ReplicateService:

```typescript
this.logger.log(`[Image Gen] Prompt: "${prompt.slice(0, 50)}..."`);
this.logger.log(`[Image Gen] Success: ${url}`);
this.logger.error(`Replicate error: ${msg}`);
```

Check logs for:
- Prompt truncation warnings
- Model loading times
- Output validation issues
- Network errors

## Support

For Replicate API issues: https://replicate.com/docs
For FixAI integration issues: Check GitHub issues

import express, { Request, Response } from 'express';
import { streamLuraSparkChat, streamMathSolver } from './geminiService';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '25mb' }));

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'LuraSpark AI',
    defaultModel: 'luraspark-turbo',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Available models
apiRouter.get('/models', (_req: Request, res: Response) => {
  res.json({
    models: [
      {
        id: 'luraspark-turbo',
        name: 'LuraSpark Turbo',
        version: 'Neural v2.4',
        description: 'Blazing-fast reasoning engine with zero latency and high throughput',
        thinkingSupported: true,
        recommended: true,
      },
      {
        id: 'luraspark-pro',
        name: 'LuraSpark Pro',
        version: 'Neural Pro v3.1',
        description: 'Advanced deep analytical problem solving and code synthesis',
        thinkingSupported: true,
        recommended: false,
      },
    ],
  });
});

// Streaming Chat Endpoint with multimodal file support (SSE)
apiRouter.post('/chat', async (req: Request, res: Response) => {
  const {
    prompt,
    history = [],
    model = 'luraspark-turbo',
    enableThinking = true,
    attachments = [],
  } = req.body;

  if (!prompt && (!attachments || attachments.length === 0)) {
    res.status(400).json({ error: 'Valid prompt or attachment is required.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const generator = streamLuraSparkChat({
      prompt: prompt || 'Analyze the attached files and provide detailed findings.',
      history,
      model,
      enableThinking,
      attachments,
    });

    for await (const chunk of generator) {
      if (chunk.error) {
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('API /chat streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Stream processing failed' })}\n\n`);
    res.end();
  }
});

// Dedicated Math Solver endpoint (SSE streaming)
apiRouter.post('/math/solve', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, mathText, model = 'luraspark-pro' } = req.body;

  if (!imageBase64 && !mathText) {
    res.status(400).json({ error: 'Please provide either a photo of the math problem or text.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const generator = streamMathSolver({
      imageBase64,
      mimeType,
      mathText,
      model,
    });

    for await (const chunk of generator) {
      if (chunk.error) {
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('API /math/solve streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Math solving failed' })}\n\n`);
    res.end();
  }
});

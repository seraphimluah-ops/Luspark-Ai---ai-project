import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Initialize AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface FileAttachment {
  name: string;
  type: string;
  base64: string;
}

export interface GenerateChatOptions {
  model?: string;
  enableThinking?: boolean;
  history: Array<{ role: 'user' | 'model'; content: string }>;
  prompt: string;
  attachments?: FileAttachment[];
}

function cleanBase64(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex !== -1) {
    return dataUrl.substring(commaIndex + 1);
  }
  return dataUrl;
}

export async function* streamLuraSparkChat(options: GenerateChatOptions) {
  // Use gemini-3.1-flash-lite or gemini-3.5-flash for rapid, error-free reasoning
  const enableThinking = options.enableThinking !== false;
  const hasImages = options.attachments && options.attachments.some((f) => f.type.startsWith('image/'));

  // Multimodal works best on 3.5-flash; text tasks on 3.1-flash-lite for instant speed
  const primaryModel = hasImages ? 'gemini-3.5-flash' : 'gemini-3.1-flash-lite';
  const fallbackModel = 'gemini-3.5-flash';

  const userParts: any[] = [];

  if (options.attachments && options.attachments.length > 0) {
    for (const file of options.attachments) {
      if (file.type.startsWith('image/')) {
        userParts.push({
          inlineData: {
            mimeType: file.type || 'image/jpeg',
            data: cleanBase64(file.base64),
          },
        });
      } else {
        userParts.push({
          text: `[Attached File: ${file.name}]\n${file.base64.startsWith('data:') ? '' : file.base64}`,
        });
      }
    }
  }

  userParts.push({ text: options.prompt });

  const contents: any[] = [
    ...options.history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: userParts,
    },
  ];

  const systemInstruction =
    'You are LuraSpark, an advanced, highly intelligent neural reasoning assistant created by Mark Beranio from Davao del Sur, Philippines. ' +
    'You embody deep analytical reasoning, rapid structural thinking, and helpfulness. ' +
    'Your name and brand is strictly LuraSpark. Never refer to yourself as Gemini or mention underlying third-party model names. ' +
    'When analyzing uploaded photos or documents, inspect every visual detail carefully and answer accurately. ' +
    'When providing code or explanations, use structured markdown with clean syntax-highlighted code blocks, tables, and clear steps. ' +
    'Always be helpful, authentic, ethical, and concise.';

  const config: Record<string, any> = {
    systemInstruction,
    ...(enableThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
  };

  try {
    const responseStream = await ai.models.generateContentStream({
      model: primaryModel,
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (parts && parts.length > 0) {
        for (const part of parts) {
          if ((part as any).thought) {
            yield { thought: part.text || '' };
          } else if (part.text) {
            yield { text: part.text };
          }
        }
      } else if (chunk.text) {
        yield { text: chunk.text };
      }
    }
  } catch (err: any) {
    console.warn(`LuraSpark primary stream notification: ${err.message}. Routing to fallback engine...`);

    try {
      const fallbackStream = await ai.models.generateContentStream({
        model: fallbackModel,
        contents,
        config: {
          systemInstruction,
        },
      });

      for await (const chunk of fallbackStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (parts && parts.length > 0) {
          for (const part of parts) {
            if ((part as any).thought) {
              yield { thought: part.text || '' };
            } else if (part.text) {
              yield { text: part.text };
            }
          }
        } else if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    } catch (fallbackErr: any) {
      console.error('LuraSpark stream error:', fallbackErr.message);
      yield { error: 'LuraSpark is processing high traffic. Please re-send your message.' };
    }
  }
}

// Dedicated Math Problem Solver stream
export interface SolveMathOptions {
  imageBase64?: string;
  mimeType?: string;
  mathText?: string;
  model?: string;
}

export async function* streamMathSolver(options: SolveMathOptions) {
  const parts: any[] = [];

  if (options.imageBase64) {
    parts.push({
      inlineData: {
        mimeType: options.mimeType || 'image/jpeg',
        data: cleanBase64(options.imageBase64),
      },
    });
  }

  const promptText = options.mathText
    ? `Solve this math problem thoroughly with full derivation: ${options.mathText}`
    : 'Carefully scan, transcribe, and solve the math problem shown in this image with full derivation.';

  parts.push({ text: promptText });

  const systemInstruction =
    'You are LuraSpark Math Solver, created by Mark Beranio from Davao del Sur, Philippines. You are an expert mathematics professor and problem solver. ' +
    'Perform rigorous analysis on the math problem provided in the image or text. ' +
    'Format your response into structured, crystal-clear sections:\n' +
    '### 1. Problem Formulation\n(Transcribe or restate the equation / problem accurately with LaTeX)\n\n' +
    '### 2. Relevant Formulas & Concepts\n(State theorems, formulas, identities, or rules applied)\n\n' +
    '### 3. Step-by-Step Derivation\n(Show each algebraic or calculus step clearly with explanations)\n\n' +
    '### 4. Verification Check\n(Substitute answer back into the original equation or prove equivalence)\n\n' +
    '### 5. Final Answer\n(State the final simplified answer in bold with boxed formatting)\n\n' +
    'Your name and brand is strictly LuraSpark. Never mention Gemini or underlying model architectures.';

  const config: Record<string, any> = {
    systemInstruction,
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.LOW,
    },
  };

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts }],
      config,
    });

    for await (const chunk of responseStream) {
      const pList = chunk.candidates?.[0]?.content?.parts;
      if (pList && pList.length > 0) {
        for (const p of pList) {
          if ((p as any).thought) {
            yield { thought: p.text || '' };
          } else if (p.text) {
            yield { text: p.text };
          }
        }
      } else if (chunk.text) {
        yield { text: chunk.text };
      }
    }
  } catch (err: any) {
    console.warn('Math solver stream error, trying fallback:', err.message);
    try {
      const fallbackStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts }],
        config: { systemInstruction },
      });
      for await (const chunk of fallbackStream) {
        const pList = chunk.candidates?.[0]?.content?.parts;
        if (pList && pList.length > 0) {
          for (const p of pList) {
            if ((p as any).thought) {
              yield { thought: p.text || '' };
            } else if (p.text) {
              yield { text: p.text };
            }
          }
        } else if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    } catch (fallbackErr: any) {
      yield { error: 'LuraSpark Math Solver could not complete this equation. Please check the image or equation syntax.' };
    }
  }
}

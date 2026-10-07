import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  Calculator,
  RefreshCw,
  Check,
  Copy,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MBLogo } from './MBLogo';
import { ThinkingBox } from './ThinkingBox';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MathSolverPageProps {
  onBackToChat: () => void;
}

export const MathSolverPage: React.FC<MathSolverPageProps> = ({ onBackToChat }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'text'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [mathText, setMathText] = useState('');

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Solving & streaming state
  const [isSolving, setIsSolving] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [solution, setSolution] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Direct webcam access failed, falling back to camera input:', err);
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setImageMime('image/jpeg');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setImageMime(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSampleProblem = (text: string) => {
    setMathText(text);
    setImagePreview(null);
    setActiveTab('text');
  };

  const handleSolve = async () => {
    if (!imagePreview && !mathText.trim()) return;

    setIsSolving(true);
    setReasoning('');
    setSolution('');

    try {
      const response = await fetch('/api/math/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview || undefined,
          mimeType: imageMime,
          mathText: mathText.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Solver request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let accumulatedReasoning = '';
      let accumulatedSolution = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.thought) {
                accumulatedReasoning += data.thought;
                setReasoning((prev) => prev + data.thought);
              }
              if (data.text) {
                accumulatedSolution += data.text;
                setSolution((prev) => prev + data.text);
              }
              if (data.error) {
                accumulatedSolution += `\n\n*[Notice: ${data.error}]*`;
                setSolution(accumulatedSolution);
              }
            } catch (e) {
              // Ignore non-json
            }
          }
        }
      }
    } catch (err: any) {
      setSolution(`Failed to solve problem: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSolving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = solution.replace(/[#*`_~\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#131314] text-[#E3E3E3]">
      {/* Hidden File / Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#131314]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
        <button
          type="button"
          onClick={onBackToChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-sky-400" />
          <span>Back to Chat</span>
        </button>

        <div className="flex items-center gap-2.5">
          <MBLogo size={24} className="h-6 w-6" />
          <span className="text-sm font-semibold text-white">LuraSpark Math Solver</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-sky-300 border border-blue-500/20 font-mono">
            Fast Reasoning
          </span>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono hidden sm:block">Deep STEM Derivation</div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
            <Calculator className="h-3.5 w-3.5" />
            <span>LuraSpark Multimodal Mathematics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Scan & Solve Any Math Problem
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Snap a picture of handwritten equations, textbook exercises, or calculus problems. Processed with LuraSpark High Thinking for comprehensive step-by-step proofs and derivations.
          </p>
        </div>

        {/* Input Card Container */}
        <div className="rounded-3xl bg-[#18191c] border border-white/10 p-5 sm:p-7 shadow-xl space-y-6">
          {/* Method Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121315] rounded-2xl w-fit border border-white/5 select-none">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'upload' ? 'bg-[#222428] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="h-3.5 w-3.5 text-sky-400" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'camera' ? 'bg-[#222428] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-emerald-400" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('text');
                stopCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'text' ? 'bg-[#222428] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-pink-400" />
              <span>Type Equation</span>
            </button>
          </div>

          {/* Tab 1: Upload Photo */}
          {activeTab === 'upload' && !imagePreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-sky-500/40 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-[#131417]/50 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-white/5 group-hover:bg-sky-500/10 flex items-center justify-center text-zinc-400 group-hover:text-sky-400 transition-colors">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Click to upload photo or screenshot</p>
                <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPEG, WEBP of handwritten or printed math</p>
              </div>
            </div>
          )}

          {/* Tab 2: Camera Viewfinder */}
          {activeTab === 'camera' && isCameraActive && !imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-96 w-full flex items-center justify-center border border-white/10">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none border-2 border-sky-400/30 rounded-2xl m-6" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Snap Photo</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-white/10 text-zinc-300 text-xs hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Text Equation */}
          {activeTab === 'text' && !imagePreview && (
            <div className="space-y-3">
              <textarea
                value={mathText}
                onChange={(e) => setMathText(e.target.value)}
                placeholder="Type your math equation here (e.g. Integrate x * e^(2x) dx, or solve system: 2x + 3y = 12, x - y = 1)..."
                className="w-full p-4 rounded-2xl bg-[#121315] border border-white/10 text-sm text-[#E3E3E3] placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 resize-y min-h-[110px]"
              />

              {/* Sample Equations */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-500 font-medium">Or try an example:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSampleProblem('Find the eigenvalues and eigenvectors of the matrix [[4, 2], [1, 3]]')}
                    className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                  >
                    Matrix Eigenvalues
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleProblem('Evaluate the integral: ∫ (3x^2 + 2x) / (x^3 + x^2 + 1) dx')}
                    className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                  >
                    Calculus Integral
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleProblem('Solve the differential equation: dy/dx + 2y = e^(-x) with y(0) = 1')}
                    className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                  >
                    Differential Eq
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photo Preview if loaded */}
          {imagePreview && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 max-h-80 flex items-center justify-center p-2">
                <img src={imagePreview} alt="Math Problem" className="max-h-72 w-auto object-contain rounded-xl" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Math problem photo ready for analysis
              </p>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={(!imagePreview && !mathText.trim()) || isSolving}
              onClick={handleSolve}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-lg ${
                (!imagePreview && !mathText.trim()) || isSolving
                  ? 'bg-white/10 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 text-white hover:opacity-95 shadow-blue-500/20'
              }`}
            >
              {isSolving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>LuraSpark is Solving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Solve with LuraSpark High Thinking</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results & Derivations Section */}
        {(reasoning || solution || isSolving) && (
          <div className="rounded-3xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <MBLogo size={24} className="h-6 w-6" />
                <h2 className="text-lg font-semibold text-white">Mathematical Solution & Proof</h2>
              </div>

              {solution && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy solution"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className={`p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                      isSpeaking ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop speaking' : 'Read solution'}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Differentiated Reasoning (Thinking) Phase */}
            {(reasoning || (isSolving && !solution)) && (
              <ThinkingBox
                thoughts={reasoning}
                isStreamingReasoning={isSolving}
                hasStartedFinalAnswer={Boolean(solution && solution.trim().length > 0)}
              />
            )}

            {/* Rendered Math Solution with react-syntax-highlighter */}
            <div className="text-[15px] leading-relaxed text-[#D2D2D2] break-words">
              {solution ? (
                <MarkdownRenderer content={solution} />
              ) : isSolving ? (
                <div className="flex items-center gap-2.5 text-xs text-sky-400/80 py-4 font-mono">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  <span>LuraSpark is formulating multi-step mathematical proof...</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

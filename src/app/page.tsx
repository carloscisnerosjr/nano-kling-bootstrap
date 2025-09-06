"use client";
import React, { useState, useEffect, useRef } from "react";
import { fal } from "@fal-ai/client";

// Debug: Check if FAL_KEY is loaded
console.log("FAL_KEY loaded:", process.env.NEXT_PUBLIC_FAL_KEY ? "✅ Yes" : "❌ No");
console.log("FAL_KEY length:", process.env.NEXT_PUBLIC_FAL_KEY?.length || 0);

fal.config({
  credentials: process.env.NEXT_PUBLIC_FAL_KEY,
});

export default function Home() {
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleImagePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImagePrompt(e.target.value);
  };

  const handleVideoPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVideoPrompt(e.target.value);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  // Progress tracking effect
  useEffect(() => {
    if (isLoading && startTime) {
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const estimatedTotal = 110000; // 110 seconds in milliseconds
        const calculatedProgress = Math.min((elapsed / estimatedTotal) * 100, 95); // Cap at 95% until completion
        setProgress(calculatedProgress);
        
        const remainingTime = Math.max(0, Math.ceil((estimatedTotal - elapsed) / 1000));
        if (remainingTime > 0) {
          setCurrentStep(`Processing... (~${remainingTime}s remaining)`);
        }
      }, 1000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isLoading, startTime]);

  const handleGenerate = async () => {
    if (!imagePrompt || !videoPrompt) {
      alert("Please fill in both prompts");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);
    setLogs([]);
    setCurrentStep("Initializing...");
    setProgress(0);
    setStartTime(Date.now());

    addLog("🚀 Starting video generation process");
    addLog(`📝 Image prompt: "${imagePrompt}"`);
    addLog(`🎬 Video prompt: "${videoPrompt}"`);
    addLog("⏱️ Estimated completion time: ~110 seconds");
    
    // Check authentication
    const falKey = process.env.NEXT_PUBLIC_FAL_KEY;
    if (!falKey) {
      addLog("❌ FAL_KEY not found in environment variables");
      setError("FAL_KEY not found. Please check your .env.local file contains NEXT_PUBLIC_FAL_KEY=your_key");
      setIsLoading(false);
      return;
    }
    addLog(`🔑 FAL_KEY loaded (length: ${falKey.length})`);

    try {
      setCurrentStep("Connecting to fal API...");
      addLog("🔗 Connecting to fal.stream API");
      
      const stream = await fal.stream("workflows/carloscisnerosjr/replicant", {
        input: {
          image_1: imagePrompt,
          video_1: videoPrompt
        }
      });

      addLog("✅ Successfully connected to fal workflow stream");
      setCurrentStep("Processing workflow...");

      let eventCount = 0;
      for await (const event of stream) {
        eventCount++;
        addLog(`📦 Event ${eventCount}: ${event.type || 'unknown type'}`);
        
        if (event.type === 'progress') {
          const progressData = event.data?.progress || 'Unknown progress';
          addLog(`⏳ Progress: ${JSON.stringify(event.data)}`);
        } else if (event.type === 'error') {
          addLog(`❌ Error event: ${JSON.stringify(event)}`);
        } else if (event.type === 'completed') {
          addLog(`✅ Completed event: ${JSON.stringify(event.data)}`);
        } else {
          addLog(`ℹ️  Event data: ${JSON.stringify(event)}`);
        }
      }

      setCurrentStep("Finalizing result...");
      addLog("🎯 Stream completed, getting final result");
      
      const finalResult = await stream.done();
      addLog(`🎉 Final result received: ${JSON.stringify(finalResult, null, 2)}`);
      
      setResult(finalResult);
      setProgress(100);
      setCurrentStep("Complete!");
      addLog("✨ Video generation completed successfully!");

    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      const errorDetails = {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
        code: error?.code,
        status: error?.status
      };
      
      addLog(`💥 Error occurred: ${errorMessage}`);
      addLog(`🔍 Error details: ${JSON.stringify(errorDetails, null, 2)}`);
      
      // Specific handling for authentication errors
      if (error?.status === 401) {
        const authErrorMsg = `🚫 Authentication failed (401 Unauthorized)\n\nPossible issues:\n1. FAL_KEY is incorrect or expired\n2. FAL_KEY format is wrong\n3. Environment variable not properly loaded\n\nCurrent FAL_KEY length: ${process.env.NEXT_PUBLIC_FAL_KEY?.length || 0}\n\nPlease check your .env.local file and ensure it contains:\nNEXT_PUBLIC_FAL_KEY=your_actual_fal_key`;
        setError(authErrorMsg);
        addLog("🔑 Authentication error detected");
      } else {
        setError(`${errorMessage}\n\nFull error: ${JSON.stringify(errorDetails, null, 2)}`);
      }
      
      setCurrentStep("Error occurred");
      console.error("Detailed error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Auto Kling 2.1 Video Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate a Kling 2.1 video from a single image prompt and video prompt
          </p>
        </div>

        {/* Video Display Area */}
        <div className="mb-12">
          {result && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Generated Video
              </h2>
              <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                {(() => {
                  // Handle nested output structure
                  const videoUrl = result?.output?.video?.url || result?.video_url || result?.video?.url;
                  const fileSize = result?.output?.video?.file_size;
                  const fileName = result?.output?.video?.file_name;
                  
                  if (videoUrl) {
                    return (
                      <div className="flex flex-col items-center space-y-4">
                        <video 
                          controls 
                          autoPlay
                          muted
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: '500px' }}
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        
                        <div className="flex flex-col items-center space-y-2">
                          <a 
                            href={videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                          >
                            Download Video
                          </a>
                          
                          {/* Video Info */}
                          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            {fileName && <div>File: {fileName}</div>}
                            {fileSize && <div>Size: {(fileSize / 1024 / 1024).toFixed(1)} MB</div>}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Raw Result:</h3>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 overflow-auto bg-gray-50 dark:bg-gray-800 p-4 rounded max-h-96">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Video Placeholder */}
          {isLoading && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Generating Your Video
              </h2>
              <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-2xl aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎬</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          Video processing in progress...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          This may take several minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Status and Progress Bar - positioned between video and prompts */}
        {isLoading && currentStep && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="font-medium">{currentStep}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Estimated total time: ~110 seconds
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Image Prompt
            </h2>
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <textarea
                value={imagePrompt}
                onChange={handleImagePromptChange}
                placeholder="Describe the image you want to generate..."
                className="w-full h-40 p-4 border border-neutral-300 dark:border-neutral-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Video Prompt
            </h2>
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <textarea
                value={videoPrompt}
                onChange={handleVideoPromptChange}
                placeholder="Describe the video you want to generate..."
                className="w-full h-40 p-4 border border-neutral-300 dark:border-neutral-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !imagePrompt || !videoPrompt}
            className="px-12 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? "Generating Video..." : "Generate Video"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8">
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">❌ Error Occurred</h3>
              <pre className="whitespace-pre-wrap text-sm text-red-700 dark:text-red-300 overflow-auto">
                {error}
              </pre>
            </div>
          </div>
        )}

        {/* Debug Logs */}
        {logs.length > 0 && (
          <div className="mt-8">
            <details className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                🐛 Debug Logs ({logs.length} entries)
              </summary>
              <div className="px-6 pb-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-h-80 overflow-auto bg-gray-50 dark:bg-gray-900 rounded p-4 mt-4">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}

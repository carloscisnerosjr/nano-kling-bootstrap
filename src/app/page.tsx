"use client";
import React, { useState } from "react";

export default function Home() {
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");

  const handleImagePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImagePrompt(e.target.value);
  };

  const handleVideoPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVideoPrompt(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Content Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate images and videos using AI prompts
          </p>
        </div>
        
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
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Generate Image
              </button>
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
              <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Generate Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

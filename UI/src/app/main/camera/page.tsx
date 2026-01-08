"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect, useCallback } from "react";

export default function CameraView() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      // Request access to the user's camera (focusing on front camera when possible)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Prefer front camera
        audio: false,
      });

      setStream(mediaStream);

      // Set the video element's source to the camera stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setCameraReady(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please confirm your permissions and try again.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, [stream]);

  // Initialize camera on component mount
  useEffect(() => {
    void startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      stopCamera();
    };
    // Keep the dependency array empty to run this effect only once during mount,
    // otherwise it will run on every render.
     
  }, []);

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    // Set canvas size to match video dimensions
    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    // Convert canvas to data URL
    const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const discardPhoto = () => {
    void startCamera();
    setCapturedImage(null);
  };

  const proceedToSendPhoto = () => {
    // TODO: Refactor to store using Redux
    if (capturedImage) {
      localStorage.setItem("ghostLetterLastPhoto", capturedImage);
      router.push("/main/send-to");
    }
  };

  /* eslint-disable @next/next/no-img-element */
  return (
    <div className="flex h-svh flex-col bg-black">
      {/* Main Content Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {error ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div className="rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
              <p>{error}</p>
              <button onClick={void startCamera} className="mt-4 rounded bg-indigo-500 px-4 py-2 text-white">
                Try Again
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          // Photo confirmation view
          <div className="relative flex flex-1 flex-col items-center justify-center">
            <div className="relative h-full w-full">
              <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
              <div className="absolute right-0 bottom-32 left-0 flex justify-center space-x-12 px-6">
                <button
                  onClick={discardPhoto}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl text-white shadow-lg"
                >
                  ✕
                </button>

                <button
                  onClick={proceedToSendPhoto}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Camera view
          <div className="relative flex flex-1 flex-col items-center justify-center">
            {/* Video element for camera preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full scale-x-[-1] transform object-cover"
              onCanPlay={() => setCameraReady(true)}
            />

            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture button */}
            {isCameraReady && (
              <div className="absolute right-0 bottom-32 left-0 flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-300 bg-white shadow-lg"
                  aria-label="Take photo"
                >
                  <div className="h-16 w-16 rounded-full bg-white"></div>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
    </div>
  );
}

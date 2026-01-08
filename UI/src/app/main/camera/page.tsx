"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stack, Alert, ActionIcon, Group, Button } from '@mantine/core';
import { IconX, IconCheck, IconRefresh } from '@tabler/icons-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'black' }}>
      {/* Main Content Area */}
      <main style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error ? (
          <Stack align="center" justify="center" h="100%" p="xl">
            <Alert color="red" title="Camera Error" icon={<IconX />}>
              {error}
              <Button onClick={void startCamera} mt="md" leftSection={<IconRefresh />}>
                Try Again
              </Button>
            </Alert>
          </Stack>
        ) : capturedImage ? (
          // Photo confirmation view
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
              <img src={capturedImage} alt="Captured" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              <Group gap="xl" style={{ position: 'absolute', bottom: '128px', left: 0, right: 0, justifyContent: 'center' }}>
                <ActionIcon
                  onClick={discardPhoto}
                  size={64}
                  radius="xl"
                  color="red"
                  variant="filled"
                >
                  <IconX size={32} />
                </ActionIcon>

                <ActionIcon
                  onClick={proceedToSendPhoto}
                  size={64}
                  radius="xl"
                  color="green"
                  variant="filled"
                >
                  <IconCheck size={32} />
                </ActionIcon>
              </Group>
            </div>
          </div>
        ) : (
          // Camera view
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Video element for camera preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ height: '100%', width: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              onCanPlay={() => setCameraReady(true)}
            />

            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Capture button */}
            {isCameraReady && (
              <div style={{ position: 'absolute', bottom: '128px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <ActionIcon
                  onClick={capturePhoto}
                  size={80}
                  radius="xl"
                  variant="white"
                  style={{ border: '4px solid white' }}
                  aria-label="Take photo"
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'white' }} />
                </ActionIcon>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
    </div>
  );
}

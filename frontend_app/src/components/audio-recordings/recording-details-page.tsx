import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRANSCRIPTION_API } from "@/lib/apiConstants";
import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileAudio,
  FileText,
  Pause,
  Play,
  RefreshCw,
  Tag,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

import type { AudioRecording } from "./audio-recordings-context";

interface ExtendedAudioRecording extends AudioRecording {
  analysis_text?: string;
  file_name?: string;
}

interface RecordingDetailsPageProps {
  recording: ExtendedAudioRecording;
}

const statusStyles: Record<string, string> = {
  completed:
    "bg-green-500 text-white border border-green-700 shadow-md px-4 py-1 rounded-full",
  processing:
    "bg-yellow-500 text-black border border-yellow-600 shadow-md px-4 py-1 rounded-full",
  uploaded:
    "bg-blue-500 text-white border border-blue-700 shadow-md px-4 py-1 rounded-full",
  failed:
    "bg-red-500 text-white border border-red-700 shadow-md px-4 py-1 rounded-full",
  error:
    "bg-red-500 text-white border border-red-700 shadow-md px-4 py-1 rounded-full",
  default:
    "bg-gray-500 text-white border border-gray-600 shadow-md px-4 py-1 rounded-full",
};

export function RecordingDetailsPage({ recording }: RecordingDetailsPageProps) {
  const router = useRouter();
  const [transcriptionText, setTranscriptionText] = useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);

  // Create a ref for the audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // We're not auto-loading the transcription anymore
    // If you want to keep this for some reason, update the error message:
    /*
    if (!recording.transcription_file_path) return;
    fetch(recording.transcription_file_path)
      .then((response) => response.text())
      .then((text) => setTranscriptionText(text))
      .catch(() => {
        // Don't set any error message, just log it
        console.error("Failed to load transcription from file path");
      });
    */
  }, [recording.transcription_file_path]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle mute/unmute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;
  }, [isMuted]);

  // Handle volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
  }, [volume]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
  };

  const handleGoBack = () => {
    router.history.back();
  };

  return (
    <div className="relative container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Audio Recording Details</h1>
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <span
                className="cursor-pointer hover:underline"
                onClick={handleGoBack}
              >
                Recordings
              </span>
              <span>/</span>
              <span>{recording.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary/10 rounded-full p-2">
                  <FileAudio className="text-primary h-5 w-5" />
                </span>
                Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Hidden audio element that we control programmatically */}
              <audio
                ref={audioRef}
                src={recording.file_path}
                preload="metadata"
                className="hidden"
              />

              <div className="bg-secondary/30 mb-4 rounded-lg p-4">
                <div className="mb-3 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 rounded-full"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <div className="flex flex-1 items-center gap-3">
                    <span className="text-sm">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleTimeChange}
                      className="bg-secondary h-2 flex-1 cursor-pointer appearance-none rounded-lg"
                    />
                    <span className="text-sm">{formatTime(duration || 0)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMuteToggle}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="bg-secondary h-2 w-20 cursor-pointer appearance-none rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => window.open(recording.file_path, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Audio
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="flex-shrink-0 text-sm font-medium">
                      Job ID:
                    </span>
                    <code className="bg-secondary/50 rounded px-1.5 py-0.5 text-sm">
                      {recording.id}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="flex-shrink-0 text-sm font-medium">
                      User ID:
                    </span>
                    <code className="bg-secondary/50 rounded px-1.5 py-0.5 text-sm">
                      {recording.user_id}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <RefreshCw className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="flex-shrink-0 text-sm font-medium">
                      Status:
                    </span>
                    <Badge
                      className={cn(
                        "flex min-w-[100px] items-center justify-center rounded-md px-4 py-1 text-xs",
                        statusStyles[recording.status] || statusStyles.default,
                      )}
                    >
                      {recording.status.charAt(0).toUpperCase() +
                        recording.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="flex-shrink-0 text-sm font-medium">
                      Created:
                    </span>
                    <span className="text-sm">
                      {new Date(recording.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    <span className="flex-shrink-0 text-sm font-medium">
                      Updated:
                    </span>
                    <span className="text-sm">
                      {new Date(recording.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Tag className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <span className="mr-1 flex-shrink-0 text-sm font-medium">
                        Category:
                      </span>
                      <code className="bg-secondary/50 rounded px-2 py-1 text-sm break-all">
                        {recording.prompt_category_id || "N/A"}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tag className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="flex items-center">
                      <span className="mr-1 flex-shrink-0 text-sm font-medium">
                        Subcategory:
                      </span>
                      <code className="bg-secondary/50 rounded px-2 py-1 text-sm break-all">
                        {recording.prompt_subcategory_id || "N/A"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transcription" className="w-full">
            <TabsList className="mb-4 grid grid-cols-2">
              <TabsTrigger value="transcription">Transcription</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="transcription" className="mt-0">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary/10 rounded-full p-2">
                      <FileText className="text-primary h-5 w-5" />
                    </span>
                    Transcription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transcriptionText ? (
                    <div className="mb-4 rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800">
                      <pre className="text-sm whitespace-pre-wrap">
                        {transcriptionText}
                      </pre>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-4 py-8 shadow-md dark:bg-gray-800">
                        <p className="text-muted-foreground mb-6 text-center">
                          Transcription data is not loaded. Click the button
                          below to load the transcription.
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                throw new Error(
                                  "No authentication token found",
                                );
                              }

                              const response = await fetch(
                                `${TRANSCRIPTION_API}/${recording.id}`,
                                {
                                  method: "GET",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                },
                              );

                              if (!response.ok) {
                                throw new Error(
                                  `HTTP error! Status: ${response.status}`,
                                );
                              }

                              const text = await response.text();

                              if (text && text.length > 0) {
                                setTranscriptionText(text);
                              } else {
                                throw new Error("Received empty transcription");
                              }
                            } catch (error) {
                              console.error(
                                "Error loading transcription:",
                                error,
                              );

                              if (error instanceof Error) {
                                if (error.message.includes("404")) {
                                  setTranscriptionText(
                                    "Transcription not found for this recording.",
                                  );
                                } else if (
                                  error.message.includes("401") ||
                                  error.message.includes("403")
                                ) {
                                  setTranscriptionText(
                                    "Not authorized to access this transcription.",
                                  );
                                } else {
                                  setTranscriptionText(
                                    "Unable to load transcription. Please try again later.",
                                  );
                                }
                              } else {
                                setTranscriptionText(
                                  "Unable to load transcription. Please try again later.",
                                );
                              }
                            }
                          }}
                          className="px-8"
                        >
                          Load Transcription
                        </Button>
                      </div>
                    </div>
                  )}

                  {recording.transcription_file_path && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() =>
                          recording.transcription_file_path &&
                          window.open(
                            recording.transcription_file_path,
                            "_blank",
                          )
                        }
                        variant="outline"
                        className="w-full max-w-md rounded-lg font-semibold shadow-md"
                        disabled={!recording.transcription_file_path}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Transcription TXT
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary/10 rounded-full p-2">
                      <FileText className="text-primary h-5 w-5" />
                    </span>
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recording.analysis_text ? (
                    <>
                      <div className="mb-4 rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800">
                        {recording.analysis_text
                          .split("\n\n")
                          .map((section: string, index: number) => {
                            const lines = section.split("\n");
                            const title = lines[0];
                            const content = lines.slice(1);

                            return (
                              <div key={index} className="mt-4">
                                <h4 className="text-md font-semibold">
                                  {title}
                                </h4>
                                <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
                                  {content.map(
                                    (point: string, subIndex: number) => (
                                      <li key={subIndex}>{point}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            );
                          })}
                      </div>
                      <Button
                        onClick={() =>
                          recording.analysis_file_path &&
                          window.open(recording.analysis_file_path, "_blank")
                        }
                        variant="outline"
                        className="mt-2 w-full rounded-lg font-semibold shadow-md"
                        disabled={!recording.analysis_file_path}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Analysis PDF
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No analysis available for this recording.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

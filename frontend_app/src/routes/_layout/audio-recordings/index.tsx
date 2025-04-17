import type { FilterValues } from "@/components/audio-recordings/AudioRecordingsCombined";
import { useState } from "react";
import { AudioRecordingsProvider } from "@/components/audio-recordings/audio-recordings-context";
import { AudioRecordingsCombined } from "@/components/audio-recordings/AudioRecordingsCombined";
import { AudioRecordingsHeader } from "@/components/audio-recordings/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/audio-recordings/")({
  component: AudioRecordingsIndexComponent,
});

function AudioRecordingsIndexComponent() {
  const [filters, _setFilters] = useState<FilterValues>({
    job_id: "",
    status: "all",
    created_at: new Date().toISOString().split("T")[0],
  });

  return (
    <AudioRecordingsProvider>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <AudioRecordingsHeader />
        <AudioRecordingsCombined initialFilters={filters} />
      </div>
    </AudioRecordingsProvider>
  );
}

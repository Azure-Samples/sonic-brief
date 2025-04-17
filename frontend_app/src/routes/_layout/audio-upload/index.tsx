import { createFileRoute } from "@tanstack/react-router";
import { AudioUploadForm } from "@/components/dashboard/audio-upload-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_layout/audio-upload/")({
  component: AudioUploadPage,
});

function AudioUploadPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Audio Upload</h2>
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio File</CardTitle>
          <CardDescription>
            Upload an audio file and select prompts for processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute, useParams } from "@tanstack/react-router";
import { RecordingDetailsPageWrapper } from "@/components/audio-recordings/recording-details-page-wrapper";

export const Route = createFileRoute("/_layout/audio-recordings/$id")({
  component: RecordingDetailsComponent,
});

function RecordingDetailsComponent() {
  const { id } = useParams({ from: "/_layout/audio-recordings/$id" });
  return <RecordingDetailsPageWrapper id={id} />;
}

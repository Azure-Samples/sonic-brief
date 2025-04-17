import { useCallback, useState } from "react";
import { AudioRecordingsProvider } from "@/components/audio-recordings/audio-recordings-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JOBS_API } from "@/lib/apiConstants";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Eye, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ViewDetailsDialog } from "./view-details-dialog";

const statusEnum = z.enum([
  "all",
  "uploaded",
  "processing",
  "completed",
  "failed",
]);

const filterSchema = z.object({
  job_id: z.string().optional(),
  status: statusEnum.default("all"),
  created_at: z.string().optional(),
});

export type FilterValues = z.infer<typeof filterSchema>;

const safeGetLocalStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return null;
  }
};

const statusVariants: Record<string, string> = {
  completed: "bg-green-500 text-white",
  processing: "bg-yellow-500 text-black",
  uploaded: "bg-blue-500 text-white",
  failed: "bg-red-500 text-white",
  default: "bg-gray-400 text-white",
};

const RECORDS_PER_PAGE = 10;

export function AudioRecordingsCombined({
  initialFilters,
}: {
  initialFilters: FilterValues;
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FilterValues>({
    defaultValues: {
      job_id: initialFilters.job_id,
      status: initialFilters.status,
      created_at: "",
    },
    resolver: zodResolver(filterSchema),
  });

  const fetchJobData = useCallback(async (filters?: FilterValues) => {
    const token = safeGetLocalStorage("token");
    if (!token)
      throw new Error("No authentication token found. Please log in again.");

    const params = new URLSearchParams({
      job_id: filters?.job_id || "",
      status: filters?.status && filters.status !== "all" ? filters.status : "",
      created_at: filters?.created_at || "",
    });

    const response = await fetch(`${JOBS_API}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data.jobs || [];
  }, []);

  const {
    data: audioRecordings,
    isLoading,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["audioRecordings"],
    queryFn: () => fetchJobData(),
    placeholderData: [],
  });

  // Refresh Handler (Keep Filters)
  const handleRefresh = async () => {
    await refetchJobs();
  };

  // Reset button handler - clears filters
  const handleReset = async () => {
    form.reset({ job_id: "", status: "all", created_at: "" });
    await refetchJobs();
  };

  // Pagination Logic
  const totalPages = Math.ceil(
    (audioRecordings?.length || 0) / RECORDS_PER_PAGE,
  );
  const paginatedData = audioRecordings?.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE,
  );

  return (
    <AudioRecordingsProvider>
      <Card className="mx-auto mt-8 w-full max-w-5xl p-6">
        <CardHeader>
          <CardTitle>Audio Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="job_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Job ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusEnum.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Date</FormLabel>
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                              onClick={() => setIsDatePickerOpen(true)}
                            >
                              {field.value
                                ? format(new Date(field.value), "yyyy-MM-dd")
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              const formattedDate = date
                                ? format(date, "yyyy-MM-dd")
                                : "";
                              field.onChange(formattedDate);
                              setIsDatePickerOpen(false);
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {isLoading ? "Resetting..." : "Reset"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {isLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </form>
          </Form>

          {isLoading && <Progress value={90} className="mt-4 mb-4" />}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.length > 0 ? (
                paginatedData.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell className="font-medium text-blue-500">
                      {row.file_name ||
                        row.file_path.split("/").pop() ||
                        "Unnamed Recording"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "flex min-w-[100px] items-center justify-center rounded-md px-4 py-1 text-xs",
                          statusVariants[row.status] || statusVariants.default,
                        )}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(parseInt(row.created_at)).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {/* Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedRecording(row)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        {selectedRecording &&
                          selectedRecording.id === row.id && (
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  localStorage.setItem(
                                    "current_recording_id",
                                    row.id,
                                  );
                                  router.navigate({
                                    to: `/audio-recordings/$id`,
                                    params: { id: row.id },
                                  });
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {row.status === "uploaded" && (
                                <DropdownMenuItem onClick={() => null}>
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Retry Processing
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          )}
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-4 text-center text-gray-500"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls*/}
          <div className="mt-4 flex justify-between">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
          {selectedRecording && (
            <ViewDetailsDialog
              recording={selectedRecording}
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedRecording(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </AudioRecordingsProvider>
  );
}

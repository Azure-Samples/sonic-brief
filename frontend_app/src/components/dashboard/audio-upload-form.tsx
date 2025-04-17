import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPrompts, uploadFile } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as z from "zod";

// Define the form schema using Zod
const formSchema = z.object({
  audioFile: z.instanceof(File), // Removed size restriction
  promptCategory: z.string({
    required_error: "Please select a prompt category.",
  }),
  promptSubcategory: z.string({
    required_error: "Please select a prompt subcategory.",
  }),
});

// Define interfaces for prompts, subcategories, and categories
interface Prompt {
  [key: string]: string;
}

interface Subcategory {
  subcategory_name: string;
  subcategory_id: string;
  prompts: Prompt;
}

interface Category {
  category_name: string;
  category_id: string;
  subcategories: Array<Subcategory>;
}

// Main component for audio upload form
export function AudioUploadForm() {
  const [categories, setCategories] = useState<Array<Category>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fetchAndUpdateCategories = useCallback(() => {
    setLoadingCategories(true);
    fetchPrompts()
      .then((response) => {
        const fetchedCategories = response.data;
        setCategories(fetchedCategories);
        localStorage.setItem(
          "promptCategories",
          JSON.stringify(fetchedCategories),
        );
        setLoadingCategories(false); // Stop loading once fetched
      })
      .catch((error) => {
        console.error("Error fetching prompts:", error);
        setNotification({
          type: "error",
          message: "Failed to load prompt categories. Please try again later.",
        });
        setLoadingCategories(false);
      });
  }, []);

  useEffect(() => {
    const storedCategories = localStorage.getItem("promptCategories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
      setLoadingCategories(false);
    } else {
      fetchAndUpdateCategories();
    }
  }, [fetchAndUpdateCategories]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsUploading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again.",
          );
        }

        const response = await uploadFile(
          values.audioFile,
          values.promptCategory,
          values.promptSubcategory,
          token,
        );

        setNotification({
          type: "success",
          message: `File ${values.audioFile.name} uploaded successfully! Job ID: ${response.job_id}`,
        });
        form.reset();
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      } catch (error) {
        console.error("Error in form submission:", error);
        let errorMessage =
          "There was an error uploading your file. Please try again.";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setNotification({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [form],
  );

  const selectedCategoryData = categories.find(
    (cat) => cat.category_id === selectedCategory,
  );
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    (sub) => sub.subcategory_id === selectedSubcategory,
  );

  return (
    <>
      {notification && (
        <NotificationBanner
          variant={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="audioFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      field.onChange(e.target.files?.[0]);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload an audio file (no size limit)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promptCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Category</FormLabel>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedCategory || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                      setSelectedSubcategory(null);
                      form.setValue("promptSubcategory", "");
                    }}
                    disabled={loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchAndUpdateCategories}
                    disabled={loadingCategories}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {loadingCategories ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promptSubcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Subcategory</FormLabel>
                <Select
                  value={selectedSubcategory || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedSubcategory(value);
                  }}
                  disabled={!selectedCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCategoryData?.subcategories.map((subcategory) => (
                      <SelectItem
                        key={subcategory.subcategory_id}
                        value={subcategory.subcategory_id}
                      >
                        {subcategory.subcategory_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedSubcategoryData && (
            <Card>
              <CardHeader>
                <CardTitle className="font-bold">
                  {selectedSubcategoryData.subcategory_name}
                </CardTitle>
                <CardDescription>
                  Prompt details for the selected subcategory
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-60 overflow-auto p-4">
                {Object.entries(selectedSubcategoryData.prompts).map(
                  ([key, value]) => (
                    <div key={key} className="mb-4">
                      <h4 className="text-lg font-semibold">{key}</h4>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {value}
                      </ReactMarkdown>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          )}
          <Button
            type="submit"
            disabled={isUploading || !form.formState.isValid}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Upload and Process"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

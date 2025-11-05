"use client";

import { Share } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { submitPaperAnalysis } from "@/actions/paperAnalysis";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadFormSchema,
  UploadFormSchemaType,
} from "@/schemas/UploadFormSchema";
import { cn } from "@/lib/utils";

type UploadFormProps = {
  onAnalysis?: (res: any) => void;
};

const UploadForm = ({ onAnalysis }: UploadFormProps) => {
  const [disabled, setDisabled] = useState(false);
  const form = useForm<UploadFormSchemaType>({
    defaultValues: {
      rawSummary: "",
    },
    resolver: zodResolver(UploadFormSchema),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(null);
    form.setValue("file", undefined);

    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      form.setValue("file", file);
    }
  };

  const onSubmit = (data: UploadFormSchemaType) => {
    (async () => {
      setError(null);
      setLoading(true);

      try {
        const result = await submitPaperAnalysis({
          file: selectedFile,
          rawSummary: data.rawSummary,
        });

        // propagate result to parent if provided
        onAnalysis?.(result);
        setDisabled(true);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <article className="space-y-4 bg-card p-4 rounded-lg">
      <h2 className="font-medium text-xl">Upload Summary</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rawSummary"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Paste raw summary here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-center">or</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem
                className={cn(disabled ? "opacity-50 pointer-events-none" : "")}
              >
                <FormControl>
                  <div
                    onClick={handleFileUploadClick}
                    className="flex flex-col justify-center items-center space-y-2 hover:bg-primary/10 py-3 border-[1.5px] border-border border-dashed rounded-lg hover:text-primary transition-colors cursor-pointer"
                  >
                    <Share />
                    <label className="cursor-pointer">
                      {selectedFile ? selectedFile.name : "Upload Article"}
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || disabled}
          >
            {loading ? "Analyzing…" : "Analyze Paper"}
          </Button>
        </form>
      </Form>
      {error && (
        <div className="mt-2 text-destructive text-sm">Error: {error}</div>
      )}
    </article>
  );
};

export default UploadForm;

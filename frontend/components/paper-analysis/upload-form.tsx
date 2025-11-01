"use client";

import { Share } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadFormSchema,
  UploadFormSchemaType,
} from "@/schemas/UploadFormSchema";

const UploadForm = () => {
  const form = useForm<UploadFormSchemaType>({
    defaultValues: {
      rawSummary: "",
      corpus: "",
    },
    resolver: zodResolver(UploadFormSchema),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      form.setValue("file", file);
    }
  };

  const onSubmit = (data: UploadFormSchemaType) => {
    console.log(data);
  };

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
              <FormItem>
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
          <FormField
            control={form.control}
            name="corpus"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select corpus" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Corpus</SelectLabel>
                      <SelectItem value="arxiv">arXiv</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Analyze Paper
          </Button>
        </form>
      </Form>
    </article>
  );
};

export default UploadForm;

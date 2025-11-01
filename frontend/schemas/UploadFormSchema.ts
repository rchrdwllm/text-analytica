import { z } from "zod";

export const UploadFormSchema = z
  .object({
    rawSummary: z.string().optional(),
    file: z
      .instanceof(File)
      .refine((file) => file.type === "application/pdf", {
        message: "Only PDF files are allowed",
      })
      .optional(),
    corpus: z.string().min(1, "Please select a corpus"),
  })
  .refine((data) => data.rawSummary || data.file, {
    message: "Please provide either a raw summary or upload a file",
    path: ["rawSummary"],
  });

export type UploadFormSchemaType = z.infer<typeof UploadFormSchema>;

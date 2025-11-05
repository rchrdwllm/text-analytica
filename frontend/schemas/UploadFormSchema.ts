import { z } from "zod";

export const UploadFormSchema = z.object({
  rawSummary: z.string().optional(),
  file: z
    .instanceof(File)
    .refine((file) => file == null || file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    })
    .nullable()
    .optional(),
});

export type UploadFormSchemaType = z.infer<typeof UploadFormSchema>;

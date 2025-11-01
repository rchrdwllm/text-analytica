import * as z from "zod";

export const SearchAuthorsSchema = z.object({
  query: z.string().optional(),
});

export type SearchAuthorsSchemaType = z.infer<typeof SearchAuthorsSchema>;

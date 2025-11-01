import * as z from "zod";

export const SearchCorpusSchema = z.object({
  query: z.string().optional(),
});

export type SearchCorpusSchemaType = z.infer<typeof SearchCorpusSchema>;

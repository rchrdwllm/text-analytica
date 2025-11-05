"use client";

import {
  SearchCorpusSchema,
  SearchCorpusSchemaType,
} from "@/schemas/SearchCorpusSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { CorpusSearchContext } from "@/context/corpus-search-context-wrapper";

const SearchCorpusForm = () => {
  const { setSearchQuery } = useContext(CorpusSearchContext);
  const form = useForm<SearchCorpusSchemaType>({
    defaultValues: {
      query: "",
    },
    resolver: zodResolver(SearchCorpusSchema),
  });

  const onSubmit = (data: SearchCorpusSchemaType) => {
    setSearchQuery(data.query || "");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-4"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="w-[412px]">
              <FormControl>
                <InputGroup className="bg-card border-none">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search" {...field} />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="ml-auto">
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchCorpusForm;

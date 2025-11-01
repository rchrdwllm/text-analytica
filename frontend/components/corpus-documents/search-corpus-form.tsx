"use client";

import { useForm } from "react-hook-form";
import { Plus, Search } from "lucide-react";
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
import {
  SearchCorpusSchema,
  SearchCorpusSchemaType,
} from "@/schemas/SearchCorpusSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";

const SearchCorpusForm = () => {
  const form = useForm<SearchCorpusSchemaType>({
    defaultValues: {
      query: "",
    },
    resolver: zodResolver(SearchCorpusSchema),
  });

  return (
    <Form {...form}>
      <form className="flex items-center gap-4">
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
        <Button type="button" variant="secondary">
          Add a topic tag <Plus />
        </Button>
        <Button type="submit" className="ml-auto">
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchCorpusForm;

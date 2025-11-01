"use client";

import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  SearchAuthorsSchema,
  SearchAuthorsSchemaType,
} from "@/schemas/SearchAuthorsSchema";

const SearchAuthorsForm = () => {
  const form = useForm<SearchAuthorsSchemaType>({
    defaultValues: {
      query: "",
    },
    resolver: zodResolver(SearchAuthorsSchema),
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
        <Button type="submit" className="ml-auto">
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchAuthorsForm;

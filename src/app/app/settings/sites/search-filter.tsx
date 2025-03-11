import { Column } from "@tanstack/react-table";

import { Input } from "@/components/ui/input"

interface SearchFilterProps<TData> {
    placeholder: string
    column?: Column<TData>
}
  
export function SearchFilter<TData>({
    placeholder,
    column,
  }: SearchFilterProps<TData>) {
    return (
        <Input
          placeholder={placeholder}
          value={(column?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            column?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
    )
  }
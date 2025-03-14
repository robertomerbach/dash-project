"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ViewOptions } from "./view-options" 
import { FacetedFilter } from "./faceted-filter"

import { SearchFilter } from "./search-filter"

interface ToolbarProps<TData> {
  table: Table<TData>
}

export function Toolbar<TData>({
  table,
}: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <SearchFilter
          placeholder="Search site..."
          column={table.getColumn("name")}
        />
        {/* {table.getColumn("status") && (
          <FacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )} */}
        {/* {table.getColumn("priority") && (
          <FacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <ViewOptions table={table} />
    </div>
  )
}
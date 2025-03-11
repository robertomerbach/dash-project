import { Input } from "../ui/input";

export function FilterSearch({ onSearch, placeholder }: { onSearch: (value: string) => void, placeholder: string }) {
    return (
      <div className="flex items-center py-4">
        <Input
          placeholder={placeholder}
          onChange={(event) => onSearch(event.target.value)}
          className="max-w-md"
        />
      </div>
    )
  }
  
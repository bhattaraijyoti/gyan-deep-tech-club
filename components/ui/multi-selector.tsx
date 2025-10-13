"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MultiSelectorProps {
  id?: string
  options: string[]
  placeholder?: string
  value: string[]
  onChange: (value: string[]) => void
  allowCustom?: boolean
}

export const MultiSelector: React.FC<MultiSelectorProps> = ({
  id,
  options,
  placeholder = "Select options...",
  value,
  onChange,
  allowCustom = false,
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const handleAddCustom = () => {
    const trimmed = search.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setSearch("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left "
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-secondary px-2 py-1 rounded"
                >
                  <span>{v}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange(value.filter(item => item !== v))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onChange(value.filter(item => item !== v))
                      }
                    }}
                    className="ml-1 text-xs text-destructive hover:underlin cursor-pointer"
                    aria-label={`Remove ${v}`}
                  >
                    ×
                  </span>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search or add..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem key={opt} onSelect={() => toggleValue(opt)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(opt) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCustom && search.trim() && !options.includes(search.trim()) && (
              <CommandGroup>
                <CommandItem onSelect={handleAddCustom} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add "{search.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

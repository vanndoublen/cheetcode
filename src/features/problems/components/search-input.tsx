import { Input } from "@/components/ui/input";
import { Search01FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useProblemsParams } from "../hooks/use-problems-params";
import { useSearch } from "../hooks/use-search";

interface Props {
    placeholder?: string;
}

export const SearchInput = ({
    placeholder = "Search",
}: Props) => {
    const [params, setParams] = useProblemsParams();
    const { searchValue, onSearchChange } = useSearch({ params, setParams });
    return (
        <div className="relative ml-auto">
            <HugeiconsIcon icon={Search01FreeIcons} className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
                className="max-w-50 bg-background shadow-none border-border pl-8"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    )
}
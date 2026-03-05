import { CategorySelectFilter } from "./category-search-filter"
import { DifficultiesSelectFilter } from "./difficulties-select-filter"

export const FiltersView = () => {
    return (
        <div className="flex flex-col gap-8 px-8">
            <h1>Filters</h1>
            <div className="flex flex-col gap-2">
                <span className="text-xs">Difficulty</span>
                <DifficultiesSelectFilter />
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs">Category</span>
                <CategorySelectFilter />
            </div>
        </div>
    )
}
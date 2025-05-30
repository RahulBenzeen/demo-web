import { Input } from "@/components/ui/input"
import { useState } from "react"

const SearchBox = ({ searchText }: { searchText: (text: string) => void }) => {
    const [searchTexts, setSearchText] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            searchText(searchTexts); // Only trigger on Enter
        }
    };

    return (
        <Input
            type="search"
            placeholder="Search..."
            value={searchTexts}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
        />
    );
};

export default SearchBox;

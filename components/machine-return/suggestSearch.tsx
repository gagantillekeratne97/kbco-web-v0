"use client"; 
import { Search, Loader2 } from "lucide-react";

export default function SuggestSearch() {
    return (
        <div className="relative">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"/>                
        
                        <input 
                        type="text" 
                        placeholder="Search machine Serial No Or P Number"
                        className="w-full h-10 pr-10 text-sm border rounded-md outline-none bg-background pl-9 focus:ring-2 focus:ring-ring"/>
        
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </span>            
        </div>
    );
}
"use client"; 

export default function Error({error, reset}: {error: Error, reset: () => void}) { 
    return (
    <div className="min-h-screen items-center justify-center bg-surface"> 
        <div className="bg-card border border-border rounded-xl p-6 max-w-sm text-center shadow-card">
            <p className="text-sm font-medium text-navy-text">Couldn't load the dashboard</p>
            <p className="text-xs text-muted mt-1">{error.message}</p>
            <button onClick={reset} className="mt-4 text-sm font-medium text-orange hover:text-orange-hover">
                Try Again
            </button>
        </div>
    </div> 
    );
}
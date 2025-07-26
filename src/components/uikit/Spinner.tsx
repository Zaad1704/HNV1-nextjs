// frontend/src/components/uikit/Spinner.tsx
import React from 'react';

const Spinner = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-primary border-t-transparent"
                role="status"
                aria-label="loading"
            ></div>
            <span className="text-dark-text dark:text-dark-text-dark">Loading...</span>
        </div>
    );
};

export default Spinner;


import React, { useEffect, useRef } from 'react';

// This is a global declaration for the lucide library loaded from the CDN
declare global {
    interface Window {
        lucide: {
            createIcons: () => void;
        };
    }
}

interface IconProps extends React.HTMLAttributes<HTMLElement> {
    name: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '', ...props }) => {
    const iconRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [name]); // Re-run if the icon name changes

    return (
        <i
            ref={iconRef}
            data-lucide={name}
            className={className}
            {...props}
        ></i>
    );
};

export default Icon;

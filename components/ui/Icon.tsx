import React from 'react';

// This is a global declaration for the lucide library loaded from the CDN
declare global {
    interface Window {
        lucide: {
            icons: {
                [key: string]: [string, { [key: string]: any }, [string, { [key: string]: any }][]];
            };
            createIcons: () => void;
        };
    }
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    color?: string;
    size?: number | string;
}

const Icon: React.FC<IconProps> = ({ name, color = 'currentColor', size = 24, className = '', ...props }) => {
    if (typeof window === 'undefined' || !window.lucide || !window.lucide.icons || !window.lucide.icons[name]) {
        console.warn(`[Icon] Icon "${name}" not found.`);
        // Render a fallback "alert-circle" icon
        return (
            <svg
                width={size}
                height={size}
                className={className}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        );
    }

    const [tag, defaultAttrs, children] = window.lucide.icons[name];

    return React.createElement(
        tag,
        {
            ...defaultAttrs,
            width: size,
            height: size,
            stroke: color,
            className: `lucide lucide-${name} ${className}`,
            ...props,
        },
        ...children.map(([childTag, childAttrs], i) => React.createElement(childTag, { key: i, ...childAttrs }))
    );
};

export default Icon;

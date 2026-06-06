import React, { useEffect, useRef, useState } from 'react';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'none';
    className?: string;
    threshold?: number;
}

const FadeIn: React.FC<FadeInProps> = ({
    children,
    delay = 0,
    direction = 'up',
    className = '',
    threshold = 0.1
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getDirectionClasses = () => {
        switch (direction) {
            case 'up':
                return isVisible ? 'translate-y-0' : 'translate-y-8';
            case 'down':
                return isVisible ? 'translate-y-0' : '-translate-y-8';
            default:
                return '';
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${getDirectionClasses()} ${isVisible ? 'opacity-100' : 'opacity-0'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default FadeIn;

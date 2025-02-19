"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclosureProps {
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactNode);
    defaultOpen?: boolean;
}

interface DisclosureButtonProps {
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactNode);
    className?: string;
}

interface DisclosurePanelProps {
    children: React.ReactNode;
    className?: string;
}

const DisclosureContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({
    open: false,
    setOpen: () => { },
});

const Disclosure = ({ children, defaultOpen = false }: DisclosureProps) => {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <DisclosureContext.Provider value={{ open, setOpen }}>
            {typeof children === "function"
                ? (children as (props: { open: boolean }) => React.ReactNode)({ open })
                : children}
        </DisclosureContext.Provider>
    );
};

const Button = ({ children, className }: DisclosureButtonProps) => {
    const { open, setOpen } = React.useContext(DisclosureContext);

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                className
            )}
        >
            {typeof children === "function"
                ? (children as (props: { open: boolean }) => React.ReactNode)({ open })
                : children}
        </button>
    );
};

const Panel = ({ children, className }: DisclosurePanelProps) => {
    const { open } = React.useContext(DisclosureContext);

    if (!open) return null;

    return (
        <div
            className={cn(
                "transition-all duration-300 ease-in-out",
                className
            )}
        >
            {children}
        </div>
    );
};

Disclosure.Button = Button;
Disclosure.Panel = Panel;

export { Disclosure }; 
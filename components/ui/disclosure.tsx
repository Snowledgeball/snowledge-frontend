"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";

interface DisclosureProps {
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactNode);
    defaultOpen?: boolean;
}

interface DisclosureButtonProps {
    children: React.ReactNode | ((props: { open: boolean }) => React.ReactNode);
    className?: string;
    as?: React.ElementType;
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

const Button = ({ children, className, as: Component = 'button' }: DisclosureButtonProps) => {
    const { open, setOpen } = React.useContext(DisclosureContext);

    return (
        <Component
            type={Component === 'button' ? "button" : undefined}
            onClick={() => setOpen(!open)}
            className={cn(
                "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                className
            )}
        >
            {typeof children === "function"
                ? (children as (props: { open: boolean }) => React.ReactNode)({ open })
                : children}
        </Component>
    );
};

const Panel = ({ children, className }: DisclosurePanelProps) => {
    const { open } = React.useContext(DisclosureContext);

    return (
        <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
            <div className={cn("transition-all duration-300 ease-in-out", className)}>
                {children}
            </div>
        </Transition>
    );
};

Disclosure.Button = Button;
Disclosure.Panel = Panel;

export { Disclosure }; 
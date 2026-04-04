"use client";

import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// ── Context ──────────────────────────────────────────────────────────────────

interface StepperContextValue {
  activeStep: number;
  onValueChange?: (value: number) => void;
  orientation: "horizontal" | "vertical";
  totalSteps: number;
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 1,
  orientation: "horizontal",
  totalSteps: 1,
});

function useStepper() {
  return React.useContext(StepperContext);
}

interface StepItemContextValue {
  step: number;
  state: "active" | "completed" | "inactive";
}

const StepItemContext = React.createContext<StepItemContextValue>({
  step: 1,
  state: "inactive",
});

function useStepItem() {
  return React.useContext(StepItemContext);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StepperProps extends React.ComponentProps<"div"> {
  value: number;
  onValueChange?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
}

export interface StepperItemProps extends React.ComponentProps<"div"> {
  step: number;
}

export interface StepperTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

export interface StepperContentProps extends React.ComponentProps<"div"> {
  value: number;
  forceMount?: boolean;
}

// ── Components ────────────────────────────────────────────────────────────────

function Stepper({
  value,
  onValueChange,
  orientation = "horizontal",
  children,
  className,
  ...props
}: StepperProps) {
  // Count total steps from StepperItem children
  const totalSteps = React.Children.count(
    React.Children.toArray(children).filter(
      (child) =>
        React.isValidElement(child) &&
        (child.type as React.FC)?.displayName === "StepperNav"
          ? false
          : true,
    ),
  );

  return (
    <StepperContext.Provider
      value={{ activeStep: value, onValueChange, orientation, totalSteps }}
    >
      <div
        data-slot="stepper"
        data-orientation={orientation}
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

function StepperNav({ children, className }: React.ComponentProps<"nav">) {
  const { activeStep, orientation } = useStepper();

  return (
    <nav
      data-slot="stepper-nav"
      data-state={activeStep}
      data-orientation={orientation}
      className={cn(
        "group/stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        className,
      )}
    >
      {children}
    </nav>
  );
}
StepperNav.displayName = "StepperNav";

function StepperItem({ step, children, className, ...props }: StepperItemProps) {
  const { activeStep } = useStepper();
  const state: "active" | "completed" | "inactive" =
    activeStep === step ? "active" : activeStep > step ? "completed" : "inactive";

  return (
    <StepItemContext.Provider value={{ step, state }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn("group/step flex flex-1 items-center", className)}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

function StepperTrigger({ asChild, children, className, ...props }: StepperTriggerProps) {
  const { onValueChange } = useStepper();
  const { step, state } = useStepItem();

  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="stepper-trigger"
      data-state={state}
      onClick={() => onValueChange?.(step)}
      className={cn("focus-visible:outline-none", className)}
      type={asChild ? undefined : "button"}
      {...props}
    >
      {children}
    </Comp>
  );
}

function StepperIndicator({ children, className, ...props }: React.ComponentProps<"span">) {
  const { state, step } = useStepItem();

  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
        "data-[state=inactive]:bg-[var(--color-border)] data-[state=inactive]:text-[var(--color-text-muted)]",
        "data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white",
        "data-[state=completed]:bg-[var(--color-primary)] data-[state=completed]:text-white",
        className,
      )}
      {...props}
    >
      {state === "completed" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        children ?? step
      )}
    </span>
  );
}

function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        "mx-2 h-0.5 flex-1 transition-colors",
        "data-[state=inactive]:bg-[var(--color-border)]",
        "data-[state=active]:bg-[var(--color-border)]",
        "data-[state=completed]:bg-[var(--color-primary)]",
        "group-data-[state=completed]/step:bg-[var(--color-primary)]",
        className,
      )}
      {...props}
    />
  );
}

function StepperTitle({ children, className, ...props }: React.ComponentProps<"p">) {
  const { state } = useStepItem();

  return (
    <p
      data-slot="stepper-title"
      data-state={state}
      className={cn("text-sm font-medium", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function StepperDescription({ children, className, ...props }: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-description"
      data-state={state}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function StepperPanel({ children, className }: React.ComponentProps<"div">) {
  const { activeStep } = useStepper();

  return (
    <div data-slot="stepper-panel" data-state={activeStep} className={cn("w-full", className)}>
      {children}
    </div>
  );
}

function StepperContent({ value, forceMount, children, className }: StepperContentProps) {
  const { activeStep } = useStepper();
  const isActive = value === activeStep;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      data-slot="stepper-content"
      data-state={activeStep}
      className={cn("w-full", className, !isActive && forceMount && "hidden")}
      hidden={!isActive && forceMount}
    >
      {children}
    </div>
  );
}

export {
  useStepper,
  useStepItem,
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
  StepperNav,
};

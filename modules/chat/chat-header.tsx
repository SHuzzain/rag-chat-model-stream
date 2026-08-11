"use client";

import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  onReset?: () => void;
  disabled?: boolean;
}

export function ChatHeader({ onReset, disabled }: ChatHeaderProps) {
  return (
    <CardHeader className="gap-1 border-b">
      <CardTitle>ChampsLms</CardTitle>
      <CardDescription>How can I help you today?</CardDescription>
      {onReset && (
        <CardAction>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Reset conversation"
                  onClick={onReset}
                  disabled={disabled}
                >
                  <RotateCwIcon />
                </Button>
              }
            />
            <TooltipContent>
              <p>Reset</p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
      )}
    </CardHeader>
  );
}

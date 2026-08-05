"use client"

import { useChat } from "@ai-sdk/react"
import { createChat } from "@shadcn/helpers/ai-sdk"
import {
  ArrowUpIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
} from "lucide-react"

import { MessageAnimated } from "@/components/message-animated"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Form, Field as FormischField, setInput, useForm } from "@formisch/react"
import type { SubmitHandler } from "@formisch/react"
import * as v from "valibot"
import { Field, FieldGroup } from "@/components/ui/field"
import { DefaultChatTransport } from "ai"


const FormSchema = v.object({
  text: v.pipe(v.string(), v.minLength(1, "Please enter a message"))
})


export default function AiSdkHelperDemo() {

  const form = useForm({
    schema: FormSchema,
    initialInput: {
      text: "",
    },
  });

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "api/chat",
      body: {
        enableQueryRewrite: false,
        vectorWeight: 0.8,
        searchTopK: 20,
        rerankTopK: 10,
      }
    })
  });

  const isBusy = status === "submitted" || status === "streaming";

  console.log({ status })

  const handleSubmit: SubmitHandler<typeof FormSchema> = ({ text }) => {
    sendMessage({ text }, {
      body: {
        lastMessage: text
      }
    });
  };


  const handleReset = () => {
    setInput(form, {
      input: {
        text: "",
      },
    });
  };

  return (
    <MessageScrollerProvider>
      <div className="relative flex flex-col gap-4">
        <Card className="mx-auto h-140 w-full max-w-sm gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle>New Chat</CardTitle>
            <CardDescription>How can I help you today?</CardDescription>
            <CardAction>
              <Tooltip>
                <TooltipTrigger render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Reset conversation"
                    onClick={handleReset}
                    disabled={isBusy}
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
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle>Morning, shadcn!</EmptyTitle>
                  <EmptyDescription>
                    What are we working on today? Press send to start a new
                    conversation
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-busy={isBusy}
                    className="p-(--card-spacing)"
                  >
                    {messages.map((message) => (
                      <MessageAnimated
                        key={message.id}
                        message={message}
                        scrollAnchor={message.role === "user"}
                      />
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Form
              of={form}
              onSubmit={handleSubmit}
              className="w-full"
            >
              <FieldGroup>
                <FormischField of={form} path={["text"]}>
                  {(field) => (
                    <Field data-invalid={field.errors !== null}>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field.props}
                          aria-label="Next predefined message"
                          className="h-14 min-h-14 overflow-hidden px-3 py-2.5 opacity-60 data-[status=ready]:opacity-100"
                          data-status={status}
                          placeholder={
                            isBusy
                              ? "Generating..."
                              : "Conversation finished. Press Reset."
                          }
                        />
                        <InputGroupAddon align="block-end" className="pt-1">
                          <InputGroupButton
                            type="submit"
                            variant="default"
                            size="icon-sm"
                            disabled={isBusy}
                            className="ml-auto"
                          >
                            <ArrowUpIcon />
                            <span className="sr-only">Send</span>
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  )}
                </FormischField>
              </FieldGroup>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </MessageScrollerProvider>
  )
}

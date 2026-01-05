import type { Message } from "@/types/Message";

type TextMessageBubbleProps = {
  message: Message;
};

export default function TextMessageBubble({ message }: TextMessageBubbleProps) {
  return <p>{message.content}</p>;
}

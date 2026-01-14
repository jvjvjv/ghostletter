import type { Message } from "@/types/Message";

type TextMessageBubbleProps = {
  message: Message;
};

export default function TextMessageBubble({ message }: TextMessageBubbleProps) {
  return <p style={{
    marginBlockStart: '0.5rem',
    marginBlockEnd: '0.5rem',
  }}>{message.content}</p>;
}

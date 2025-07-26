interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  // Simple HTML content renderer
  // In a production app, you'd want to use a more robust HTML sanitizer
  const createMarkup = () => {
    // Basic HTML rendering - in production, use a proper sanitizer like DOMPurify
    return { __html: content };
  };

  return (
    <div 
      className="message-content"
      dangerouslySetInnerHTML={createMarkup()}
    />
  );
}

// One large, easy-to-read message bubble.
// from="user"  -> what the patient said (right side, green)
// from="guide" -> the guide's reply (left side, dark grey)
export default function ChatBubble({ from, children }) {
  const isUser = from === "user";
  return (
    <div className={`animate-fadeIn flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[88%] rounded-3xl px-5 py-3 text-left text-lg leading-relaxed",
          isUser
            ? "rounded-br-md bg-emerald-600 text-white"
            : "rounded-bl-md bg-white/10 text-neutral-100",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

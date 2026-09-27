import { useRef, useState, useLayoutEffect, type FormEvent, type KeyboardEvent } from "react";

const EXAMPLES = [
  "A project management tool for small teams",
  "A Notion-like workspace for students",
  "An expense tracker for freelancers",
];

const MIN_HEIGHT = 68;
const MAX_HEIGHT = 200;

export function IdeaInput({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow with the content instead of scrolling inside a fixed box —
  // the field is the only element on screen, so it can afford to be the
  // one that moves. scrollHeight has to be read with the CSS transition
  // off and the box already collapsed: read it while a taller box is still
  // mid-transition and it reports the old, not-yet-settled height instead
  // of what the content actually needs, so shrinking silently never fires.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const previousHeight = el.style.height;
    el.style.transition = "none";
    el.style.height = "0px";
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = previousHeight;
    void el.offsetHeight; // commit the untransitioned snap-back before re-enabling
    el.style.transition = "";
    el.style.height = `${next}px`; // now animates from the old height to the real one
  }, [value]);

  function submit() {
    const idea = value.trim();
    if (idea) onSubmit(idea);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="idea-input">
      <p className="idea-input__value-line">Find the core. Build the MVP.</p>
      <form className="idea-input__form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="idea-input__field mono"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to build?"
          rows={1}
          autoFocus
        />
        <button
          type="submit"
          className="idea-input__submit"
          data-visible={value.trim().length > 0}
          aria-label="Start the run"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      <ul className="idea-input__examples">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button type="button" onClick={() => setValue(example)}>
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

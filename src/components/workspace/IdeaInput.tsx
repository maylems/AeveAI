import { useState, type FormEvent } from "react";

const EXAMPLES = [
  "A project management tool for small teams",
  "A Notion-like workspace for students",
  "An expense tracker for freelancers",
];

export function IdeaInput({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const idea = value.trim();
    if (idea) onSubmit(idea);
  }

  return (
    <div className="idea-input">
      <p className="idea-input__value-line">Find the core. Build the MVP.</p>
      <form onSubmit={handleSubmit}>
        <input
          className="idea-input__field mono"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="What do you want to build?"
          autoFocus
        />
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

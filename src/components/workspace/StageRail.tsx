import { STAGES, STAGE_LABELS, type StageId } from "@/lib/pipeline/stages";

export function StageRail({ current }: { current: StageId }) {
  const currentIndex = STAGES.indexOf(current);

  return (
    <ol className="stage-rail">
      {STAGES.map((stage, index) => (
        <li
          key={stage}
          className="stage-rail__item"
          data-state={
            index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming"
          }
        >
          {STAGE_LABELS[stage]}
        </li>
      ))}
    </ol>
  );
}

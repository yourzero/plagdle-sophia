import { Lightbulb } from "lucide-react";
import type { Disease } from "../game/types";

interface Props {
  answer: Disease;
  hint1: boolean;
  hint2: boolean;
}

export default function Hints({ answer, hint1, hint2 }: Props) {
  if (!hint1 && !hint2) return null;
  return (
    <div className="hints">
      {hint1 && (
        <div className="hint">
          <span className="hint-badge"><Lightbulb aria-hidden /> 1</span>
          <span>{answer.smallHint}</span>
        </div>
      )}
      {hint2 && (
        <div className="hint second">
          <span className="hint-badge"><Lightbulb aria-hidden /> 2</span>
          <span>{answer.bigHint}</span>
        </div>
      )}
    </div>
  );
}

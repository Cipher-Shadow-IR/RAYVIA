import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, title, description, action, align = "left" }) {
  return (
    <Reveal
      className={`mb-10 flex flex-col gap-4 ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className={align === "center" ? "mx-auto" : ""}>
          {eyebrow && <div className="label-caps mb-3 text-electric">{eyebrow}</div>}
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
          {description && (
            <p className={`mt-3 max-w-xl text-base leading-relaxed text-ink-soft ${align === "center" ? "mx-auto" : ""}`}>
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Reveal>
  );
}
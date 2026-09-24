import { cn } from '@/lib/utils'

type SkillArrayProps = {
  skills: readonly string[]
  className?: string
}

/**
 * Skills as a C string array, each element a highlighted badge:
 *
 *     char *keahlian[] = { "pointer", "manajemen memori", "gdb" };
 *
 * The declaration and every quote, comma and brace are hidden from assistive
 * tech, which hears a plain list named "Keahlian".
 */
export function SkillArray({ skills, className }: SkillArrayProps) {
  return (
    <div className={cn('font-mono text-sm leading-7', className)}>
      <p aria-hidden>
        <span className="text-syn-type">char</span> <span className="text-syn-punct">*</span>
        <span className="text-syn-ident">keahlian</span>
        <span className="text-syn-punct">[] = {'{'}</span>
      </p>

      <ul aria-label="Keahlian" className="flex flex-wrap items-center gap-x-1 gap-y-2 py-1 pl-4">
        {skills.map((skill, index) => (
          <li key={skill} className="flex items-center">
            <span className="inline-flex items-center border-2 border-line-soft bg-code-bg px-2 py-0.5 text-[13px] text-syn-string">
              <span aria-hidden>&quot;</span>
              {skill}
              <span aria-hidden>&quot;</span>
            </span>
            {index < skills.length - 1 ? (
              <span aria-hidden className="text-syn-punct">
                ,
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p aria-hidden className="text-syn-punct">
        {'};'}
      </p>
    </div>
  )
}

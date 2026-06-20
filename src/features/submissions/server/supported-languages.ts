import { Language } from "@/generated/prisma/enums";
import { getCDriver } from "./c-driver";
import { buildCppDriver } from "./cpp-driver";

/**
 * Languages that judge generically (reflection / interpreted) and work for any
 * signature.
 */
const ALWAYS: Language[] = [
  Language.PYTHON3,
  Language.PYTHON,
  Language.JAVASCRIPT,
  Language.TYPESCRIPT,
  Language.JAVA,
  Language.CSHARP,
];

/**
 * Which languages can actually run a problem with the given signature. C/C++
 * need a driver for the shape; Rust still only supports the placeholder shape.
 * Used to gate the editor's language picker so users never see a false 0/10.
 */
export function getSupportedLanguages(
  inputSignature: string | null,
  outputSignature: string | null,
): Language[] {
  const inSig = inputSignature ?? "";
  const outSig = outputSignature ?? "";
  const langs = [...ALWAYS];

  if (getCDriver(inSig, outSig)) langs.push(Language.C);
  if (buildCppDriver(inSig, outSig, "f")) langs.push(Language.CPP);
  // Rust driver is still the (int[],int)->int[] placeholder only.
  if (inSig === "int[],int" && outSig === "int[]") langs.push(Language.RUST);

  return langs;
}

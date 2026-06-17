"use client";

import { useDebugValue, useEffect, useRef, useState } from "react";
import Monokai from "../../../../../node_modules/monaco-themes/themes/Monokai.json";
import dynamic from "next/dynamic";
import { type Monaco } from "@monaco-editor/react";
import { languages, type editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProblemWorkspace } from "../../hooks/use-problems";
import { Language } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SubmissionOverlay from "@/components/customs/SubmissionOverlay";
import { useUserCodeDraft } from "@/features/drafts/hooks/use-code-draft";
import { ResultDialog } from "@/features/submissions/components/result-dialog";
import { Submission } from "@/generated/prisma/client";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function cssVarToRGB(name: string) {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "#000000";

    ctx.fillStyle = value;        // browser converts color
    return ctx.fillStyle;         // returns rgb/hex
}

function cssVarToHex(name: string) {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

    // shadcn stores values as "0 0% 100%" so we need to wrap it
    const normalized = value.startsWith("#") || value.startsWith("rgb")
        ? value
        : `hsl(${value})`;

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";

    ctx.fillStyle = normalized;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

const DEFAULT_TEMPLATE = `// Write your solution here\n`;

const LANGUAGE_MAP: Record<Language, string> = {
    CPP: "cpp",
    JAVA: "java",
    PYTHON: "python",
    PYTHON3: "python",
    JAVASCRIPT: "javascript",
    TYPESCRIPT: "typescript",
    GO: "go",
    RUST: "rust",
    C: "c",
    CSHARP: "csharp",
    MYSQL: "sql",
    MSSQL: "sql",
    ORACLESQL: "sql",
    POSTGRESQL: "sql",
    PYTHONDATA: "python",
};

export const EditorPanel = ({ slug }: { slug: string }) => {
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(true);
    const monacoRef = useRef<Monaco | null>(null);
    const { theme } = useTheme();

    const { data } = useProblemWorkspace(slug);

    const snippets = data?.snippets ?? [];
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(
        snippets[0]?.language ?? "PYTHON3"
    );

    const snippet = snippets.find(s => s.language == selectedLanguage);

    const userCodeDraft = useUserCodeDraft(data?.id ?? "", selectedLanguage);

    const [code, setCode] = useState(snippet?.template || DEFAULT_TEMPLATE);

    const trpc = useTRPC();
    const submissionsMutate = useMutation(trpc.submissions.submit.mutationOptions(
        {
            onSuccess(data, variables, onMutateResult, context) {
                // console.log(data);
                setIsResultDialogOpen(true);
            },
            onError() {
                setIsResultDialogOpen(true);
            }
        }
    ));

    const draftMutate = useMutation(trpc.userCodeDrafts.create.mutationOptions(
        {
            onSuccess(data) {
                // console.log(data);
            }
        }
    ));


    const handleSubmit = async (
        problemSlug: string,
        sourceCode: string,
        language: string,
        isHidden: false,
    ) => {

        draftMutate.mutate({
            problemId: data?.id ?? "",
            language: selectedLanguage,
            code: code,
        })

        await submissionsMutate.mutateAsync({
            problemSlug,
            sourceCode,
            language,
            isHidden: true,
        })
    }


    const handleEditorMount = (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        monacoRef.current = monaco;
        const bg = cssVarToHex("--background");
        const line = cssVarToHex("--secondary-foreground");
        const lineBg = cssVarToHex("--background");

        monaco.editor.defineTheme("monokai", {
            ...Monokai,
            colors: {
                ...Monokai.colors,
                "editor.background": bg,
                // "editorLineNumber.foreground": line,
                "editor.lineHighlightBackground": lineBg
            }
        });
        if (theme === "dark") {
            monaco.editor.setTheme("monokai");
        } else {
            monaco.editor.setTheme("vs");
        }
    }

    const handleLanguageChange = (lang: Language) => {
        draftMutate.mutate({ problemId: data?.id || "", language: selectedLanguage, code });
        setSelectedLanguage(lang);
    }

    useEffect(() => {
        const draft = userCodeDraft.data?.code;
        const template = snippets.find(s => s.language === selectedLanguage)?.template ?? DEFAULT_TEMPLATE;
        setCode(draft ?? template);

    }, [userCodeDraft.data, selectedLanguage]);

    useEffect(() => {
        if (!monacoRef.current) return;
        const monaco = monacoRef.current;

        if (theme === "dark") {
            monaco.editor.setTheme("monokai");
        } else {
            monaco.editor.setTheme("vs");
        }
    }, [theme])

    if (!data) return null;

    if (submissionsMutate.isPending) {
        return <SubmissionOverlay visible={true} onDone={() => submissionsMutate.isSuccess} color="#ffffff" />
    }

    return (

        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <Select value={selectedLanguage} onValueChange={(val) => handleLanguageChange(val as Language)}>
                    <SelectTrigger className="w-36 h-7 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {snippets.map(s => (
                            <SelectItem key={s.language} value={s.language} className="text-xs">
                                {s.language}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={() => handleSubmit(slug, code, selectedLanguage, false)}
                >
                    Submit
                </Button>
            </div>
            <div className=" flex border-b overflow-hidden">
                <Editor
                    height="100vh"
                    defaultLanguage="c"
                    value={code}
                    defaultValue={code}
                    language={LANGUAGE_MAP[selectedLanguage] ?? "plaintext"}
                    onChange={(value) => setCode(value ?? "")}
                    onMount={handleEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        fontFamily: "Geist Mono",
                        fontWeight: "500",
                        wordWrap: "on",
                        cursorBlinking: "smooth",
                        cursorStyle: "line"
                    }}
                />
                {isResultDialogOpen && (
                    <ResultDialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen} data={submissionsMutate.data}/>
                )}

            </div>

        </div>
    );
};
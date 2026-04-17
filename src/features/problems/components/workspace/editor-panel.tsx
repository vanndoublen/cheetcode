"use client";

import { useEffect, useRef, useState } from "react";
import Monokai from "../../../../../node_modules/monaco-themes/themes/Monokai.json";
import dynamic from "next/dynamic";
import { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProblemWorkspace } from "../../hooks/use-problems";
import { Language } from "@/generated/prisma/enums";

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

export const EditorPanel = ({slug}: {slug: string}) => {
    const [code, setCode] = useState(DEFAULT_TEMPLATE);
    const monacoRef = useRef<Monaco | null>(null);
    const { theme } = useTheme();

    const { data } = useProblemWorkspace(slug);
    const snippets = data?.snippets ?? [];

    const [selectedLanguage, setSelectedLanguage] = useState<Language>(
        snippets[0]?.language ?? "PYTHON3"
    );


    const handleEditorMount = (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        monacoRef.current = monaco;
        const bg = cssVarToHex("--background");
        const line = cssVarToHex("--secondary-foreground");
        const lineBg = cssVarToHex("--muted")
        console.log(bg);

        monaco.editor.defineTheme("monokai", {
            ...Monokai,
            colors: {
                ...Monokai.colors,
                "editor.background": bg,
                "editorLineNumber.foreground": line,
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
        setSelectedLanguage(lang);
        const snippet = snippets.find(s => s.language == lang); 
        setCode(snippet?.template ?? "");   
        
    }

    useEffect(() => {
        if (!monacoRef.current) return;
        const monaco = monacoRef.current;

        if (theme === "dark") {
            monaco.editor.setTheme("monokai");
        } else {
            monaco.editor.setTheme("vs");
        }
    }, [theme])

    return (

        <div className="flex flex-col h-full">
            <div className="flex items-center px-3 py-2 border-b">
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
            </div>
            <div className=" flex-1 border-b  overflow-hidden">
            <Editor
                height="50vh"
                defaultLanguage="c"
                value={code}
                defaultValue={code}
                language={LANGUAGE_MAP[selectedLanguage] ?? "plaintext"}
                onChange={(value) => setCode(value ?? "")}
                onMount={handleEditorMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "Geist Mono",
                    fontWeight: "500",
                    wordWrap: "on",
                    cursorBlinking: "smooth",
                    cursorStyle: "line"
                }}
            />
        </div>
        </div>
    );
};
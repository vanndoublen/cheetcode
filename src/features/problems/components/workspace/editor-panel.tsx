"use client";

import { useEffect, useRef, useState } from "react";
import Monokai from "../../../../../node_modules/monaco-themes/themes/Monokai.json";
import dynamic from "next/dynamic";
import { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";

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

export const EditorPanel = () => {
    const [code, setCode] = useState("");
    const monacoRef = useRef<Monaco | null>(null);
    const { theme } = useTheme();


    const handleEditorMount = (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        monacoRef.current = monaco;
        const bg = cssVarToRGB("--background");
        const line = cssVarToRGB("--secondary-foreground");
        const lineBg = cssVarToRGB("--muted")
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
        monaco.editor.setTheme("monokai");
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
        <div className="border-b  overflow-hidden">
            <Editor
                height="50vh"
                defaultLanguage="c"
                theme="monokai"
                defaultValue={code}
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
    );
};
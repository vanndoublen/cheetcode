"use client";

import React from "react";
import { Allotment } from "allotment";

import { useParams } from "next/navigation";
import { EditorPanel } from "@/features/problems/components/workspace/editor-panel";

import "allotment/dist/style.css"
import { InfoPanel } from "@/features/problems/components/workspace/info-panel";


const MIN_SIDEBAR_WIDTH = 500;
const MAX_SIDEBAR_WIDTH = 1000;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 700;
const DEFAULT_MAIN_SIZE = 1000;


const Layout = ({ children }: { children: React.ReactNode }) => {
    const { problemSlug } = useParams<{ problemSlug: string }>();

    return (

        < div className="w-full h-[calc(100dvh-3.5rem)]" >
            <Allotment
                defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
            >
                <Allotment.Pane
                    snap
                    minSize={MIN_SIDEBAR_WIDTH}
                    maxSize={MAX_SIDEBAR_WIDTH}
                    preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
                >
                    <InfoPanel children={children}/>
                </Allotment.Pane>
                <Allotment.Pane>
                    <EditorPanel slug={problemSlug} />
                </Allotment.Pane>
            </Allotment>
        </div >
    )
}

export default Layout; 
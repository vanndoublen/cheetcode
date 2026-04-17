"use client";
import { InfoPanel } from "./info-panel";
import { EditorPanel } from "./editor-panel";
import { Allotment } from "allotment";
import "allotment/dist/style.css"


const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 1000;
const DEFAULT_MAIN_SIZE = 1000;


export const ProblemWorkspaceView = ({ slug }: { slug: string }) => {
    return (
        <div className="w-full h-[calc(100dvh-3.5rem)]">
            <Allotment
                defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
            >
                <Allotment.Pane
                    snap
                    minSize={MIN_SIDEBAR_WIDTH}
                    maxSize={MAX_SIDEBAR_WIDTH}
                    preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
                >
                    <InfoPanel slug={slug} />
                </Allotment.Pane>

                <Allotment.Pane>
                    <EditorPanel slug={slug}/>
                </Allotment.Pane>
            </Allotment>
        </div>
    )
}
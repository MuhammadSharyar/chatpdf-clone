import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./sidebar";
import PdfPreview from "./pdf-preview";
import CurrentChat from "./current-chat";

export default function ChatsPage() {
  return (
    <main>
      <div className="hidden md:block">
        <ResizablePanelGroup direction="horizontal" className="max-screen">
          <ResizablePanel
            defaultSize={20}
            minSize={10}
            maxSize={20}
            className="h-[90vh]"
          >
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} className="h-[90vh]">
            <PdfPreview />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className="h-[90vh]"
          >
            <CurrentChat />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="md:hidden">
        <Sidebar />
        <CurrentChat />
      </div>
    </main>
  );
}

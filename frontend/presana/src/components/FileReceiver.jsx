import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";

export default function FileReceiver({ socket }) {
  const { showToast } = useToast();
  const [fileMeta, setFileMeta] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("file-meta", (meta) => {
      console.log("📥 Receiving file:", meta.name);
      setFileMeta(meta);
      setChunks([]);
      setIsReceiving(true);
    });

    socket.on("file-chunk", (chunk) => {
      setChunks((prev) => [...prev, chunk]);
    });

    socket.on("file-complete", () => {
      console.log("✅ File transfer complete");
      
      // Reconstruct file from chunks WITH CORRECT MIME TYPE to preserve format
      const blob = new Blob(chunks, { type: fileMeta.type });
      const url = URL.createObjectURL(blob);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = fileMeta.name;
      a.click();
      URL.revokeObjectURL(url);

      // Show notification
      showToast(`File "${fileMeta.name}" received successfully!`, "success");

      // Reset state
      setFileMeta(null);
      setChunks([]);
      setIsReceiving(false);
    });

    return () => {
      socket.off("file-meta");
      socket.off("file-chunk");
      socket.off("file-complete");
    };
  }, [socket, chunks, fileMeta]);

  // Return null - toast handles notifications now
  return null;
}

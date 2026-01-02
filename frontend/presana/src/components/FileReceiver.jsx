import { useEffect, useState, useRef } from "react";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

export default function FileReceiver({ socket }) {
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileMeta, setFileMeta] = useState(null);
  
  // Completed file storage for re-download
  const [completedFile, setCompletedFile] = useState(null);
  const [showRedownload, setShowRedownload] = useState(false);
  
  // Use ref to avoid stale closure issues with chunks
  const chunksRef = useRef([]);
  const currentFileMetaRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleFileMeta = (meta) => {
      console.log("📥 Incoming file transfer:", meta);
      // Show confirmation dialog instead of auto-accepting
      setPendingTransfer(meta);
      setShowConfirmation(true);
    };

    const handleFileChunk = (chunk) => {
      // Only collect chunks if we're actively receiving a file
      if (currentFileMetaRef.current) {
        chunksRef.current.push(chunk);
        console.log(`📦 Received chunk ${chunksRef.current.length}`);
      }
    };

    const handleFileComplete = () => {
      console.log("✅ File transfer complete");
      
      const meta = currentFileMetaRef.current;
      const receivedChunks = chunksRef.current;

      if (!meta || receivedChunks.length === 0) {
        console.error("❌ Error: No file metadata or chunks");
        showToast("File transfer error", "error");
        return;
      }
      
      // Reconstruct file from chunks WITH CORRECT MIME TYPE to preserve format
      const blob = new Blob(receivedChunks, { type: meta.type });
      
      // Store completed file for re-download capability
      const fileData = {
        blob: blob,
        name: meta.name,
        size: meta.size,
        type: meta.type,
        sender: meta.sender,
        timestamp: new Date().toISOString()
      };
      setCompletedFile(fileData);
      
      // Try to download
      try {
        downloadFile(fileData);
        showToast(`File "${meta.name}" received successfully!`, "success");
        
        // Show re-download option for 60 seconds
        setShowRedownload(true);
        setTimeout(() => {
          setShowRedownload(false);
          setCompletedFile(null);
        }, 60000); // 60 seconds
        
      } catch (error) {
        console.error("Download failed:", error);
        showToast("Download failed! Use the re-download button.", "error");
        setShowRedownload(true);
      }

      // Reset state for next file
      currentFileMetaRef.current = null;
      chunksRef.current = [];
      setFileMeta(null);
    };

    socket.on("file-meta", handleFileMeta);
    socket.on("file-chunk", handleFileChunk);
    socket.on("file-complete", handleFileComplete);

    return () => {
      socket.off("file-meta", handleFileMeta);
      socket.off("file-chunk", handleFileChunk);
      socket.off("file-complete", handleFileComplete);
    };
  }, [socket, showToast]);

  const downloadFile = (fileData) => {
    const url = URL.createObjectURL(fileData.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileData.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRedownload = () => {
    if (completedFile) {
      try {
        downloadFile(completedFile);
        showToast(`Re-downloading "${completedFile.name}"`, "success");
      } catch (error) {
        showToast("Re-download failed. Please try again.", "error");
      }
    }
  };

  const handleDismissRedownload = () => {
    setShowRedownload(false);
    setCompletedFile(null);
  };

  const handleAccept = () => {
    console.log("✅ Transfer accepted");
    
    // Clear any previous chunks and set new file metadata
    chunksRef.current = [];
    currentFileMetaRef.current = pendingTransfer;
    setFileMeta(pendingTransfer);
    
    setShowConfirmation(false);
    setPendingTransfer(null);
    showToast(`Accepting file from ${pendingTransfer.sender?.name || 'Unknown User'}`, "info");
  };

  const handleReject = () => {
    console.log("❌ Transfer rejected");
    showToast(`File transfer rejected`, "info");
    setShowConfirmation(false);
    setPendingTransfer(null);
    
    // Make sure chunks aren't collected for rejected transfer
    chunksRef.current = [];
    currentFileMetaRef.current = null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      {/* Confirmation Modal */}
      {showConfirmation && pendingTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-5xl sm:text-6xl mb-3">📥</div>
              <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                Incoming File Transfer
              </h2>
            </div>

            {/* Sender Info */}
            <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-indigo-900/30 border-2 border-indigo-700' : 'bg-indigo-50 border-2 border-indigo-200'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                📤 From:
              </p>
              <p className={`text-base sm:text-lg font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                {pendingTransfer.sender?.name || 'Unknown User'}
              </p>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                User ID: {pendingTransfer.sender?.userId || pendingTransfer.sender?._id?.substring(0, 8) || 'N/A'}
              </p>
            </div>

            {/* File Info */}
            <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                📄 File Details:
              </p>
              <p className={`text-base sm:text-lg font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {pendingTransfer.name}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Size: {formatFileSize(pendingTransfer.size)}
                </p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Type: {pendingTransfer.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReject}
                className={`flex-1 px-6 py-3 sm:py-3 rounded-xl font-semibold transition-all min-h-[48px] ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                ❌ Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-3 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-semibold transition-all min-h-[48px]"
              >
                ✅ Accept & Download
              </button>
            </div>

            {/* Security Note */}
            <p className={`text-xs text-center mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Only accept files from trusted senders
            </p>
          </div>
        </div>
      )}

      {/* Re-download Toast/Notification */}
      {showRedownload && completedFile && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fadeIn">
          <div className={`rounded-xl shadow-2xl p-4 border-2 ${isDark ? 'bg-gray-800 border-green-600' : 'bg-white border-green-500'}`}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">💾</div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  File Ready
                </p>
                <p className={`text-xs truncate mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {completedFile.name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRedownload}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition min-h-[36px]"
                  >
                    📥 Download Again
                  </button>
                  <button
                    onClick={handleDismissRedownload}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition min-h-[36px] ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    ✖
                  </button>
                </div>
              </div>
            </div>
            <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Available for 60 seconds
            </div>
          </div>
        </div>
      )}
    </>
  );
}

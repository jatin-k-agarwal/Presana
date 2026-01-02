import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

export default function FileReceiver({ socket }) {
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileMeta, setFileMeta] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("file-meta", (meta) => {
      console.log("📥 Incoming file transfer:", meta);
      // Show confirmation dialog instead of auto-accepting
      setPendingTransfer(meta);
      setShowConfirmation(true);
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
  }, [socket, chunks, fileMeta, showToast]);

  const handleAccept = () => {
    console.log("✅ Transfer accepted");
    setFileMeta(pendingTransfer);
    setChunks([]);
    setIsReceiving(true);
    setShowConfirmation(false);
    setPendingTransfer(null);
    showToast(`Accepting file from ${pendingTransfer.sender?.name || 'Unknown User'}`, "info");
  };

  const handleReject = () => {
    console.log("❌ Transfer rejected");
    showToast(`File transfer rejected`, "info");
    setShowConfirmation(false);
    setPendingTransfer(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Confirmation Modal
  if (showConfirmation && pendingTransfer) {
    return (
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
    );
  }

  // Return null when not showing confirmation
  return null;
}

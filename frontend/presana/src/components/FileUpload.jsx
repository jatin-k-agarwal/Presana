import { useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import ProgressBar from "./ProgressBar";

export default function FileUpload({ selectedFiles, onFilesSelect, selectedUser, onSend, progress, isSending }) {
  const fileInputRef = useRef(null);
  const { isDark } = useTheme();

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelect([...selectedFiles, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFilesSelect([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <div className={`rounded-3xl shadow-lg p-6 transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        <span className="text-2xl">📤</span>
        Send Files
      </h2>

      {/* Selected User Info */}
      {selectedUser ? (
        <div className={`border-2 rounded-xl p-3 mb-4 ${isDark ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
          <p className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
            📍 Sending to: <span className="font-semibold">User {selectedUser.substring(0, 8)}...</span>
          </p>
        </div>
      ) : (
        <div className={`border-2 rounded-xl p-3 mb-4 ${isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
            ⚠️ Please select a user from the left to send files
          </p>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        onClick={() => !isSending && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all
          ${isSending ? 'cursor-not-allowed opacity-50' : isDark ? 'border-gray-600 hover:border-indigo-500 hover:bg-gray-700/50 cursor-pointer' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isSending}
        />

        <div className="text-6xl mb-3">📦</div>
        <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Drop your files here
        </p>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          or click to browse (multiple files supported)
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Selected Files ({selectedFiles.length})
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total: {formatFileSize(getTotalSize())}
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between border-2 rounded-xl p-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{file.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!isSending && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm ml-2 px-2"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isSending && <ProgressBar progress={progress} />}

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={!selectedUser || selectedFiles.length === 0 || isSending}
        className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all
          ${
            selectedUser && selectedFiles.length > 0 && !isSending
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : isDark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        {isSending 
          ? "🔄 Sending..." 
          : selectedUser && selectedFiles.length > 0 
            ? `🚀 Send ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` 
            : "Select User & Files to Send"}
      </button>

      {/* Info */}
      <div className={`mt-6 border-2 rounded-xl p-4 ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          💡 <span className="font-semibold">Tip:</span> You can select multiple files at once! Large files are sent in chunks (512KB) with real-time progress tracking.
        </p>
      </div>
    </div>
  );
}

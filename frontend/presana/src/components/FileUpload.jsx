import { useRef } from "react";
import ProgressBar from "./ProgressBar";

export default function FileUpload({ selectedFile, onFileSelect, selectedUser, onSend, progress, isSending }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📤</span>
        Send File
      </h2>

      {/* Selected User Info */}
      {selectedUser ? (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-indigo-600">
            📍 Sending to: <span className="font-semibold">User {selectedUser.substring(0, 8)}...</span>
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-yellow-700">
            ⚠️ Please select a user from the left to send files
          </p>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        onClick={() => !isSending && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-4 border-dashed border-gray-300 rounded-3xl p-12 text-center
          ${isSending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-indigo-500 hover:bg-indigo-50'} transition-all`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isSending}
        />

        {selectedFile ? (
          <div>
            <div className="text-6xl mb-3">📄</div>
            <p className="font-semibold text-lg text-gray-800">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(selectedFile.size)}
            </p>
            {!isSending && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-4 text-red-500 hover:text-red-700 text-sm"
              >
                ✖ Remove
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-3">📦</div>
            <p className="text-lg font-semibold text-gray-700">
              Drop your file here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isSending && <ProgressBar progress={progress} />}

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={!selectedUser || !selectedFile || isSending}
        className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all
          ${
            selectedUser && selectedFile && !isSending
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        {isSending 
          ? "🔄 Sending..." 
          : selectedUser && selectedFile 
            ? "🚀 Send File" 
            : "Select User & File to Send"}
      </button>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 <span className="font-semibold">Tip:</span> Large files are sent in chunks (64KB) with real-time progress tracking!
        </p>
      </div>
    </div>
  );
}

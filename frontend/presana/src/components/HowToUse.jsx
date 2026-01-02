import { useTheme } from "../context/ThemeContext";

export default function HowToUse() {
  const { isDark } = useTheme();
  
  const steps = [
    {
      number: "1",
      title: "Select User",
      description: "Choose an online user from the left panel to send files to. You can also search for users by their User ID.",
      icon: "👥"
    },
    {
      number: "2",
      title: "Select Your Files",
      description: "Click on the drop zone or drag and drop files directly. You can select multiple files at once for batch transfer.",
      icon: "📁"
    },
    {
      number: "3",
      title: "Send & Track",
      description: "Click Send to start the real-time transfer. Watch the progress bar for live upload status across all files! 🚀",
      icon: "📤"
    }
  ];

  const features = [
    {
      icon: "⚡",
      title: "Real-Time Transfer",
      description: "Direct peer-to-peer file transfer with instant delivery when both users are online."
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Files are transferred directly between users using secure WebSocket connections."
    },
    {
      icon: "📊",
      title: "Multiple Files",
      description: "Send multiple files at once with a combined progress tracker showing overall transfer status."
    },
    {
      icon: "🚀",
      title: "High-Speed Transfer",
      description: "Optimized 512KB chunks ensure fast transfers, up to 8-10x faster than standard methods."
    },
    {
      icon: "📱",
      title: "Any Device",
      description: "Send files from any device - smartphone, tablet, or computer using just a web browser."
    },
    {
      icon: "📜",
      title: "Transfer History",
      description: "Track all your sent and received files with complete transfer history and timestamps."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Title Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-3">How to Send Files with Prēṣaṇa?</h2>
        <p className="text-indigo-100 text-lg">
          Fast, secure, and real-time file transfer in just 3 simple steps!
        </p>
      </div>

      {/* Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`rounded-2xl p-6 shadow-lg border-2 hover:border-indigo-400 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                {step.number}
              </div>
              <span className="text-4xl">{step.icon}</span>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {step.title}
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Why Choose Section */}
      <div className={`rounded-3xl p-8 shadow-lg transition-colors ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          Why Choose Prēṣaṇa?
        </h3>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          The simplest, fastest and most secure way to transfer files in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border ${isDark ? 'bg-gradient-to-br from-gray-700 to-indigo-900/30 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-indigo-50 border-gray-200'}`}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {feature.title}
              </h4>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className={`border-2 rounded-2xl p-6 ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">💡</span>
          <div>
            <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              Pro Tip: Send Files Instantly!
            </h4>
            <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              Prēṣaṇa uses real-time peer-to-peer connections, meaning your files are delivered 
              instantly when both you and the recipient are online. No cloud storage, no waiting - 
              just direct, secure transfers at maximum speed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

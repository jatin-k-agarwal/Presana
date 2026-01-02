import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  const features = [
    { name: "Send Files in Real-time", path: "/dashboard" },
    { name: "Multiple File Transfer", path: "/dashboard" },
    { name: "Transfer History", path: "/history" },
    { name: "Search Users", path: "/search" },
  ];

  const resources = [
    { name: "How to Use", path: "/dashboard" },
    { name: "GitHub Repository", href: "https://github.com/jatin-k-agarwal/Presana", external: true },
  ];

  return (
    <footer className={`mt-auto border-t transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section - Mobile Optimized */}
          <div className="text-center sm:text-left">
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              About Prēṣaṇa
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              A secure solution for real-time file transfer. Send and receive files (photos, videos, documents) instantly through peer-to-peer connections. Simple, fast, and secure.
            </p>
          </div>

          {/* Features Section - Mobile Optimized */}
          <div className="text-center sm:text-left">
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Features
            </h3>
            <ul className="space-y-2 sm:space-y-2">
              {features.map((feature, index) => (
                <li key={index}>
                  <Link
                    to={feature.path}
                    className={`text-xs sm:text-sm hover:text-indigo-600 transition block py-1 ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600'}`}
                  >
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section - Mobile Optimized */}
          <div className="text-center sm:text-left">
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  {resource.external ? (
                    <a
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs sm:text-sm hover:text-indigo-600 transition block py-1 ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600'}`}
                    >
                      {resource.name} ↗
                    </a>
                  ) : (
                    <Link
                      to={resource.path}
                      className={`text-xs sm:text-sm hover:text-indigo-600 transition block py-1 ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600'}`}
                    >
                      {resource.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section - Mobile Optimized */}
          <div className="text-center sm:text-left">
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Legal
            </h3>
            <ul className="space-y-2 sm:space-y-2">
              <li>
                <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Terms of Use
                </span>
              </li>
              <li>
                <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Security
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Mobile Optimized */}
        <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Made with ❤️ for seamless file sharing
            </p>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentYear} © Prēṣaṇa — All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

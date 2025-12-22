export default function ProgressBar({ progress }) {
  return (
    <div className="w-full mt-4">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-center mt-2 font-semibold text-indigo-600">
        {progress}%
      </p>
    </div>
  );
}

function PitchCommentForm({ pitch, onCommentSubmit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: "rgb(0, 128, 0)" }}
      >
        Yorum Yap
      </h3>

      {/* Placeholder for comment form - will be implemented later */}
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <p>Yorum sistemi yakında aktif olacak</p>
      </div>
    </div>
  );
}

export default PitchCommentForm;

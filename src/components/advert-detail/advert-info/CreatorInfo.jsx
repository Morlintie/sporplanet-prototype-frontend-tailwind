import { useNavigate } from "react-router-dom";

// Helper function to get user initials for avatar fallback
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const cleanName = name.trim();
  if (!cleanName) return "?";

  const nameParts = cleanName.split(/[\s.]+/); // Split by space or dot
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return cleanName[0]?.toUpperCase() || "?";
};

function CreatorInfo({ advert, isCreator, isUserOnline }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">İlan Veren</span>
        {isCreator && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
            Siz
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative">
          {advert.createdBy?.profilePicture?.url ? (
            <img
              src={advert.createdBy.profilePicture.url}
              alt={advert.createdBy?.name || "Kullanıcı"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium ring-2 ring-blue-100 ${
              advert.createdBy?.profilePicture?.url ? "hidden" : "flex"
            }`}
          >
            {getInitials(advert.createdBy?.name)}
          </div>
          {/* Online indicator - show only if user is online */}
          {isUserOnline && isUserOnline(advert.createdBy?._id) && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1">
          <button
            onClick={() => {
              if (advert.createdBy?._id) {
                window.scrollTo(0, 0);
                navigate(`/profile?userId=${advert.createdBy._id}`);
              }
            }}
            className="font-medium text-gray-900 hover:text-green-600 text-sm transition-colors cursor-pointer text-left"
          >
            {advert.createdBy?.name || "İsimsiz Kullanıcı"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatorInfo;


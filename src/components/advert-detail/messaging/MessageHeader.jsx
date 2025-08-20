function MessageHeader({ advert }) {
  return (
    <div
      className="text-white py-3 px-4 sticky top-0 z-10 shadow-lg"
      style={{
        backgroundImage: "linear-gradient(135deg, #065f46, #10b981)",
      }}
    >
      <div className="text-left">
        <h2 className="text-lg font-bold leading-tight mb-1">
          {advert?.name || "İlan Sohbeti"}
        </h2>
      </div>
    </div>
  );
}

export default MessageHeader;


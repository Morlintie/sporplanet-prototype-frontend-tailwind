function MessageHeader({ advert }) {
  return (
    <div
      className="text-white py-4 px-4 sticky top-0 z-10 shadow-xl border-b-2 border-green-300"
      style={{
        background: "linear-gradient(135deg, #064e3b, #059669)",
        backdropFilter: "blur(10px)"
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


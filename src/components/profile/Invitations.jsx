import { useState } from "react";

function Invitations({ user }) {
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      matchTitle: "Kadıköy Sabah Maçı",
      sender: "Mehmet Kaya",
      date: "2025-01-25",
      time: "09:00",
      location: "Kartal City",
      status: "pending"
    },
    {
      id: 2,
      matchTitle: "Beşiktaş Akşam Maçı",
      sender: "Ali Yılmaz",
      date: "2025-01-26",
      time: "19:00",
      location: "Spor Plus",
      status: "accepted"
    },
    {
      id: 3,
      matchTitle: "Şişli Dostluk Maçı",
      sender: "Ahmet Demir",
      date: "2025-01-20",
      time: "15:00",
      location: "Dream Saha",
      status: "declined"
    }
  ]);

  const handleAccept = (id) => {
    setInvitations(invitations.map(inv => 
      inv.id === id ? { ...inv, status: "accepted" } : inv
    ));
  };

  const handleDecline = (id) => {
    setInvitations(invitations.map(inv => 
      inv.id === id ? { ...inv, status: "declined" } : inv
    ));
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "Beklemede", color: "bg-yellow-500 text-white" };
      case "accepted":
        return { text: "Kabul Edildi", color: "bg-green-500 text-white" };
      case "declined":
        return { text: "Reddedildi", color: "bg-red-500 text-white" };
      default:
        return { text: "Bilinmiyor", color: "bg-gray-400 text-white" };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Davetlerim</h1>
      
      <div className="space-y-6">
        {invitations.map((invitation) => {
          const statusInfo = getStatusInfo(invitation.status);
          return (
            <div key={invitation.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{invitation.matchTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gönderen: <span className="font-medium">{invitation.sender}</span>
                  </p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(invitation.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{invitation.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{invitation.location}</span>
                </div>
              </div>
              
              {invitation.status === "pending" && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors cursor-pointer"
                    tabIndex="0"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors cursor-pointer"
                    tabIndex="0"
                  >
                    Reddet
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {invitations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Davet Yok</h3>
          <p className="text-gray-600">
            Henüz hiç maç daveti almamışsınız. Maç ilanlarına katılarak davet alabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}

export default Invitations; 
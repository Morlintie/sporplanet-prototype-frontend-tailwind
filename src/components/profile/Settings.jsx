import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Settings({ user }) {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  
  // Default user object if user is undefined
  const defaultUser = {
    name: "",
    email: "",
    username: "",
    profilePicture: "",
    jerseyNumber: "",
    age: "",
    position: "",
    footPreference: "",
    description: "",
    phoneNumber: ""
  };

  const safeUser = user || defaultUser;

  const [formData, setFormData] = useState({
    username: safeUser.username || "",
    email: safeUser.email || "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    jerseyNumber: safeUser.jerseyNumber || "",
    age: safeUser.age || "",
    position: safeUser.position || "",
    footPreference: safeUser.footPreference || "",
    description: safeUser.description || "",
    phoneNumber: safeUser.phoneNumber || ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return ""; // Empty email is allowed
    
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return "Geçerli bir e-posta adresi giriniz";
    }
    
    return "";
  };

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if (!phone) return ""; // Empty phone is allowed
    
    // Remove all spaces, dashes, parentheses, and plus signs
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
      return "Telefon numarası sadece rakam içermelidir";
    }
    
    // Check Turkish phone number format
    // Turkish mobile: starts with 5 and has 10 digits (05XXXXXXXXX)
    // Or international format: starts with 90 and has 12 digits (905XXXXXXXXX)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('05')) {
      return ""; // Valid Turkish mobile
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('905')) {
      return ""; // Valid international Turkish mobile
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('5')) {
      return ""; // Valid Turkish mobile without 0
    } else {
      return "Geçerli bir Türk telefon numarası giriniz (örn: 05XXXXXXXXX)";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phoneNumber') {
      const error = validatePhoneNumber(value);
      setPhoneError(error);
    }
    
    // Special handling for email
    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    // Validate email before saving
    if (formData.email && emailError) {
      alert('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    // Validate phone number before saving
    if (formData.phoneNumber && phoneError) {
      alert('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    try {
      const response = await fetch('/api/v1/user/update', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          jerseyNumber: formData.jerseyNumber,
          age: formData.age,
          preferredPosition: formData.position,
          preferredFoot: formData.footPreference,
          description: formData.description,
          phoneNumber: formData.phoneNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        setIsEditing(false);
        alert('Profil bilgileri başarıyla güncellendi.');
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Yeni şifreler eşleşmiyor!");
      return;
    }

    try {
      const response = await fetch('/api/v1/user/change-password', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.password,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setIsChangingPassword(false);
        setFormData(prev => ({
          ...prev,
          password: "",
          newPassword: "",
          confirmPassword: ""
        }));
        alert('Şifre başarıyla değiştirildi.');
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Şifre değiştirilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploadingPhoto(true);
      // TODO: Upload photo to server
      console.log("Fotoğraf yükleniyor:", file.name);
      setTimeout(() => {
        setIsUploadingPhoto(false);
      }, 2000);
    }
  };

  // Backend mevki kodlarını Türkçe etiketlerle eşle
  const positions = [
    { value: "cb", label: "Stoper" },
    { value: "rb", label: "Sağ Bek" },
    { value: "lb", label: "Sol Bek" },
    { value: "rwb", label: "Sağ Kanat Bek" },
    { value: "lwb", label: "Sol Kanat Bek" },
    { value: "dm", label: "Ön Libero" },
    { value: "cm", label: "Merkez Orta Saha" },
    { value: "rw", label: "Sağ Kanat" },
    { value: "lw", label: "Sol Kanat" },
    { value: "st", label: "Forvet" },
    { value: "gk", label: "Kaleci" }
  ];

  const footPreferences = [
    { value: "right", label: "Sağ Ayak" },
    { value: "left", label: "Sol Ayak" },
    { value: "both", label: "Her İki Ayak" }
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tabs = [
    { id: "account", label: "Hesap Ayarları" },
    { id: "profile", label: "Kullanıcı Bilgilerim" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Ayarlar</h1>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === "account" && (
        <>
          {/* Profile Photo Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Fotoğrafı</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {safeUser.profilePicture ? (
                    <img 
                      src={safeUser.profilePicture} 
                      alt={safeUser.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                      {safeUser.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div>
                <label 
                  htmlFor="photo-upload" 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer inline-block"
                  tabIndex="0"
                >
                  Fotoğraf Değiştir
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG veya GIF formatında, maksimum 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
                tabIndex="0"
              >
                {isEditing ? "İptal" : "Düzenle"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jersey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma Numarası
                </label>
                <input
                  type="number"
                  name="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="1"
                  max="99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="16"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pozisyon
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Pozisyon Seçin</option>
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>

              {/* Foot Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ayak Tercihi
                </label>
                <select
                  name="footPreference"
                  value={formData.footPreference}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Ayak Tercihi Seçin</option>
                  {footPreferences.map(foot => (
                    <option key={foot.value} value={foot.value}>{foot.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                  tabIndex="0"
                >
                  Kaydet
                </button>
              </div>
            )}
          </div>



          {/* Account Actions Section - Logout Button */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
                tabIndex="0"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Çıkış Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Hesaptan Çıkış Yap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "profile" && (
        <>
          {/* User Information Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Bilgileri</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
                tabIndex="0"
              >
                {isEditing ? "İptal" : "Düzenle"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="ornek@email.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="05XXXXXXXXX"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Türk telefon numarası formatında giriniz (örn: 05XXXXXXXXX)
                </p>
              </div>

              {/* Description */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                  tabIndex="0"
                >
                  Kaydet
                </button>
              </div>
            )}
          </div>
           {/* Divider */}
        <hr className="border-gray-200 mb-8" />

          {/* Hesap Bilgileri Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Hesap Bilgileri
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </div>
              <div className="text-sm text-gray-600">Hesap Oluşturulma</div>
            </div>
            <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </div>
              <div className="text-sm text-gray-600">Son Güncelleme</div>
            </div>
          </div>
        </div>
         {/* Divider */}
         <hr className="border-gray-200 mb-8" />

          {/* Password Change Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Şifre Değiştir</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin. Güçlü bir şifre kullanmayı unutmayın.
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                tabIndex="0"
              >
                {isChangingPassword ? "İptal" : "Şifre Değiştir"}
              </button>
            </div>

            
            {isChangingPassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleChangePassword}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                    tabIndex="0"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Tehlikeli Bölge</h2>
                <p className="text-sm text-gray-500">
                  Bu işlem geri alınamaz ve tüm verileriniz silinir.
                </p>
              </div>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
                tabIndex="0"
              >
                Hesabı Sil
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Notification from "../shared/Notification";
import "../../styles/maintenance-popup.css";

function Settings({ user }) {
  const { logout, updateUser, checkAuth, getProfilePictureUrl } = useAuth();
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
    phoneNumber: "",
  };

  const safeUser = user || defaultUser;

  // Check if user is Google authenticated
  const isGoogleUser = Boolean(safeUser.googleId);

  const [formData, setFormData] = useState({
    username: safeUser.name || "",
    email: safeUser.email || "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    jerseyNumber: safeUser.jerseyNumber || "",
    age: safeUser.age || "",
    position: safeUser.preferredPosition || "",
    footPreference: safeUser.preferredFoot || "",
    description: safeUser.description || "",
    phoneNumber: safeUser.phoneNumber || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureBase64, setProfilePictureBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Password change states
  const [showPasswordChangePopup, setShowPasswordChangePopup] = useState(false);
  const [passwordChangeStep, setPasswordChangeStep] = useState(1); // 1: current password, 2: verification code, 3: new password
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [isChangingPasswordRequest, setIsChangingPasswordRequest] =
    useState(false);

  // Account deletion states
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState(1); // 1: verification code, 2: confirmation
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [currentPasswordForDelete, setCurrentPasswordForDelete] = useState("");
  const [deleteVerificationCode, setDeleteVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [deleteTimeLeft, setDeleteTimeLeft] = useState(300); // 5 minutes in seconds
  const [deleteVerificationSuccess, setDeleteVerificationSuccess] =
    useState(null);
  const [isDeletingAccountRequest, setIsDeletingAccountRequest] =
    useState(false);

  // Show notification helper function
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  // Close notification
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Error message translation function
  const translateMessage = (message) => {
    const errorMessages = {
      "You cannot update your profile to student":
        "Profilinizi öğrenci olarak güncelleyemezsiniz",
      "Your student status has been declined":
        "Öğrenci durumunuz reddedilmiştir",
      "Invalid image format": "Geçersiz resim formatı",
      "Image size cannot exceeds 100MB": "Resim boyutu 100MB'ı geçemez",
      "User couldn't found.": "Kullanıcı bulunamadı",
      "Goalkeepers cannot change their position.":
        "Kaleciler pozisyonlarını değiştiremez",
      "Validation error": "Doğrulama hatası",
      "Bad Request": "Geçersiz istek",
      Unauthorized: "Yetkisiz erişim",
      Forbidden: "Erişim yasak",
      "Not Found": "Bulunamadı",
      "Internal Server Error": "Sunucu hatası",
      "Network Error": "Bağlantı hatası",
      "Logout successful": "Başarıyla çıkış yapıldı",
      "User logged out": "Kullanıcı çıkış yaptı",
      "Logout failed": "Çıkış yapılamadı",
      "Session expired": "Oturum süresi doldu",
      "Please provide valid email": "Geçerli bir e-posta adresi sağlayın",
      "Please provide valid phone number":
        "Geçerli bir telefon numarası sağlayın",
      "Email already exists": "Bu e-posta adresi zaten kullanılıyor",
      "Phone number already exists": "Bu telefon numarası zaten kullanılıyor",
      "Please provide requested data.": "Lütfen gerekli bilgileri sağlayın",
      "Passwords are not match": "Mevcut şifreniz yanlış",
      "Your reset password email has been sent.":
        "Şifre sıfırlama e-postası gönderildi",
      "Code is invalid.": "Doğrulama kodu geçersiz",
      "Expiration date has been reached, please get contact with our customer service.":
        "Süre doldu, lütfen müşteri hizmetleri ile iletişime geçin",
      "Both passwords have to match with each other.":
        "Şifreler birbiriyle eşleşmelidir",
      "You are not authorized to perform that action.":
        "Bu işlemi gerçekleştirme yetkiniz yok",
      "New password cannot be same as old password.":
        "Yeni şifre eski şifre ile aynı olamaz",
      "Your password has been updated successfully.":
        "Şifreniz başarıyla güncellendi",
      "Your deletion email has been sent.": "Hesap silme e-postası gönderildi",
      "Account has been deleted successfully.": "Hesabınız başarıyla silindi",
      "You are not authorized to perform that action.":
        "Bu işlemi gerçekleştirme yetkiniz yok",
    };

    return errorMessages[message] || message || "Bir hata oluştu";
  };

  // Countdown timer effect for password verification
  useEffect(() => {
    if (showPasswordChangePopup && passwordChangeStep === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPasswordChangePopup, passwordChangeStep, timeLeft]);

  // Countdown timer effect for account deletion verification
  useEffect(() => {
    if (
      showDeleteAccountPopup &&
      deleteAccountStep === 1 &&
      deleteTimeLeft > 0
    ) {
      const timer = setInterval(() => {
        setDeleteTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showDeleteAccountPopup, deleteAccountStep, deleteTimeLeft]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return ""; // Empty email is allowed

    // Comprehensive email regex pattern (RFC 5322 compliant)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return "Geçerli bir e-posta adresi giriniz (örn: user@example.com)";
    }

    // Additional length check
    if (email.length > 254) {
      return "E-posta adresi çok uzun (maksimum 254 karakter)";
    }

    return "";
  };

  // Phone number validation function (International)
  const validatePhoneNumber = (phone) => {
    if (!phone) return ""; // Empty phone is allowed

    // Clean phone number - keep only digits and plus sign at the beginning
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Check for valid international format
    const internationalPattern = /^\+?[1-9]\d{6,14}$/;

    if (!internationalPattern.test(cleanPhone)) {
      return "Geçerli bir telefon numarası giriniz (örn: +90533123456 veya 05331234567)";
    }

    // Check length constraints (7-15 digits as per ITU-T E.164)
    const digitsOnly = cleanPhone.replace(/^\+/, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return "Telefon numarası 7-15 haneli olmalıdır";
    }

    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number
    if (name === "phoneNumber") {
      const error = validatePhoneNumber(value);
      setPhoneError(error);
    }

    // Special handling for email
    if (name === "email") {
      const error = validateEmail(value);
      setEmailError(error);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    // Only validate for "Hesap Ayarları" tab fields when saving account settings
    if (activeTab === "account") {
      setIsSaving(true);

      try {
        // Prepare request body for account settings (only profilePicture, jerseyNumber, age, preferredPosition, preferredFoot)
        const requestBody = {};

        // Add profilePicture if changed
        if (profilePictureBase64) {
          requestBody.profilePicture = profilePictureBase64;
        }

        // Add jerseyNumber if provided
        if (formData.jerseyNumber) {
          requestBody.jerseyNumber = parseInt(formData.jerseyNumber);
        }

        // Add age if provided
        if (formData.age) {
          requestBody.age = parseInt(formData.age);
        }

        // Add preferredPosition if selected
        if (formData.position) {
          requestBody.preferredPosition = formData.position;
        }

        // Add preferredFoot if selected
        if (formData.footPreference) {
          requestBody.preferredFoot = formData.footPreference;
        }

        const response = await fetch("/api/v1/user/updateSingle", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          updateUser(data.user);
          // Refresh user data from server to get latest information
          await checkAuth();
          setIsEditing(false);
          setProfilePicturePreview(null);
          setProfilePictureBase64(null);
          showNotificationMessage(
            "Hesap ayarları başarıyla güncellendi.",
            "success"
          );
        } else {
          const errorData = await response.json();
          const translatedMessage = translateMessage(
            errorData.msg ||
              errorData.message ||
              "Profil güncellenirken bir hata oluştu."
          );
          showNotificationMessage(translatedMessage, "error");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        showNotificationMessage(translateMessage("Network Error"), "error");
      } finally {
        setIsSaving(false);
      }
    } else if (activeTab === "profile") {
      // Validate email before saving for profile tab
      if (formData.email && emailError) {
        showNotificationMessage(
          "Lütfen geçerli bir e-posta adresi giriniz.",
          "error"
        );
        return;
      }

      // Validate phone number before saving for profile tab
      if (formData.phoneNumber && phoneError) {
        showNotificationMessage(
          "Lütfen geçerli bir telefon numarası giriniz.",
          "error"
        );
        return;
      }

      setIsSaving(true);

      try {
        // Prepare request body for profile information (name, email, description, phoneNumber, etc.)
        const requestBody = {};

        if (formData.username) {
          requestBody.name = formData.username;
        }

        if (formData.email) {
          requestBody.email = formData.email;
        }

        if (formData.description) {
          requestBody.description = formData.description;
        }

        if (formData.phoneNumber) {
          requestBody.phoneNumber = formData.phoneNumber;
        }

        const response = await fetch("/api/v1/user/updateSingle", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          updateUser(data.user);
          // Refresh user data from server to get latest information
          await checkAuth();
          setIsEditing(false);
          showNotificationMessage(
            "Kullanıcı bilgileri başarıyla güncellendi.",
            "success"
          );
        } else {
          const errorData = await response.json();
          const translatedMessage = translateMessage(
            errorData.msg ||
              errorData.message ||
              "Profil güncellenirken bir hata oluştu."
          );
          showNotificationMessage(translatedMessage, "error");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        showNotificationMessage(translateMessage("Network Error"), "error");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Start password change process - Step 1: Request password change
  const handleChangePassword = async () => {
    if (!currentPasswordForChange) {
      showNotificationMessage("Mevcut şifrenizi giriniz", "error");
      return;
    }

    setIsChangingPasswordRequest(true);

    try {
      const response = await fetch("/api/v1/user/requestPassword", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: currentPasswordForChange,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showNotificationMessage(translateMessage(data.msg), "success");
        // Show the verification popup for step 2
        setShowPasswordChangePopup(true);
        setPasswordChangeStep(2);
        setVerificationCode(["", "", "", "", "", ""]);
        setTimeLeft(300);
      } else {
        const errorData = await response.json();
        const translatedMessage = translateMessage(
          errorData.msg || "Şifre değiştirme isteği başarısız"
        );
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Password request error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsChangingPasswordRequest(false);
    }
  };

  // Step 2: Verify the code from email
  const handleVerifyPasswordCode = async () => {
    const codeString = verificationCode.join("");
    if (codeString.length !== 6) {
      showNotificationMessage(
        "Lütfen 6 haneli doğrulama kodunu girin",
        "error"
      );
      return;
    }

    if (timeLeft <= 0) {
      showNotificationMessage(
        "Doğrulama kodunuzun süresi doldu. Lütfen müşteri hizmetleri ile iletişime geçin.",
        "error"
      );
      return;
    }

    setIsChangingPasswordRequest(true);

    try {
      const response = await fetch("/api/v1/user/checkPassword", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeString,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationSuccess(data.success);
        setPasswordChangeStep(3);
        setNewPassword("");
        setConfirmNewPassword("");
        showNotificationMessage(
          "Doğrulama başarılı! Yeni şifrenizi belirleyin",
          "success"
        );
      } else {
        const errorData = await response.json();
        const translatedMessage = translateMessage(
          errorData.msg || "Doğrulama kodu geçersiz"
        );
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsChangingPasswordRequest(false);
    }
  };

  // Step 3: Set new password after verification
  const handleSetNewPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      showNotificationMessage("Tüm alanları doldurunuz", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showNotificationMessage("Şifreler eşleşmiyor", "error");
      return;
    }

    if (newPassword.length < 6) {
      showNotificationMessage("Şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    setIsChangingPasswordRequest(true);

    try {
      const response = await fetch("/api/v1/user/resetPassword", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: newPassword,
          newBackupPassword: confirmNewPassword,
          success: verificationSuccess,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showNotificationMessage(translateMessage(data.msg), "success");
        setShowPasswordChangePopup(false);
        setIsChangingPassword(false);
        setCurrentPasswordForChange("");
        setNewPassword("");
        setConfirmNewPassword("");
        setVerificationCode(["", "", "", "", "", ""]);
      } else {
        const errorData = await response.json();
        const translatedMessage = translateMessage(
          errorData.msg || "Şifre değiştirme başarısız"
        );
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsChangingPasswordRequest(false);
    }
  };

  // Handle verification code input
  const handleVerificationCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, ""); // Only allow digits
    if (digit.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = digit;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (digit && index < 5) {
        const nextInput = document.getElementById(
          `password-code-input-${index + 1}`
        );
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace in verification code
  const handleVerificationKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(
        `password-code-input-${index - 1}`
      );
      if (prevInput) {
        prevInput.focus();
        const newCode = [...verificationCode];
        newCode[index - 1] = "";
        setVerificationCode(newCode);
      }
    }
  };

  // Close password change popup
  const handleClosePasswordChangePopup = () => {
    setShowPasswordChangePopup(false);
    setPasswordChangeStep(2);
    setIsChangingPassword(false);
    setCurrentPasswordForChange("");
    setVerificationCode(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setTimeLeft(300);
    setVerificationSuccess(null);
  };

  // Account Deletion Functions

  // Start account deletion process - Step 1: Request deletion
  const handleDeleteAccount = async () => {
    // For Google users, skip password requirement
    if (!isGoogleUser && !currentPasswordForDelete) {
      showNotificationMessage("Mevcut şifrenizi giriniz", "error");
      return;
    }

    setIsDeletingAccountRequest(true);

    try {
      // Prepare request body - include password only for non-Google users
      const requestBody = {};
      if (!isGoogleUser) {
        requestBody.password = currentPasswordForDelete;
      }

      const response = await fetch("/api/v1/user/userDeleteRequest", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        showNotificationMessage(translateMessage(data.msg), "success");
        // Show the verification popup for step 2
        setShowDeleteAccountPopup(true);
        setDeleteAccountStep(1);
        setDeleteVerificationCode(["", "", "", "", "", ""]);
        setDeleteTimeLeft(300);
      } else {
        const errorData = await response.json();
        const translatedMessage = translateMessage(
          errorData.msg || "Hesap silme isteği başarısız"
        );
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Account deletion request error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsDeletingAccountRequest(false);
    }
  };

  // Step 2: Verify the deletion code from email
  const handleVerifyDeletionCode = async () => {
    const codeString = deleteVerificationCode.join("");
    if (codeString.length !== 6) {
      showNotificationMessage(
        "Lütfen 6 haneli doğrulama kodunu girin",
        "error"
      );
      return;
    }

    if (deleteTimeLeft <= 0) {
      showNotificationMessage(
        "Doğrulama kodunuzun süresi doldu. Lütfen müşteri hizmetleri ile iletişime geçin.",
        "error"
      );
      return;
    }

    setIsDeletingAccountRequest(true);

    try {
      const response = await fetch("/api/v1/user/checkDeletion", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeString,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeleteVerificationSuccess(data.success);
        setDeleteAccountStep(2);
        showNotificationMessage(
          "Doğrulama başarılı! Hesap silme işlemini onaylayın",
          "success"
        );
      } else {
        const errorData = await response.json();
        const translatedMessage = translateMessage(
          errorData.msg || "Doğrulama kodu geçersiz"
        );
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsDeletingAccountRequest(false);
    }
  };

  // Step 3: Final account deletion
  const handleConfirmAccountDeletion = async () => {
    setIsDeletingAccountRequest(true);

    try {
      const response = await fetch("/api/v1/user/updateDeleteUser", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: deleteVerificationSuccess,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showNotificationMessage(
          translateMessage(data.message || "Hesabınız başarıyla silindi"),
          "success"
        );
        setShowDeleteAccountPopup(false);
        setIsDeletingAccount(false);
        // Logout user after successful deletion
        setTimeout(() => {
          logout();
          navigate("/");
        }, 2000);
      } else {
        // Handle error responses
        let translatedMessage = "Hesap silme işlemi başarısız";
        try {
          const errorData = await response.json();
          translatedMessage = translateMessage(
            errorData.msg || errorData.message || "Hesap silme işlemi başarısız"
          );
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        showNotificationMessage(translatedMessage, "error");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");
    } finally {
      setIsDeletingAccountRequest(false);
    }
  };

  // Handle deletion verification code input
  const handleDeletionVerificationCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, ""); // Only allow digits
    if (digit.length <= 1) {
      const newCode = [...deleteVerificationCode];
      newCode[index] = digit;
      setDeleteVerificationCode(newCode);

      // Auto-focus next input
      if (digit && index < 5) {
        const nextInput = document.getElementById(
          `delete-code-input-${index + 1}`
        );
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace in deletion verification code
  const handleDeletionVerificationKeyDown = (index, e) => {
    if (e.key === "Backspace" && !deleteVerificationCode[index] && index > 0) {
      const prevInput = document.getElementById(
        `delete-code-input-${index - 1}`
      );
      if (prevInput) {
        prevInput.focus();
        const newCode = [...deleteVerificationCode];
        newCode[index - 1] = "";
        setDeleteVerificationCode(newCode);
      }
    }
  };

  // Close account deletion popup
  const handleCloseDeleteAccountPopup = () => {
    setShowDeleteAccountPopup(false);
    setDeleteAccountStep(1);
    setIsDeletingAccount(false);
    setCurrentPasswordForDelete("");
    setDeleteVerificationCode(["", "", "", "", "", ""]);
    setDeleteTimeLeft(300);
    setDeleteVerificationSuccess(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      showNotificationMessage(
        "Sadece JPG, PNG veya GIF formatında resim yükleyebilirsiniz.",
        "error"
      );
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showNotificationMessage("Resim boyutu maksimum 5MB olabilir.", "error");
      return;
    }

    setIsUploadingPhoto(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setProfilePictureBase64(base64String);
      setProfilePicturePreview(base64String);
      setIsUploadingPhoto(false);
      // Automatically enable edit mode when photo is selected
      setIsEditing(true);
    };
    reader.onerror = () => {
      showNotificationMessage("Resim yüklenirken bir hata oluştu.", "error");
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
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
    { value: "gk", label: "Kaleci" },
  ];

  const footPreferences = [
    { value: "right", label: "Sağ Ayak" },
    { value: "left", label: "Sol Ayak" },
    { value: "both", label: "Her İki Ayak" },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call logout endpoint directly to get proper response
      const response = await fetch("/api/v1/auth/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const successMessage = translateMessage(
          data.msg || "Logout successful"
        );
        showNotificationMessage(successMessage, "success");

        // Clear local authentication state via AuthContext
        await logout(true); // Pass true to show loading screen

        // Wait a moment for notification to be visible before redirecting
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        const errorData = await response.json();
        const errorMessage = translateMessage(errorData.msg || "Logout failed");
        showNotificationMessage(errorMessage, "error");

        // Even if logout API fails, clear local state and redirect
        await logout(true); // Pass true to show loading screen
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Logout error:", error);
      showNotificationMessage(translateMessage("Network Error"), "error");

      // Even if logout fails, clear local state and redirect
      try {
        await logout(true); // Pass true to show loading screen
      } catch (logoutError) {
        console.error("Local logout error:", logoutError);
      }
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tabs = [
    { id: "account", label: "Hesap Ayarları" },
    { id: "profile", label: "Kullanıcı Bilgilerim" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Ayarlar
      </h1>

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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Profil Fotoğrafı
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : getProfilePictureUrl(safeUser.profilePicture) ? (
                    <img
                      src={getProfilePictureUrl(safeUser.profilePicture)}
                      alt={safeUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                      {safeUser.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
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
                  className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer inline-block"
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
              <h2 className="text-xl font-semibold text-gray-900">
                Kişisel Bilgiler
              </h2>
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
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
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
                  {footPreferences.map((foot) => (
                    <option key={foot.value} value={foot.value}>
                      {foot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
                  tabIndex="0"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Kaydet</span>
                  )}
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
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
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
              <h2 className="text-xl font-semibold text-gray-900">
                Kullanıcı Bilgileri
              </h2>
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
                    emailError ? "border-red-500" : "border-gray-300"
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
                  placeholder="+90533123456 veya 05331234567"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                    phoneError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Uluslararası telefon numarası formatında giriniz (örn:
                  +90533123456)
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
                  disabled={isSaving}
                  className="bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
                  tabIndex="0"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Kaydet</span>
                  )}
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
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  Şifre Değiştir
                </h2>
                <p className="text-sm text-gray-600 mt-1 break-words">
                  {isGoogleUser
                    ? "Google hesabınızla giriş yaptığınız için şifre değiştirme özelliği kullanılamaz. Şifrenizi Google hesabınızdan yönetebilirsiniz."
                    : "Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin. Güçlü bir şifre kullanmayı unutmayın."}
                </p>
              </div>
              {!isChangingPassword && !isGoogleUser && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                  tabIndex="0"
                >
                  Şifre Değiştir
                </button>
              )}
              {isGoogleUser && (
                <div className="bg-gray-100 text-gray-500 font-semibold px-6 py-2 rounded-md whitespace-nowrap flex-shrink-0 cursor-not-allowed">
                  Google Hesabı
                </div>
              )}
            </div>

            {isChangingPassword && !isGoogleUser && (
              <div className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    value={currentPasswordForChange}
                    onChange={(e) =>
                      setCurrentPasswordForChange(e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mevcut şifrenizi girin"
                    disabled={isChangingPasswordRequest}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      isChangingPasswordRequest || !currentPasswordForChange
                    }
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    tabIndex="0"
                  >
                    {isChangingPasswordRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <span>Şifremi Değiştir</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Tehlikeli Bölge
                </h2>
                <p className="text-sm text-gray-500 break-words">
                  Bu işlem geri alınamaz ve tüm verileriniz silinir.
                </p>
              </div>
              {!isDeletingAccount && (
                <button
                  onClick={() => setIsDeletingAccount(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                  tabIndex="0"
                >
                  Hesabı Sil
                </button>
              )}
            </div>

            {isDeletingAccount && (
              <div className="max-w-md">
                {!isGoogleUser && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      value={currentPasswordForDelete}
                      onChange={(e) =>
                        setCurrentPasswordForDelete(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Mevcut şifrenizi girin"
                      disabled={isDeletingAccountRequest}
                    />
                  </div>
                )}
                {isGoogleUser && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      Google hesabınızla giriş yaptığınız için şifre doğrulaması
                      gerekmiyor. Doğrudan hesap silme işlemini
                      başlatabilirsiniz.
                    </p>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsDeletingAccount(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={
                      isDeletingAccountRequest ||
                      (!isGoogleUser && !currentPasswordForDelete)
                    }
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    tabIndex="0"
                  >
                    {isDeletingAccountRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <span>Hesabı Sil</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Password Change Popup */}
      {showPasswordChangePopup && (
        <div
          className="maintenance-popup-overlay"
          onClick={handleClosePasswordChangePopup}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClosePasswordChangePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              tabIndex="0"
              aria-label="Popup'ı kapat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Step 2: Verification Code */}
            {passwordChangeStep === 2 && (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                    E-posta Doğrulama
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    E-posta adresinize gönderilen 6 haneli doğrulama kodunu
                    girin
                  </p>
                </div>

                {/* Timer Display */}
                {timeLeft > 0 ? (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Kalan süre:{" "}
                      <span className="font-semibold text-green-600">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-sm text-red-600 font-semibold">
                      Doğrulama kodunuzun süresi doldu. Müşteri hizmetleri ile
                      iletişime geçin.
                    </p>
                  </div>
                )}

                {/* Verification Code Input */}
                <div className="mb-5 flex justify-center">
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`password-code-input-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) =>
                          handleVerificationCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                        disabled={isChangingPasswordRequest || timeLeft <= 0}
                        maxLength="1"
                        className="w-12 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        tabIndex="0"
                        aria-label={`Doğrulama kodu ${index + 1}. hane`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClosePasswordChangePopup}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleVerifyPasswordCode}
                    disabled={
                      isChangingPasswordRequest ||
                      timeLeft <= 0 ||
                      verificationCode.join("").length !== 6
                    }
                    className="flex-1 px-4 py-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    tabIndex="0"
                  >
                    {isChangingPasswordRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Doğrulanıyor...</span>
                      </>
                    ) : (
                      <span>Doğrula</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: New Password */}
            {passwordChangeStep === 3 && (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                    Şifre Değiştir
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin.
                    Güçlü bir şifre kullanmayı unutmayın.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Yeni şifrenizi girin"
                    disabled={isChangingPasswordRequest}
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Yeni şifrenizi tekrar girin"
                    disabled={isChangingPasswordRequest}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClosePasswordChangePopup}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSetNewPassword}
                    disabled={
                      isChangingPasswordRequest ||
                      !newPassword ||
                      !confirmNewPassword
                    }
                    className="flex-1 px-4 py-3 bg-[rgb(0,128,0)] hover:bg-[rgb(0,100,0)] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    tabIndex="0"
                  >
                    {isChangingPasswordRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <span>Şifreyi Değiştir</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Account Deletion Popup */}
      {showDeleteAccountPopup && (
        <div
          className="maintenance-popup-overlay"
          onClick={handleCloseDeleteAccountPopup}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseDeleteAccountPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              tabIndex="0"
              aria-label="Popup'ı kapat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Step 1: Verification Code */}
            {deleteAccountStep === 1 && (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                    Hesap Silme Doğrulama
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    E-posta adresinize gönderilen 6 haneli doğrulama kodunu
                    girin
                  </p>
                </div>

                {/* Timer Display */}
                {deleteTimeLeft > 0 ? (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Kalan süre:{" "}
                      <span className="font-semibold text-red-600">
                        {formatTime(deleteTimeLeft)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-sm text-red-600 font-semibold">
                      Doğrulama kodunuzun süresi doldu. Müşteri hizmetleri ile
                      iletişime geçin.
                    </p>
                  </div>
                )}

                {/* Verification Code Input */}
                <div className="mb-5 flex justify-center">
                  <div className="flex gap-2 justify-center">
                    {deleteVerificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`delete-code-input-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) =>
                          handleDeletionVerificationCodeChange(
                            index,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) =>
                          handleDeletionVerificationKeyDown(index, e)
                        }
                        disabled={
                          isDeletingAccountRequest || deleteTimeLeft <= 0
                        }
                        maxLength="1"
                        className="w-12 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-red-400 focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        tabIndex="0"
                        aria-label={`Doğrulama kodu ${index + 1}. hane`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseDeleteAccountPopup}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleVerifyDeletionCode}
                    disabled={
                      isDeletingAccountRequest ||
                      deleteTimeLeft <= 0 ||
                      deleteVerificationCode.join("").length !== 6
                    }
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    tabIndex="0"
                  >
                    {isDeletingAccountRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Doğrulanıyor...</span>
                      </>
                    ) : (
                      <span>Doğrula</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Final Confirmation */}
            {deleteAccountStep === 2 && (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                    Hesabı Kalıcı Olarak Sil
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı
                    olarak silinecek.
                  </p>
                </div>

                {/* Warning Info */}
                <div className="mb-5 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">
                        Uyarı
                      </p>
                      <p className="text-xs text-red-800 leading-relaxed">
                        Hesabınız silindikten sonra tüm verileriniz geri
                        getirilemez. Profil bilgileriniz, rezervasyonlarınız ve
                        tüm geçmişiniz kaybolacaktır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseDeleteAccountPopup}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                    tabIndex="0"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleConfirmAccountDeletion}
                    disabled={isDeletingAccountRequest}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    tabIndex="0"
                  >
                    {isDeletingAccountRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Siliniyor...</span>
                      </>
                    ) : (
                      <span>Evet, Hesabımı Sil</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notification Component */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={handleCloseNotification}
        duration={3000}
      />
    </div>
  );
}

export default Settings;

import { useEffect } from 'react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

function KVKK() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                KVKK Aydınlatma Metni
              </h1>
              <p className="text-gray-600 text-lg">
                6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
              </p>
              <p className="text-gray-600">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
                <div className="bg-blue-50 p-6 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Şirket Adı:</strong> SporPlanet Teknoloji Anonim Şirketi
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Adres:</strong> Maslak Mahallesi, Büyükdere Caddesi No:123, Sarıyer/İstanbul
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>E-posta:</strong> kvkk@sporplanet.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Telefon:</strong> +90 (212) 123 45 67
                  </p>
                  <p className="text-gray-700">
                    <strong>Website:</strong> www.sporplanet.com
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Hizmet Sunumu</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Kullanıcı hesabı oluşturma ve yönetimi</li>
                  <li>Maç organizasyonu hizmetleri</li>
                  <li>Halı saha rezervasyon işlemleri</li>
                  <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                  <li>Müşteri destek hizmetleri</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 İletişim ve Bilgilendirme</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Hizmet güncellemeleri hakkında bilgilendirme</li>
                  <li>Kampanya ve promosyon duyuruları</li>
                  <li>Önemli sistem bildirimleri</li>
                  <li>Müşteri memnuniyeti anketleri</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Güvenlik ve Yasal Yükümlülükler</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Platform güvenliğinin sağlanması</li>
                  <li>Dolandırıcılık ve suistimal önleme</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Uyuşmazlık çözümü süreçleri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. İşlenen Kişisel Veri Kategorileri</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Kimlik Verileri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Ad, soyad</li>
                  <li>T.C. kimlik numarası (gerekli durumlarda)</li>
                  <li>Doğum tarihi</li>
                  <li>Cinsiyet</li>
                  <li>Profil fotoğrafı</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 İletişim Verileri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Adres bilgileri</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Müşteri İşlem Verileri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Rezervasyon geçmişi</li>
                  <li>Ödeme bilgileri</li>
                  <li>Maç katılım kayıtları</li>
                  <li>Değerlendirme ve yorumlar</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Teknik Veriler</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>IP adresi</li>
                  <li>Çerez verileri</li>
                  <li>Cihaz bilgileri</li>
                  <li>Konum verileri (izin dahilinde)</li>
                  <li>Platform kullanım logları</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanarak işlenmektedir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li><strong>Açık rıza:</strong> Pazarlama iletişimi ve konum verileri için</li>
                  <li><strong>Sözleşmenin kurulması veya ifası:</strong> Hizmet sunumu için gerekli veriler</li>
                  <li><strong>Yasal yükümlülük:</strong> Muhasebe, vergi ve diğer yasal gereklilikler</li>
                  <li><strong>Meşru menfaat:</strong> Güvenlik, dolandırıcılık önleme ve platform geliştirme</li>
                  <li><strong>Temel hak ve özgürlüklere zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri</strong></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kişisel Verilerin Aktarılması</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Yurt İçi Aktarımlar</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz aşağıdaki kategorilerdeki kişi ve kuruluşlara aktarılabilir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Ödeme kuruluşları ve bankalar</li>
                  <li>Bilgi işlem hizmet sağlayıcıları</li>
                  <li>Yasal düzenlemeler gereği kamu kurum ve kuruluşları</li>
                  <li>Hukuk müşavirleri ve denetim şirketleri</li>
                  <li>İş ortakları (saha işletmecileri)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Yurt Dışı Aktarımlar</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verileriniz, yeterli koruma düzeyine sahip ülkelere veya uygun güvencelerle aşağıdaki durumlarda aktarılabilir:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Bulut hizmet sağlayıcıları (AWS, Google Cloud)</li>
                  <li>Analitik hizmet sağlayıcıları (Google Analytics)</li>
                  <li>Ödeme işlem sağlayıcıları</li>
                  <li>Teknik destek hizmetleri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Kişisel Veri Saklama Süreleri</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Veri Kategorisi</th>
                        <th className="border border-gray-300 p-3 text-left">Saklama Süresi</th>
                        <th className="border border-gray-300 p-3 text-left">Yasal Dayanak</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Hesap Bilgileri</td>
                        <td className="border border-gray-300 p-3">Hesap aktif olduğu sürece</td>
                        <td className="border border-gray-300 p-3">Sözleşme</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">İşlem Kayıtları</td>
                        <td className="border border-gray-300 p-3">10 yıl</td>
                        <td className="border border-gray-300 p-3">Muhasebe mevzuatı</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">İletişim Kayıtları</td>
                        <td className="border border-gray-300 p-3">3 yıl</td>
                        <td className="border border-gray-300 p-3">Müşteri hizmetleri</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Log Kayıtları</td>
                        <td className="border border-gray-300 p-3">2 yıl</td>
                        <td className="border border-gray-300 p-3">Güvenlik</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Pazarlama Verileri</td>
                        <td className="border border-gray-300 p-3">Rıza geri alınana kadar</td>
                        <td className="border border-gray-300 p-3">Açık rıza</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. KVKK Kapsamındaki Haklarınız</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">📋 Bilgi Alma Hakkı</h4>
                    <p className="text-gray-700 text-sm">
                      Kişisel verilerinizin işlenip işlenmediğini öğrenme hakkınız bulunmaktadır.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Bilgi Talep Etme</h4>
                    <p className="text-gray-700 text-sm">
                      İşlenen kişisel verileriniz hakkında bilgi talep edebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Amaç Öğrenme</h4>
                    <p className="text-gray-700 text-sm">
                      İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🔄 Aktarım Bilgisi</h4>
                    <p className="text-gray-700 text-sm">
                      Kişisel verilerin aktarıldığı üçüncü kişileri öğrenme hakkınız vardır.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">✏️ Düzeltme Hakkı</h4>
                    <p className="text-gray-700 text-sm">
                      Eksik veya yanlış işlenmiş verilerin düzeltilmesini talep edebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🗑️ Silme Hakkı</h4>
                    <p className="text-gray-700 text-sm">
                      Kişisel verilerinizin silinmesini veya yok edilmesini isteyebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🚫 İtiraz Hakkı</h4>
                    <p className="text-gray-700 text-sm">
                      Kişisel verilerinizin işlenmesine itiraz edebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">⚖️ Tazminat Hakkı</h4>
                    <p className="text-gray-700 text-sm">
                      İşleme nedeniyle zarara uğramanız halinde tazminat talep edebilirsiniz.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Haklarınızı Kullanma Yöntemleri</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  KVKK kapsamındaki haklarınızı aşağıdaki yöntemlerle kullanabilirsiniz:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Başvuru Yöntemleri</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li><strong>E-posta:</strong> kvkk@sporplanet.com</li>
                  <li><strong>Posta:</strong> Maslak Mahallesi, Büyükdere Caddesi No:123, Sarıyer/İstanbul</li>
                  <li><strong>Platform:</strong> Hesap ayarlarından "KVKK Hakları" bölümü</li>
                  <li><strong>Fiziksel başvuru:</strong> Şirket adresimize bizzat müracaat</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Başvuru Şartları</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Başvurunuz yazılı olarak yapılmalıdır</li>
                  <li>Kimlik tespiti için gerekli belgeler eklenmelidir</li>
                  <li>Talep konusu açık ve anlaşılır şekilde belirtilmelidir</li>
                  <li>İmzalı başvuru formu kullanılmalıdır</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Yanıt Süreleri</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Standart başvurular:</strong> 30 gün içinde</li>
                    <li><strong>Karmaşık başvurular:</strong> 60 güne kadar uzatılabilir</li>
                    <li><strong>Ücretli işlemler:</strong> Ödeme sonrası 30 gün</li>
                    <li><strong>Red durumları:</strong> Gerekçeli yanıt 30 gün içinde</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Veri Güvenliği Önlemleri</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari önlemleri almaktayız:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Teknik Önlemler</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>256-bit SSL şifreleme</li>
                  <li>Güvenli veri saklama sistemleri</li>
                  <li>Düzenli güvenlik güncellemeleri</li>
                  <li>Penetrasyon testleri</li>
                  <li>Veri yedekleme sistemleri</li>
                  <li>Erişim logları ve izleme</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 İdari Önlemler</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Personel eğitim programları</li>
                  <li>Gizlilik sözleşmeleri</li>
                  <li>Erişim yetkilendirme sistemleri</li>
                  <li>Veri işleme prosedürleri</li>
                  <li>Olay müdahale planları</li>
                  <li>Düzenli güvenlik denetimleri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Veri İhlali Bildirimi</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel veri güvenliği ihlali durumunda:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Kişisel Verileri Koruma Kurulu'na 72 saat içinde bildirim yapılır</li>
                  <li>Etkilenen kullanıcılar derhal bilgilendirilir</li>
                  <li>Gerekli güvenlik önlemleri alınır</li>
                  <li>İhlal nedenleri araştırılır ve raporlanır</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Şikayet Hakkı</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  KVKK haklarınızın ihlal edildiğini düşünüyorsanız:
                </p>
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="text-red-800 text-sm mb-2">
                    <strong>Kişisel Verileri Koruma Kurulu'na başvuru:</strong>
                  </p>
                  <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                    <li>Website: www.kvkk.gov.tr</li>
                    <li>E-posta: kvkk@kvkk.gov.tr</li>
                    <li>Adres: Adalet Bakanlığı Kişisel Verileri Koruma Kurulu Başkanlığı</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. İletişim Bilgileri</h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Veri Sorumlusu İletişim Bilgileri</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p><strong>Şirket:</strong> SporPlanet Teknoloji A.Ş.</p>
                      <p><strong>KVKK Sorumlusu:</strong> Ahmet Yılmaz</p>
                      <p><strong>E-posta:</strong> kvkk@sporplanet.com</p>
                      <p><strong>Telefon:</strong> +90 (212) 123 45 67</p>
                    </div>
                    <div>
                      <p><strong>Adres:</strong> Maslak Mahallesi</p>
                      <p>Büyükdere Caddesi No:123</p>
                      <p>Sarıyer/İstanbul</p>
                      <p><strong>Posta Kodu:</strong> 34485</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Aydınlatma Metni Güncellemeleri</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu Aydınlatma Metni, yasal değişiklikler veya şirket politika güncellemeleri nedeniyle 
                  değiştirilebilir. Önemli değişiklikler durumunda kullanıcılarımız e-posta, SMS veya 
                  platform bildirimleri aracılığıyla bilgilendirilecektir. Güncel metni düzenli olarak 
                  kontrol etmenizi öneririz.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default KVKK;

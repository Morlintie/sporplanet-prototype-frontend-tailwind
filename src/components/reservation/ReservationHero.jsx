function ReservationHero() {
  return (
    <section 
      className="relative text-white py-16 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://cdn.pixabay.com/photo/2017/08/06/03/03/football-field-2588146_1280.jpg')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Saha Rezervasyonu
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            İstediğiniz zaman ve yerde kaliteli halı sahaları rezerve edin. 
            Hemen rezervasyon yapın ve futbol keyfinizi yaşayın!
          </p>
        </div>
      </div>
    </section>
  );
}

export default ReservationHero; 
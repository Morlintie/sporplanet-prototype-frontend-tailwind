function MatchesHero() {
  return (
    <section 
      className="relative text-white py-16 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/13907449/pexels-photo-13907449.jpeg')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Bir Sonraki Maçınızı Bulun
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            Takımınızı oluşturun ve rakiplerinizi keşfedin. En iyi takım olma yolunda hızlıca ilerleyin.
          </p>
        </div>
      </div>
    </section>
  );
}

export default MatchesHero;
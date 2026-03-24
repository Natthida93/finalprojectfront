<template>
  <section class="hero">
    <div class="hero-overlay">
      <h1>Experience Live Music Like Never Before</h1>
      <p>Book tickets to your favorite concerts quickly and easily.</p>
      <button @click="scrollToSlider">Browse Concerts</button>
    </div>
    <img src="https://capricho.abril.com.br/wp-content/uploads/2022/01/Mark-Tuan-Divulgacao.jpg?quality=70&strip=all&resize=680" alt="Concert Banner" class="hero-bg"/>
  </section>
</template>

<script setup>
function scrollToSlider() {
  const slider = document.querySelector('.slider')
  if (slider) slider.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: #888;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  top: 0;
  left: 0;
  z-index: 1;
}

.hero-overlay {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.hero button {
  padding: 12px 28px;
  font-size: 1rem;
  border: 2px solid white;      /* white outline */
  border-radius: 8px;
  cursor: pointer;
  background-color: black;       /* main button color */
  color: white;                  /* text color */
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); /* subtle depth */
}

.hero button:hover {
  background-color: white;       /* invert colors */
  color: black;
  border: 2px solid black;       /* match inverted text */
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3); /* stronger hover depth */
}


.hero {
  position: relative;
  width: 100%;
  height: 80vh; /* adjust height */
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* fills the hero section */
  z-index: 1;
}

.hero-overlay {
  position: relative;
  z-index: 2; /* overlays on top of image */
  text-align: center;
  color: white;
}
</style>
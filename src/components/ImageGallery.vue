<template>
    <div class="container mt-4">
      <div class="row">
        <div class="col-6 col-md-4 col-lg-3 mb-4" v-for="(image, index) in images" :key="index">
          <div class="card">
            <img :src="image.src" class="card-img-top" :alt="image.alt" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ImageGallery",
    data() {
      return {
        images: [
          { src: "../../assets/images/Component 102 – 1.png", alt: "Image 0 description" },  
        //   { src: "path/to/image1.jpg", alt: "Image 1 description" },
        //   { src: "path/to/image2.jpg", alt: "Image 2 description" },
        //   { src: "path/to/image3.jpg", alt: "Image 3 description" },
          // Add more images as needed

        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .card-img-top {
    height: auto;
    width: 100%;
    object-fit: cover;
  }
  </style>
  
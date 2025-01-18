import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = ({ items }) => {
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Afișează 2 știri simultan
    slidesToScroll: 1, // Derulează câte 1 știre
    arrows: true,
    autoplay: true, // Activează derularea automată
    autoplaySpeed: 3000, // Interval de 3 secunde între tranziții (3000 ms)    
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Slider {...carouselSettings}>
        {items.map((item, index) => (
          <div key={index}>
            <div className="slick-art" style={{background: `url(${item.imgSrc}) no-repeat center center`,}}>
                <div>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <strong style={{ display: "block", fontSize: "12px", marginBottom: "5px" }}>
                      {item.source}
                    </strong>              
                    <h3>{item.text}</h3> 
                  </a>
                </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;

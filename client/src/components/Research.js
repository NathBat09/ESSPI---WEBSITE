import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import './Research.css'; // Import CSS file for styling
import ToolImage from '../images/Screenshot_6E.png';
import ProposedImage from '../images/Screenshot_9.png';
import backgroundImg from '../esspi/background.png';
import benefitsImg from '../esspi/benefits.png';
import equationsImg from '../esspi/equations.png';
import functionsImg from '../esspi/functions.png';
import inputsImg from '../esspi/inputs.png';
import storageImg from '../esspi/storage.png';
import typesImg from '../esspi/types.png';
import ess from '../esspi/ess.png';
import image1 from '../pv/1.jpg';
import image2 from '../pv/2.jpg';
import image3 from '../pv/3.jpg';
import image4 from '../pv/4.jpg';
import image5 from '../pv/5.jpg';
import image6 from '../pv/6.jpg';
import image7 from '../pv/7.jpg';
import image8 from '../pv/8.jpg';
import image9 from '../pv/9.jpg';
import image10 from '../pv/10.jpg';
import image11 from '../pv/11.jpg';
import image12 from '../pv/12.jpg';
import image13 from '../pv/13.jpg';
import image14 from '../pv/14.jpg';
import image15 from '../pv/15.jpg';
import image17 from '../pv/17.jpg';
import image18 from '../pv/18.jpg';
import image20 from '../pv/20.jpg';
import image21 from '../pv/21.jpg';
import image22 from '../pv/22.jpg';


const ResearchPage = () => {
  const downloadPdf = (pdfUrl, fileName) => {
    saveAs(pdfUrl, fileName);
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageIndex2, setCurrentImageIndex2] = useState(0);

  const images = [ess, backgroundImg, storageImg, benefitsImg, equationsImg, inputsImg, functionsImg, typesImg];
  const pv_images = [
    image1,
    image20,
    image21,
    image22,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
    image11,
    image12,
    image13,
    image14,
    image15,
    image17,
    image18,
  ];

  const handlePrevClick = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevClick2 = () => {
    setCurrentImageIndex2(prevIndex => (prevIndex === 0 ? pv_images.length - 1 : prevIndex - 1));
  };

  const handleNextClick2 = () => {
    setCurrentImageIndex2(prevIndex => (prevIndex === pv_images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="research-page">
      <div className="articles">
        <h1 className="research-page-title">ENERGY STORAGE SYSTEM PRIORITY INDEX EXPLANATION</h1>
        <div className="slideshow-container">
          <div className="slideshow-item">
            <img src={images[currentImageIndex]} alt="Slide" className="slide-image" />
            <br />
            <br />
            <div className="slide-controls">
              <button onClick={handlePrevClick}>Previous</button>
              <button onClick={handleNextClick}>Next</button>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <div className="articles">
        <h1 className="research-page-title">PHOTOVOLTAIC SYSTEMS EXPLANATION</h1>
        <div className="slideshow-container">
          <div className="slideshow-item">
            <img src={pv_images[currentImageIndex2]} alt="Slide" className="slide-image" />
            <br />
            <br />
            <div className="slide-controls">
              <button onClick={handlePrevClick2}>Previous</button>
              <button onClick={handleNextClick2}>Next</button>
            </div>
          </div>
        </div>
      </div>
      <br/>
      <br/>
      <div className="articles">
        <h1 className="research-page-title">Research Articles</h1>
        <div className="research-articles">
          <div className="research-article">
            <div className="research-article-content">
              <img src={ToolImage} alt="ESSPI" className="research-article-image" />
              <div className="research-article-details">
                <h2 className="research-article-heading">ESSPI as a Fast Tool for Load Prioritization on Microgrids Design</h2>
                <p className="research-article-description">In this article, we explore the benefits of using ESSPI for load prioritization on microgrids. Download the PDF to learn more.</p>
                <button className="download-button" onClick={() => downloadPdf('/articles/ESSPI_as_a_Fast_Tool_for_Load_Prioritization_on_Microgrids_Design.pdf', 'ESSPI_as_a_Fast_Tool_for_Load_Prioritization_on_Microgrids_Design.pdf')}>Download PDF</button>
              </div>
            </div>
          </div>
          <div className="research-article">
            <div className="research-article-content">
              <img src={ProposedImage} alt="Proposed Methodology" className="research-article-image" />
              <div className="research-article-details">
                <h2 className="research-article-heading">Proposed Methodology Using the Energy Storage System Priority Index</h2>
                <p className="research-article-description">This article presents a proposed methodology utilizing the Energy Storage System Priority Index. Download the PDF for detailed insights.</p>
                <button className="download-button" onClick={() => downloadPdf('/articles/Proposed_Methodology_Using_the_Energy_Storage_System_Priority_Index.pdf', 'Proposed_Methodology_Using_the_Energy_Storage_System_Priority_Index.pdf')}>Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default ResearchPage;

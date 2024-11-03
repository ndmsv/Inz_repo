import React from 'react';
import Navbar from '../Global/Navbar';
import logoMS from '../../assets/logoMS.png';
import '../Global/Global.css';

function Home() {
  return (
    <div className='parent-div'>
      <Navbar />
      <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1050 }}>
        <img src={logoMS} alt="Description" width="400" height="400" />
      </div>
    </div>
  );
}

export default Home;
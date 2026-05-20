import React from 'react';
import profileImage from '../assets/images/photo/photo.jpg';

import '../style/About.css';

function About() {
  return (
    <div className="about">
      <div className="profile">
        <img src={profileImage} alt="Profil Saya" />
      </div>
      <div className="profile-text">
        <h2>About</h2>
        <p>
          Davina Nazwa Aulia adalah nama saya. Lahir di Kuningan pada tanggal 03 Mei 2004, <br></br>
          juga sebagai anak kedua dari empat bersaudara. Melanjutkan jenjang perkuliahan di Universitas <br></br>
          Pendidikan Indonesia dengan jurusan Pendidikan Ilmu Komputer, dengan harapan saya bisa mencapai <br></br>
          cita-cita untuk berkarir di bidang IT <br></br>
        </p>
      </div>
    </div>
  );
}

export default About;

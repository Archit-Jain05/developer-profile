import {useState} from 'react'
import '../style/Biodata.css'
import Utpal from '../assets/utpal.avif'
import DJSCE from '../assets/djsce.jpg'
import SBMP from '../assets/sbmp.jpg'

function Biodata() {

    return (
    <div className='biodata'>
            <h1 className='montserrat-h1' style={{justifySelf:"center"}}>Education</h1>
            <div className='edu-container'>
                <div className='edu-card'><div><img src={Utpal} /></div></div>
                <div className='edu-card'><div><img src={SBMP} /></div></div>
                <div className='edu-card'><div><img src={DJSCE} /></div></div>
       
            </div>
    </div>
    )
}

export default Biodata
import {useState} from 'react'
import '../style/Education.css'
import Utpal from '../assets/utpal.avif'
import DJSCE from '../assets/djsce.jpg'
import SBMP from '../assets/sbmp.jpg'

function Education() {

    return (
    <div className='biodata'>
            <h1 className='montserrat-h1' style={{justifySelf:"center"}}>Education</h1>
            <div className='edu-container'>
                <div className='edu-card'>
                    <div className='edu-img'><img src={Utpal} />
                </div>
                <div className='edu-name'>
                    <ul>
                        <li className='montserrat-h1-edu'>Utpal Sanghvi Global School</li>
                    </ul>
                   
                    </div>
                    <div className="edu-details">
    
                            <div className="montserrat-m">Course :-</div>
                            <div className="montserrat-m">X Standard IGCSE</div>
                        
                            <div className="montserrat-m">Score :-</div>
                            <div className="montserrat-m">93.5%</div>
                    

                            <div className="montserrat-m">Duration :-</div>
                            <div className="montserrat-m">2011 - 2021</div>

                    </div>
                    </div>
                <div className='edu-card'><div className='edu-img'><img src={SBMP} /></div>
                <div className='edu-name'>
                    <ul>
                        <li className='montserrat-h1-edu'>SVKM's Shri Bhagubhai Mafatlal Polytechnic and College of Engineering</li>
                    </ul>
                    </div>
                    <div className="edu-details">
    
                                <div className="montserrat-m">Course :-</div>
                                <div className="montserrat-m">Diploma in Information Technology</div>
                            
                                <div className="montserrat-m">Score :-</div>
                                <div className="montserrat-m">89.0%</div>
                        

                                <div className="montserrat-m">Duration :-</div>
                                <div className="montserrat-m">2021 - 2024</div>

                        </div>
                    </div>
                <div className='edu-card'><div className='edu-img'><img src={DJSCE} /></div>
                <div className='edu-name'>
                    <ul>
                        <li className='montserrat-h1-edu'>SVKM's Dwarkadas J. Sanghvi College of Engineering</li>
                    </ul>
                    </div>
                    <div className="edu-details">
    
                            <div className="montserrat-m">Course :-</div>
                            <div className="montserrat-m">Bachelor Of Technology</div>
                        
                            <div className="montserrat-m">Score :-</div>
                            <div className="montserrat-m">9.18 / 10.0 CGPA</div>
                    

                            <div className="montserrat-m">Duration :-</div>
                            <div className="montserrat-m">2024 - 2027</div>

                    </div>
                    </div>
       
            </div>
    </div>
    )
}

export default Education
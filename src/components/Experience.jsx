import {useState} from 'react'
import '../style/Experience.css'
import HOPHEAD from "../assets/hophead.jpg"
import DCYBER from "../assets/dcyber.png"

function Experience() {

    return (
    <div className='exp-holder'>
        
        <div className='exp-con-holder'><h1 className='montserrat-h1' style={{justifySelf:"center"}}>Experience</h1>
            <div className='company'>
                <div className='company-logo'>
                    <img src={HOPHEAD} />
                </div>
                <div className='company-content '>
                    <h3 className='montserrat-m-exp'>Hophead.co</h3>
                    <h3 className='montserrat-li-exp'>Aug 2023 - Aug 2024</h3>
                    <h3 className='montserrat-li-exp'>Web Developer Intern</h3>
                    <h3 className='montserrat-li-exp'>My job role in hophead was to create and maintain e-commerce websites for the 
                        brand and drive in customers using a unique and creative ui/ux design.
                    </h3>
                    <button  onClick={() => {
                            window.open("https://hophead.co.in/", "_blank");
                        }}>
                    <h3 className='montserrat-li-exp'>Visit Website</h3></button>
                </div>
            </div>
            <div className='company'>
                <div className='company-logo'>
                    <img src={DCYBER} />
                </div>
                <div className='company-content'>
                    <h3  className='montserrat-m-exp'>Dcyber Techlabs Pvt.Ltd</h3>
                    <h3 className='montserrat-li-exp'>Aug 2022 - Sep 2022</h3>
                    <h3 className='montserrat-li-exp'>Web Developer Intern</h3>
                    <h3 className='montserrat-li-exp'>Worked as a web developer intern to develop a working website for the DCYBER Africa region website.</h3>
                    <button  onClick={() => {
                            window.open("https://dcyber.in/", "_blank");
                        }}>
                    <h3 className='montserrat-li-exp'>Visit Website</h3></button>
                </div>
            </div>
            
        </div>
    </div>
    )
}

export default Experience
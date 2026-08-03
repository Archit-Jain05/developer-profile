import {useState} from 'react'
import '../style/Experience.css'
import HOPHEAD from "../assets/hophead.jpg"
import DCYBER from "../assets/dcyber.png"
import ZOOTECHX from "../assets/zootechx.png"

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
                        brand and drive in customers using a unique and creative ui/ux design. The website was developed using shopify and React.js
                        with modern UI that hooks online shoppers onto the website.
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
                    <h3 className='montserrat-li-exp'>In DCYBER I Worked as a web developer intern to develop a website for the DCYBER Africa region using React.js.</h3>
                    <button  onClick={() => {
                            window.open("https://dcyber.in/", "_blank");
                        }}>
                    <h3 className='montserrat-li-exp'>Visit Website</h3></button>
                </div>
            </div>
            <div className='company'>
                <div className='company-logo'>
                    <img src={ZOOTECHX} />
                </div>
                <div className='company-content'>
                    <h3  className='montserrat-m-exp'>ZootechX</h3>
                    <h3 className='montserrat-li-exp'>Aug 2026 - Ongoing</h3>
                    <h3 className='montserrat-li-exp'>Software Developer</h3>
                    <h3 className='montserrat-li-exp'>I am working here as a software developer intern with my day to day responsibilities ranging from handling coding
                        as well as cordinating with clients personally to know about their requirements and help serve them better.
                    </h3>
                    <button  onClick={() => {
                            window.open("https://www.zootechx.com/", "_blank");
                        }}>
                    <h3 className='montserrat-li-exp'>Visit Website</h3></button>
                </div>
            </div>
            
        </div>
    </div>
    )
}

export default Experience
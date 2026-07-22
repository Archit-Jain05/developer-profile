import '../style/Footer.css'
import PFP from '../assets/pfp.svg'

function Footer() {
    return(
<div className='Footer-body'>
    <div className='Footer-card'>
        <div className='img-holder'>
            <img src={PFP} style={{width:"10vw"}} />
        </div>
        <div>
            <ul className='montserrat-li'>
                <li>Education</li>
                <li>Experience</li>
                <li>About Me</li>
                <li>Contact Me</li>
            </ul>
        </div>
        <div>
            <ul className='montserrat-li'>
                <li>Education</li>
                <li>Experience</li>
                <li>About Me</li>
                <li>Contact Me</li>
                </ul>
        </div>
        <div className='form'>
             <div>
                <h1 className='montserrat-h1-form'>Reach out to me:</h1>
             </div>
             <div>
                <input type="text" style={{height:"3vh"}}/>
                
             </div>
             <div>
                <input type="text" style={{height:"10vh"}} />
             </div>
             <div>
                <button></button>
             </div>
            
        </div>

    </div>
</div>
    )
}

export default Footer
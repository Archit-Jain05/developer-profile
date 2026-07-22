import '../style/Footer.css'
import PFP from '../assets/pfp.svg'

function Footer() {
    return(
<div className='Footer-body'>
    <div className='Footer-card'>
        <div className='img-holder'>
            <img src={PFP} style={{width:"10vw"}} />
        </div>
        <div className='ulist'>
            <ul className='montserrat-li'>
                <li><a href="">Education</a></li>
                <li><a href="">Experience</a></li>
                <li><a href="">About Me</a></li>
                <li><a href="">Contact Me</a></li>
            </ul>
        </div>
        <div className='ulist'>
            <ul className='montserrat-li'>
                <li><a href="">Projects</a></li>
                <li><a href="">Services</a></li>
                <li><a href="">Resume</a></li>
                <li><a href=""></a></li>
                </ul>
        </div>
        <div className='form'>
            
                <h1 className='montserrat-h1-form' style={{paddingLeft:"3vw", marginBottom:"0", margintop:"2vh  "}}>Reach out to me :-</h1>
            
             <div>
                <input type="text" style={{height:"5vh" }} placeholder='Enter your email id' className='montserrat-m'/>
                
             </div>

             <div>
                <textarea id="message" name="message" className='montserrat-m' style={{height:"15vh",alignContent:"center"}} placeholder='Type your content'></textarea>
             </div>

            <button><p className='montserrat-s'>Send</p></button>
        </div>

    </div>
    <div className='bottom-credit'>
        <p className='montserrat-s'>Created by Archit Jain.</p>
    </div>
</div>
    )
}

export default Footer
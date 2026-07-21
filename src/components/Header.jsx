import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import "../style/Header.css"
import PFP from "../assets/pfp.svg"
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Header() {
    return (
        <div className="header-main">
            <div style={{display:"flex"}}><button style={{background:"none", marginLeft:"3%" , border: "none",boxShadow: "none", cursor:"pointer"}}><MenuIcon className="icons" /></button></div>
            <div className="logo-main" style={{justifySelf:"center", userSelect:"none"}}>
                <img src={PFP} style={{width:"35px"}}/>
                <h2 className="montserrat-h1">RCHIT JAIN</h2>
                </div>
            <div style={{display:"flex",justifyContent:"end", gap:"30px", marginRight:"5%"}}>
                <a href="/"><EmailOutlinedIcon className="icons"/></a>
                <a href="/"><LocalPhoneOutlinedIcon className="icons"/></a>
                <a href="/"><LinkedInIcon className="icons" /></a>
                <a href="/"><GitHubIcon className="icons"/></a>
            </div>
        </div>
    )
}

export default Header
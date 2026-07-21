import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import "../style/Header.css"

function Header() {
    return (
        <div className="header-main">
            <MenuIcon style={{color:"white", fontSize:35}}/>
        </div>
    )
}

export default Header
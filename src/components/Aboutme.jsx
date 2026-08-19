import React from "react";
import "../style/Aboutme.css"
import Archit from "../assets/archit.png"

function Aboutme() {
    return (
        <div className="about-body">
            <h1 className="montserrat-h1" style={{justifySelf:"center"}}>About Me</h1>
            <div className="abt-con">
                <div className="abt-img-holder">
                    <img src={Archit} />
                </div>
                <div className="abt-text"><p className="montserrat-li-exp">
                     Hi, I’m Archit Jain

 I’m interested in the new trending technology and trends such as Artificial Intelligence and Deep Learning using Machine Learning. I am looking forward to integrate such technologies and create my own applications and software for platforms such as android and wiindows. I have a keen interest when it comes to software development and I work as a freelancer for creating applications.
 I’m currently learning cross platform development using Flutter to enhance my skills for software development. As a college student who is still pursuing degree in Information Technology, Technology is my passion and computers are my comfort places.

 I’m looking to collaborate on projects that include the latest technology trends and that are challenging to boost my skillset and help me learn more about things that would help me become a more pro in what I do.

 You can contact me via my email or via my linkedIn profile DMs and i would love to talk to collaborate on projects or just have a little chat about similar interests.
                </p></div>
            </div>
        </div>
    )
}

export default Aboutme
import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import logoMS from '../../assets/logoMS.png';
import '../Global/Global.css';
import { Link } from 'react-router-dom';
import { checkUserDetails } from '../../services/apiService';

function About() {
    const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [hashedPassword, setHashedPassword] = React.useState(localStorage.getItem('hashedPassword') || null);

    useEffect(() => {
        handleCheckUserDetailsSubmit();
    }, []);

    const handleCheckUserDetailsSubmit = async () => {
        const registerResponse = await checkUserDetails(username, hashedPassword);

        if (registerResponse.isSuccess) {
            setIsTeacherOrAdmin(registerResponse.isAdminOrTeacher);
            setIsAdmin(registerResponse.isAdmin);
        }
    }

    return (
        <div className='parent-div'>
            <Navbar />
            <div className='panel panel-default'>
                <div className='panel-body'>
                    <div className='row mt-3 me-0 text-center'>
                        <h2>Welcome to our online education platform!</h2>
                    </div>
                    <div className='row mt-3 me-0 text-center'>
                        <h5>Our platform allows you to join relevant courses and submit assignments required by your teachers.</h5>
                        <h5>If you are a teacher, you can create new courses, manage existing ones, and collaborate with other teachers seamlessly.</h5>
                        <h5>Additionally, there's a discussion forum for everyone where you can share knowledge, vote and comment on posts that interest you.</h5>
                    </div>
                    <div className='row mt-3 me-0 text-center'>
                        <h5>Special thanks to <a target="_blank" href="https://icons8.com">Icons8</a> for providing free icons, including:</h5>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/7690/done">Done</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/39805/up-arrow">Up Arrow</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/39804/down-arrow">Down Arrow</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/71201/edit">Edit</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/67884/delete">Delete</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                        <h6>- <a target="_blank" href="https://icons8.com/icon/59782/error">Error</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a></h6>
                    </div>
                    <div className='row mt-3 me-0 text-center'>
                        <h5>This site was developed by Jakub Głuszek, Filip Gawlas, and Jan Palmen as part of their engineering thesis at the Silesian University of Technology.</h5>
                    </div>
                    <div className='row mt-3 me-0'>
                        <div className='text-center'>
                            <img src={logoMS} alt='Platform Logo' width='100' height='100' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
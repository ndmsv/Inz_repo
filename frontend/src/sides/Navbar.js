import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkUserDetails } from '../services/apiService';

function Navbar() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [hashedPassword, setHashedPassword] = React.useState(localStorage.getItem('hashedPassword') || null);
    const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState(false);
    const [fullname, setFullname] = useState('');

    const handleLogout = () => {
        if (username) {
            localStorage.removeItem('username');
        }
        navigate('/');
    };

    React.useEffect(() => {
        if (!username || !hashedPassword) {
            alert('You must log in firstly!');
            navigate('/');
        }
        else {
            handleCheckUserDetailsSubmit();
        }
    }, [username, navigate]);

    const handleCheckUserDetailsSubmit = async (event) => {
        const registerResponse = await checkUserDetails(username, hashedPassword);

        if (registerResponse.isSuccess) {
            setIsTeacherOrAdmin(registerResponse.isAdminOrTeacher);

            if (registerResponse.fullname)
                setFullname(registerResponse.fullname)

        }
        else {
            alert('Login credentials are not correct!');
            navigate('/');
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <Link className="nav-link" to="/home">Home</Link>
                </ul>
                <ul className="navbar-nav">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarCourses" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Courses
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="navbarCourses">
                            <Link className="dropdown-item" to="/joinCourse">Join Course</Link>
                            <Link className="dropdown-item" to="/myCourses">My Courses</Link>
                            {isTeacherOrAdmin && (
                                <Link className="dropdown-item" to="/createCourse">Create Course</Link>)}
                        </ul>
                    </li>
                </ul>
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarUser" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {fullname ? fullname : username}
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUser">
                            <Link className="dropdown-item" to="/" onClick={handleLogout}>Log out</Link>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;

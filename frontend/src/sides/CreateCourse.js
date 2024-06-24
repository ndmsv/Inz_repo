import React, { useState } from 'react';
import Navbar from './Navbar';
import { checkUserDetails, registerCourse } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

function CreateCourse() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [hashedPassword, setHashedPassword] = React.useState(localStorage.getItem('hashedPassword') || null);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);

    const handleCheckIfTeacherSubmit = async (event) => {
        const registerResponse = await checkUserDetails(username, hashedPassword);

        if (!registerResponse.isAdminOrTeacher) {
            if (registerResponse.message)
                alert(registerResponse.message);
            else
                alert("To access this part of side you must have teacher or administrator permissions!");

            navigate('/home');
        }
    }

    React.useEffect(() => {
        handleCheckIfTeacherSubmit();
    }, [username, navigate]);

    const togglePasswordProtection = () => {
        setIsPasswordProtected(!isPasswordProtected);
    };

    const handleCourseCreationSubmit = async (event) => {
        event.preventDefault();

        const courseName = event.target.txtCourseName.value;
        const courseDescription = event.target.txtCourseDescription.value;
        let password, repeatedPassword;

        if (!courseName.trim()) {
            alert("Course name must not be empty!");
            return;
        }


        if (isPasswordProtected) {
            password = event.target.txtCoursePassword.value;
            repeatedPassword = event.target.txtCoursePasswordRepetition.value;

            if (password.trim().length < 4) {
                alert("Password must contain at least 4 characters!");
                return;
            }

            if (password.trim() !== repeatedPassword.trim()) {
                alert("Password and its repetition are not the same!");
                return;
            }
        }

        const registerResponse = await registerCourse(courseName.trim(), courseDescription.trim(), username, password);
        if (!registerResponse.isSuccess)
            alert(registerResponse.message);
        else {
            alert(registerResponse.message + " You will be redirected to home page now.");
            navigate("/home");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-body">
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1050, width: "60%" }}>
                        <form onSubmit={handleCourseCreationSubmit}>
                            <div className="mb-3">
                                <h5 className="panel-title">Create Course</h5>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="txtCourseName" className="form-label">Course name</label>
                                <input type="text" className="form-control" id="txtCourseName" placeholder="Enter course name" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="txtCourseDescription" className="form-label">Course description</label>
                                <textarea type="text" className="form-control" id="txtCourseDescription" rows="3" placeholder="Enter course description" />
                            </div>
                            <div className="form-check mb-2">
                                <input type="checkbox" className="form-check-input" id="cbPasswordProtected" checked={isPasswordProtected} onChange={togglePasswordProtection} />
                                <label htmlFor="cbPasswordProtected" className="form-check-label"> Password protected course </label>
                            </div>
                            {isPasswordProtected && (
                                <div>
                                    <div className="mb-3">
                                        <label htmlFor="txtCoursePassword" className="form-label">Course password</label>
                                        <input type="password" className="form-control" id="txtCoursePassword" placeholder="Enter course password" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="txtCoursePasswordRepetition" className="form-label">Course password repetition</label>
                                        <input type="password" className="form-control" id="txtCoursePasswordRepetition" placeholder="Repeat course password" />
                                    </div>
                                </div>
                            )}
                            <div className="mb-3 text-end">
                                <button type="submit" className="btn btn-primary">Save course</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;
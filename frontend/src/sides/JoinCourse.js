import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getCourses, joinCourse, leaveCourse, stopOwnership } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

function JoinCourse() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [courses, setCourses] = useState([]);
    const [currentSelectedCourse, setCurrentSelectedCourse] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCourses(username);
                if (data.isSuccess) {
                    setCourses(data.data);
                }
                else {
                    alert(data.message)
                }
            } catch (error) {
                alert('Error fetching courses:', error);
            }
        };

        fetchData();
    }, []);

    const handleJoin = async (course) => {
        if (course.isPasswordProtected) {
            setCurrentSelectedCourse(course);
            togglePopup();
            return;
        }

        //await joinCourse(courseId, username);

        const data = await getCourses(username);
        if (data.isSuccess) {
            setCourses(data.data);
        }
        else {
            alert(data.message)
        }
    };

    const checkJoinPassword = async () => {

    }

    const handleLeave = async (course) => {
        //await leaveCourse(courseId, username);

        const data = await getCourses(username);
        if (data.isSuccess) {
            setCourses(data.data);
        }
        else {
            alert(data.message)
        }
    };

    const handleStopOwnership = async (course) => {
        if (course.ownersCount == 1) {
            alert("You cannot stop ownership if you are the only owner!");
            return;
        }

        //await stopOwnership(courseId, username);

        const data = await getCourses(username);
        if (data.isSuccess) {
            setCourses(data.data);
        }
        else {
            alert(data.message)
        }
    };

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-body">
                    <div className="container mt-4">
                        {currentCourses.map((course) => (
                            <div className="card mb-4" key={course.id}>
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text">{course.description}</p>
                                    {course.isOwner ? (
                                        <button className="btn btn-danger" onClick={() => handleStopOwnership(course)}>
                                            Stop Ownership
                                        </button>
                                    ) : course.isInGroup ? (
                                        <button className="btn btn-warning" onClick={() => handleLeave(course)}>
                                            Leave
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => handleJoin(course)}>
                                            Join
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[...Array(Math.ceil(courses.length / coursesPerPage)).keys()].map(number => (
                                    <li key={number + 1} className="page-item">
                                        <button onClick={() => paginate(number + 1)} className="page-link">
                                            {number + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        {showPopup && (
                            <>
                                <div className="modal-backdrop show" style={{ zIndex: 1049 }} onClick={togglePopup}></div>
                                <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <div className='col-md-6'>
                                                    <h5 className="modal-title">Type course password</h5>
                                                </div>
                                                <div className='col-md-6 text-end'>
                                                    <button type="button" className="btn-close" aria-label="Close" onClick={togglePopup}></button>
                                                </div>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label htmlFor="registerPasswordInput" className="form-label">Password</label>
                                                    <input type="password" className="form-control" id="registerPasswordInput" placeholder="Password" />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" style={{ marginRight: "5px" }} onClick={() => checkJoinPassword()}>Save</button>
                                                <button type="button" className="btn btn-secondary" onClick={togglePopup}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
}

export default JoinCourse;
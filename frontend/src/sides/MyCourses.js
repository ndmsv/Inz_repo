import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getMyCourses, joinCourse, leaveCourse, stopOwnership } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

function MyCourses() {
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
                const data = await getMyCourses(username);
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

    const handleLeave = async (course) => {
        //await leaveCourse(courseId, username);

        const data = await getMyCourses(username);
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

        const data = await getMyCourses(username);
        if (data.isSuccess) {
            setCourses(data.data);
        }
        else {
            alert(data.message)
        }
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
                        {currentCourses.length > 0 ? (
                            currentCourses.map((course) => (
                                <div className="card mb-4" key={course.id}>
                                    <div className="card-body">
                                        <h5 className="card-title">{course.name}</h5>
                                        <p className="card-text">{course.description}</p>
                                        {course.isOwner ? (
                                            <button className="btn btn-danger" onClick={() => handleStopOwnership(course)}>
                                                Stop Ownership
                                            </button>
                                        ) : (
                                            <button className="btn btn-danger" onClick={() => handleLeave(course)}>
                                                Leave
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "30vh" }}>
                                <h3>You are not a member of any course now!</h3>
                                <br />
                                <h5>Go to 'Join Course' page to become a member.</h5>
                            </div>
                        )}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyCourses;
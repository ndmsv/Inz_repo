import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import { getMyCourses, leaveCourse, stopOwnership, getEligibleUsers, addNewOwners, deleteCourse } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import './MyCourses.css';
import '../Global/Global.css';

function MyCourses() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [courses, setCourses] = useState([]);
    const [currentSelectedCourse, setCurrentSelectedCourse] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const [showAddUsersPopup, setShowAddUsersPopup] = useState(false);
    const [eligibleUsers, setEligibleUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getMyCourses(username);
                if (data.isSuccess) {
                    setCourses(data.data);
                }
                else {
                    alert(data.message)
                }
            } catch (error) {
                alert('Error fetching courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleAddUsersPopup = () => {
        setCurrentSelectedCourse([]);
        setSelectedUsers([]);
        setShowAddUsersPopup(!showAddUsersPopup);
    };

    const handleLeave = async (course) => {
        const confirmStop = window.confirm('Are you sure you want to leave the course?');
        if (!confirmStop) {
            return;
        }

        const leaveCourseResponse = await leaveCourse(course.id, username);
        alert(leaveCourseResponse.message);

        if (leaveCourseResponse.isSuccess) {
            const data = await getMyCourses(username);
            if (data.isSuccess) {
                setCourses(data.data);
            }
            else {
                alert(data.message)
            }
        }
    };

    const handleStopOwnership = async (course) => {
        const confirmStop = window.confirm('Are you sure you want to stop being an owner?');
        if (!confirmStop) {
            return;
        }

        if (course.ownersCount === 1) {
            alert('You cannot stop ownership if you are the only owner!');
            return;
        }

        const stopOwnershipResponse = await stopOwnership(course.id, username);
        alert(stopOwnershipResponse.message);

        if (stopOwnershipResponse.isSuccess) {
            const data = await getMyCourses(username);
            if (data.isSuccess) {
                setCourses(data.data);
            }
            else {
                alert(data.message)
            }
        }
    };

    const handleAddOwners = async (course) => {
        const response = await getEligibleUsers(course.id);
        if (response.isSuccess) {
            setEligibleUsers(response.data);
            toggleAddUsersPopup();
            setCurrentSelectedCourse(course);
        } else {
            alert(response.message);
        }
    };

    const handleSelectUser = (user) => {
        if (!selectedUsers.includes(user.id)) {
            setSelectedUsers([...selectedUsers, user.id]);
        } else {
            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
        }
    };

    const saveNewOwners = async () => {
        if (currentSelectedCourse.length !== 0 && selectedUsers.length !== 0) {
            const response = await addNewOwners(currentSelectedCourse.id, selectedUsers);
            if (response.isSuccess) {
                alert('Owners added successfully!');

                const data = await getMyCourses(username);
                if (data.isSuccess) {
                    setCourses(data.data);
                }
                else {
                    alert(data.message)
                }

                toggleAddUsersPopup();
            } else {
                alert(response.message);
            }
        }
        else if (selectedUsers.length === 0) {
            alert('No user has been selected!')
        }
        else {
            alert('An error occurred - no course has been selected.')
        }
    };

    const handleNavigateToCourseDetails = (course) => {
        navigate('/courseDetails', { state: { course } });
    };

    const handleDeleteCourse = async (course) => {
        const confirmStop = window.confirm('Are you sure you want to delete course?');
        if (!confirmStop) {
            return;
        }

        const deleteCourseResponse = await deleteCourse(course.id);
        alert(deleteCourseResponse.message);

        if (deleteCourseResponse.isSuccess) {
            const data = await getMyCourses(username);
            if (data.isSuccess) {
                setCourses(data.data);
            }
            else {
                alert(data.message)
            }
        }
    };

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='parent-div'>
            <Navbar />
            <div className='panel panel-default'>
                <div className='panel-body'>
                        <div className='col-md-12 mt-5'>
                            <div className='d-flex flex-wrap'>
                                {isLoading ? (
                                    <div className='d-flex justify-content-center align-items-center' style={{ height: '30vh' }}>
                                        <div className='spinner-border text-primary' role='status'>
                                            <span className='sr-only'></span>
                                        </div>
                                    </div>
                                ) : currentCourses.length > 0 ? (
                                    currentCourses.map((course, index) => (
                                        <div key={course.id} className='card mb-4 me-2' style={{ width: '40%' }}>
                                            <div className='card-body text-center d-flex flex-column'> {/* Flex column container */}
                                                <div className='card-content'>
                                                    <h5 className='card-title'>{course.name}</h5>
                                                    <p className='card-subtitle mb-2 text-muted'>{course.description}</p>
                                                </div>
                                                <div className='card-actions'>
                                                    <div className='row'>
                                                        <div className='col-md-6 text-start'>
                                                            {course.canAddOwners && (
                                                                <button className='btn btn-success me-1' onClick={() => handleAddOwners(course)}>
                                                                    Add owners
                                                                </button>
                                                            )}
                                                            <button className='btn btn-primary me-1' onClick={() => handleNavigateToCourseDetails(course)}>
                                                                Course details
                                                            </button>
                                                        </div>
                                                        <div className='col-md-6 text-end'>
                                                            {course.isOwner ? (
                                                                <button className='btn btn-danger me-1' onClick={() => handleStopOwnership(course)}>
                                                                    Stop ownership
                                                                </button>
                                                            ) : (
                                                                <button className='btn btn-danger me-1' onClick={() => handleLeave(course)}>
                                                                    Leave course
                                                                </button>
                                                            )}
                                                            {course.canAddOwners && (
                                                                <button className='btn btn-danger me-1' onClick={() => handleDeleteCourse(course)}>
                                                                    Delete course
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '30vh' }}>
                                        <h3>You are not a member of any course now!</h3>
                                        <br />
                                        <h5>Go to 'Join Course' page to become a member.</h5>
                                    </div>
                                )}
                            </div>
                        </div>
                        <nav>
                            <ul className='pagination justify-content-center'>
                                {[...Array(Math.ceil(courses.length / coursesPerPage)).keys()].map(number => (
                                    <li key={number + 1} className='page-item'>
                                        <button onClick={() => paginate(number + 1)} className={`page-link ${currentPage === number + 1 ? 'page-link-active' : ''}`}>
                                            {number + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        {showAddUsersPopup && (
                            <>
                                <div className='modal-backdrop show' style={{ zIndex: 1049 }} onClick={toggleAddUsersPopup}></div>
                                <div className='modal d-block' tabIndex='-1' style={{ zIndex: 1050 }}>
                                    <div className='modal-dialog'>
                                        <div className='modal-content'>
                                            <div className='modal-header'>
                                                <div className='col-md'>
                                                    <h5 className='modal-title'>Select New Owners</h5>
                                                </div>
                                                <div className='col-md text-end'>
                                                    <button type='button' className='btn-close' aria-label='Close' onClick={toggleAddUsersPopup}></button>
                                                </div>
                                            </div>
                                            <div className='modal-body'>
                                                <table className='table'>
                                                    <thead>
                                                        <tr>
                                                            <th>Login</th>
                                                            <th>Name</th>
                                                            <th>Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {eligibleUsers.length > 0 ? (
                                                            eligibleUsers.map(user => (
                                                                <tr key={user.id}
                                                                    className={`cursor-pointer ${selectedUsers.includes(user.id) ? 'bg-selected' : ''}`}
                                                                    onClick={() => handleSelectUser(user)}
                                                                >
                                                                    <td>{user.login}</td>
                                                                    <td>{user.name}</td>
                                                                    <td>{user.typeName}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan='3' className='text-center'>There is no user that can become an owner.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className='modal-footer'>
                                                {eligibleUsers.length > 0 ? (
                                                    <button type='button' className='btn btn-primary' onClick={() => saveNewOwners()}>Add Selected</button>
                                                ) : ''}
                                                <button type='button' className='btn btn-secondary' onClick={toggleAddUsersPopup}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
    );
}

export default MyCourses;
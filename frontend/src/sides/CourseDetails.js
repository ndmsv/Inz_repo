import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getCourseTasks } from '../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function CourseDetails() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const selectedCourse = location.state.course;
    const [showPopup, setShowPopup] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!selectedCourse) {
                    alert("Course is not defined correctly!");
                    navigate("/myCourses");
                }

                setIsLoading(true);
                const data = await getCourseTasks(selectedCourse.id);
                if (data.isSuccess) {
                    setTasks(data.data);
                }
                else {
                    alert(data.message)
                }
            } catch (error) {
                alert('Error fetching course details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleReturn = () => {
        navigate("/myCourses");
    };

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const saveTask = async () => {
        const taskDetails = {
            name: document.getElementById('taskNameInput').value,
            description: document.getElementById('taskDescriptionInput').value,
            openingDate: startDate,
            closingDate: endDate,
        };
        // Make an API call or handle the data submission as needed
        console.log(taskDetails); // Replace with actual API call
        togglePopup(); // Close the modal after saving
    };

    const indexOfLastCourse = currentPage * tasksPerPage;
    const indexOfFirstCourse = indexOfLastCourse - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstCourse, indexOfLastCourse);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row mt-3 me-0">
                        <div className="col-md-2">
                            <button type="button" className="btn btn-primary ms-2" onClick={() => togglePopup()}>New task</button>
                        </div>
                        <div className="col-md-8 text-center">
                            <h5 className="card-title ms-3 mb-2">{selectedCourse.name}</h5>
                            <p className="card-text ms-3">{selectedCourse.description}</p>
                        </div>
                        <div className="col-md-2 text-end">
                            <button type="button" className="btn btn-secondary" onClick={() => handleReturn()}>Back</button>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="container mt-4">
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "30vh" }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only"></span>
                                </div>
                            </div>
                        ) : currentTasks.length > 0 ? (
                            currentTasks.map((task) => (
                                <div className="card mb-4" key={task.id}>
                                    <div className="card-body">
                                        <h5 className="card-title">{task.name}</h5>
                                        <p className="card-text">{task.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "30vh" }}>
                                <h3>There are no available tasks now!</h3>
                            </div>
                        )}
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[...Array(Math.ceil(tasks.length / tasksPerPage)).keys()].map(number => (
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
                                                <h5 className="modal-title">Create New Task</h5>
                                                <button type="button" className="btn-close" aria-label="Close" onClick={togglePopup}></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label htmlFor="taskNameInput" className="form-label">Task Name</label>
                                                    <input type="text" className="form-control" id="taskNameInput" placeholder="Enter task name" />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="taskDescriptionInput" className="form-label">Task Description</label>
                                                    <textarea className="form-control" id="taskDescriptionInput" placeholder="Enter task description"></textarea>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="taskOpeningDateInput" className="form-label">Opening Date</label>
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={date => setStartDate(date)}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={15}
                                                        timeCaption="time"
                                                        dateFormat="MMMM d, yyyy h:mm aa"
                                                        className="form-control"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="taskClosingDateInput" className="form-label">Closing Date</label>
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={date => setEndDate(date)}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={15}
                                                        timeCaption="time"
                                                        dateFormat="MMMM d, yyyy h:mm aa"
                                                        className="form-control"
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-primary" style={{ marginRight: "5px" }} onClick={() => saveTask()}>Save</button>
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

export default CourseDetails;
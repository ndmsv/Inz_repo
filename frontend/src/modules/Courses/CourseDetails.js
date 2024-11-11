import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import { getCourseTasks, checkIfOwnerOrAdmin, saveCourseTask, updateCourseTask, deleteTask, checkSubmissionsInCourse } from '../../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CourseDetails.css';
import '../Global/Global.css';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

function CourseDetails() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const selectedCourse = location.state ? location.state.course : null;
    const [showNewTaskPopup, setShowNewTaskPopup] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
    const [isLimitedAttachments, setIsLimitedAttachments] = useState(false);
    const [attachmentNumber, setAttachmentNumber] = useState('');
    const [isLimitedAttachmentType, setIsLimitedAttachmentType] = useState(false);
    const [attachmentTypes, setAttachmentTypes] = useState([]);
    const [attachmentTypeInput, setAttachmentTypeInput] = useState('');
    const [currentSelectedTask, setCurrentSelectedTask] = useState([]);
    const [isTaskInEdit, setIsTaskInEdit] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [showCheckUsersPopup, setShowCheckUsersPopup] = useState(false);
    const [courseSubmitters, setCourseSubmitters] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    useEffect(() => {
        if (selectedCourse === null) {
            alert('Course is not defined correctly!');
            navigate('/myCourses');
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getCourseTasks(selectedCourse.id, username);
                if (data.isSuccess) {
                    setTasks(data.data);
                }
                else {
                    alert(data.message)
                }

                const ownerData = await checkIfOwnerOrAdmin(username, selectedCourse.id);
                if (ownerData.isSuccess) {
                    setIsOwnerOrAdmin(ownerData.data.isOwnerOrAdmin);
                }
                else {
                    alert(ownerData.message)
                }
            } catch (error) {
                alert('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCourse, navigate]);

    const handleReturn = () => {
        navigate('/myCourses');
    };

    const toggleNewTaskPopup = () => {
        setIsTaskInEdit(false);
        setCurrentSelectedTask([]);

        setTaskName('');
        setTaskDescription('');
        setAttachmentNumber('');
        setAttachmentTypeInput('');
        setAttachmentTypes([]);
        setIsLimitedAttachments(false);
        setIsLimitedAttachmentType(false);

        const now = new Date();
        now.setSeconds(0, 0);
        setStartDate(now);
        setEndDate(now);

        setShowNewTaskPopup(!showNewTaskPopup);
    };

    const saveTask = async () => {
        const openingDate = startDate;
        const closingDate = endDate;
        const courseID = selectedCourse.id;

        if (taskName === '') {
            alert('You cannot create a task without a task name!');
            return;
        }

        if (openingDate === null || closingDate === null) {
            alert('Both dates must have assigned value!');
            return;
        }

        if (openingDate >= closingDate) {
            alert('Closing date must come after opening date!');
            return;
        }

        if (isLimitedAttachments) {
            if (!attachmentNumber) {
                alert('You must specify the maximum number of attachments!');
                return;
            }

            const attachmentNum = parseInt(attachmentNumber);
            if (isNaN(attachmentNum) || attachmentNum <= 0) {
                alert('Maximum number of attachments must be a positive integer!');
                return;
            }

            setAttachmentNumber(attachmentNum);
        }

        if (isLimitedAttachmentType) {
            if (attachmentTypes.length === 0) {
                alert('You must specify at least one file type!');
                return;
            }
        }

        const attachmentTypesString = attachmentTypes.join(';') === '' ? null : attachmentTypes.join(';');
        const attachmentNumberResult = attachmentNumber === '' ? null : attachmentNumber;

        let saveCourseTaskResponse;

        if (!isTaskInEdit)
            saveCourseTaskResponse = await saveCourseTask(courseID, taskName, taskDescription, openingDate, closingDate, isLimitedAttachments, attachmentNumberResult,
                isLimitedAttachmentType, attachmentTypesString);
        else
            saveCourseTaskResponse = await updateCourseTask(currentSelectedTask.taskId, courseID, taskName, taskDescription, openingDate, closingDate, isLimitedAttachments, attachmentNumberResult,
                isLimitedAttachmentType, attachmentTypesString);

        alert(saveCourseTaskResponse.message);

        if (saveCourseTaskResponse.isSuccess) {
            const data = await getCourseTasks(selectedCourse.id, username);
            if (data.isSuccess) {
                setTasks(data.data);
            }
            else {
                alert(data.message)
            }

            toggleNewTaskPopup();
        }
    };

    const handleAddAttachmentType = () => {
        if (attachmentTypeInput.startsWith('.') && !attachmentTypeInput.includes(' ') && !attachmentTypeInput.includes(';') && !attachmentTypeInput.includes(',')
            && attachmentTypeInput.trim() !== '.') {
            setAttachmentTypes(prev => [...prev, attachmentTypeInput.trim()]);
            setAttachmentTypeInput('');
        } else {
            alert('Invalid file type. It must start with a "." and contain no spaces or any special signs.');
        }
    };

    const handleDeleteAttachmentType = (index) => {
        setAttachmentTypes(prev => prev.filter((_, i) => i !== index));
    };

    const handleLimitedAttachments = (limitedAttachments) => {
        setAttachmentNumber('');
        setIsLimitedAttachments(limitedAttachments);
    };


    const handleLimitedAttachmentTypes = (limitedAttachmentTypes) => {
        setAttachmentTypeInput('');
        setAttachmentTypes([]);
        setIsLimitedAttachmentType(limitedAttachmentTypes);
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(date, timezone, 'dd MMMM yyyy HH:mm');
    };


    const toggleEditTaskPopup = (task) => {
        setIsTaskInEdit(!isTaskInEdit);
        setCurrentSelectedTask(task);

        const attachmentTypes = task.attachmentTypes ? task.attachmentTypes.split(';') : [];
        setAttachmentTypes(attachmentTypes);
        setAttachmentTypeInput('');
        setIsLimitedAttachments(task.limitedAttachments);
        setIsLimitedAttachmentType(task.limitedAttachmentTypes);
        setAttachmentNumber(task.attachmentsNumber);

        setTaskName(task.taskName);
        setTaskDescription(task.taskDescription);

        setStartDate(new Date(task.openingDate));
        setEndDate(new Date(task.closingDate));

        setShowNewTaskPopup(!showNewTaskPopup);
    };

    const handleDelete = async (task) => {
        const confirmStop = window.confirm('Are you sure you want to delete the task?');
        if (!confirmStop) {
            return;
        }

        const deleteTaskResponse = await deleteTask(task.taskId, username);
        alert(deleteTaskResponse.message);

        if (deleteTaskResponse.isSuccess) {
            const data = await getCourseTasks(selectedCourse.id, username);
            if (data.isSuccess) {
                setTasks(data.data);
            }
            else {
                alert(data.message)
            }
        }
    };

    const handleNavigateToTaskSubmissions = (task) => {
        navigate('/taskSubmissions', { state: { task, course: selectedCourse, selectedUser: null } });
    };

    const toggleCheckUsersPopup = () => {
        setCurrentSelectedTask([]);
        setSelectedUser([]);
        setShowCheckUsersPopup(!showCheckUsersPopup);
    };

    const handleCheckSubmissions = async (task) => {
        const response = await checkSubmissionsInCourse(selectedCourse.id, task.taskId);
        if (response.isSuccess) {
            setCourseSubmitters(response.data);
            toggleCheckUsersPopup();
            setCurrentSelectedTask(task);
        } else {
            alert(response.message);
        }
    };

    const handleSelectUser = (user) => {
        if (selectedUser.userID !== user.userID) {
            setSelectedUser(user);
        } else {
            setSelectedUser([]);
        }
    };

    const handleToTaskSubmissionsForUser = () => {
        navigate('/taskSubmissions', { state: { task: currentSelectedTask, course: selectedCourse, selectedUser } });
    };

    const indexOfLastCourse = currentPage * tasksPerPage;
    const indexOfFirstCourse = indexOfLastCourse - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstCourse, indexOfLastCourse);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='parent-div'>
            <Navbar />
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <div className='row mt-3 me-0'>
                        <div className='col-md-2'>
                            {isOwnerOrAdmin &&
                                <button type='button' className='btn btn-primary ms-2' onClick={() => toggleNewTaskPopup()}>New task</button>
                            }
                        </div>
                        <div className='col-md-8 text-center'>
                            <h5 className='card-title mb-2'>{selectedCourse ? selectedCourse.name : ''}</h5>
                            <p className='card-subtitle mb-2 text-muted'>{selectedCourse ? selectedCourse.description : ''}</p>
                        </div>
                        <div className='col-md-2 text-end'>
                            <button type='button' className='btn btn-secondary' onClick={() => handleReturn()}>Back</button>
                        </div>
                    </div>
                </div>
                <div className='panel-body'>
                    <div className='col-md-12 mt-5'>
                        <div className='d-flex flex-wrap'>
                            {isLoading ? (
                                <div className='d-flex justify-content-center align-items-center' style={{ height: '30vh' }}>
                                    <div className='spinner-border text-primary' role='status'>
                                        <span className='sr-only'></span>
                                    </div>
                                </div>
                            ) : currentTasks.length > 0 ? (
                                currentTasks.map((task) => (
                                    <div className='card mb-4 me-2' key={task.taskId} style={{ width: '45%' }}>
                                        <div className='card-body text-center d-flex flex-column'>
                                            <div className='card-content'>
                                                <h5 className='card-title'>{task.taskName}</h5>
                                                <p className='card-text'>Opening date: {formatDate(task.openingDate)}</p>
                                                <p className='card-text'>Closing date: {formatDate(task.closingDate)}</p>
                                                {task.isSubmission &&
                                                    <>
                                                        <p className='card-text'>Submitted on: {formatDate(task.addedOn)}</p>
                                                        <p className='card-text' style={{ color: task.isSubmissionTimeCorrect ? 'green' : 'red' }}>Submitted {task.submissionTimeDifference} {task.isSubmissionTimeCorrect ? 'before' : 'after'} closing</p>
                                                    </>
                                                }
                                            </div>
                                            <div className='card-actions'>
                                                <div className='row'>
                                                    <div className='col-8 text-start'>
                                                    {isOwnerOrAdmin && (
                                                            <button className='btn btn-primary me-1' onClick={() => handleCheckSubmissions(task)}>
                                                                Check submissions
                                                            </button>
                                                        )}
                                                        {task.isOpened &&
                                                            <button className='btn btn-success me-1' onClick={() => handleNavigateToTaskSubmissions(task)}>
                                                                {task.isSubmission ? 'Edit submission' : 'Submit data'}
                                                            </button>
                                                        }
                                                        {isOwnerOrAdmin && (
                                                            <button className='btn btn-primary me-1' onClick={() => toggleEditTaskPopup(task)}>
                                                                Edit task
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className='col-4 text-end'>
                                                        {isOwnerOrAdmin && (
                                                            <button className='btn btn-danger me-1' onClick={() => handleDelete(task)}>
                                                                Delete task
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
                                    <h3>There are no available tasks now!</h3>
                                </div>
                            )}
                        </div>
                    </div>
                    <nav>
                        <ul className='pagination justify-content-center'>
                            {[...Array(Math.ceil(tasks.length / tasksPerPage)).keys()].map(number => (
                                <li key={number + 1} className='page-item'>
                                    <button onClick={() => paginate(number + 1)} className={`page-link ${currentPage === number + 1 ? 'page-link-active' : ''}`}>
                                        {number + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {showNewTaskPopup && (
                        <>
                            <div className='modal-backdrop show' style={{ zIndex: 1049 }} onClick={toggleNewTaskPopup}></div>
                            <div className='modal d-block' tabIndex='-1' style={{ zIndex: 1050 }}>
                                <div className='modal-dialog'>
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <h5 className='modal-title'>Create New Task</h5>
                                            <button type='button' className='btn-close' aria-label='Close' onClick={toggleNewTaskPopup}></button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='mb-3'>
                                                <label htmlFor='taskNameInput' className='form-label'>Task Name</label>
                                                <input type='text' className='form-control' id='taskNameInput' value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder='Enter task name' />
                                            </div>
                                            <div className='mb-3'>
                                                <label htmlFor='taskDescriptionInput' className='form-label'>Task Description</label>
                                                <textarea className='form-control' id='taskDescriptionInput' value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder='Enter task description'></textarea>
                                            </div>
                                            <div className='mb-3'>
                                                <label className='form-label'>Opening Date</label>
                                                <br />
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={date => setStartDate(date)}
                                                    timeCaption='time'
                                                    dateFormat='dd MMMM yyyy HH:mm'
                                                    className='form-control'
                                                    wrapperClassName='wrapper-class'
                                                    timeInputLabel='Time: '
                                                    showTimeInput
                                                />
                                            </div>
                                            <div className='mb-3'>
                                                <label className='form-label'>Closing Date</label>
                                                <br />
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={date => setEndDate(date)}
                                                    timeCaption='time'
                                                    dateFormat='dd MMMM yyyy HH:mm'
                                                    className='form-control'
                                                    wrapperClassName='wrapper-class'
                                                    timeInputLabel='Time: '
                                                    timeClassName='form-control'
                                                    showTimeInput
                                                />
                                            </div>
                                            <div className='form-check mb-2'>
                                                <input className='form-check-input' type='checkbox' checked={isLimitedAttachments} onChange={() => handleLimitedAttachments(!isLimitedAttachments)} id='limitedAttachmentsCheck' />
                                                <label className='form-check-label' htmlFor='limitedAttachmentsCheck'>
                                                    Limited Attachments Number
                                                </label>
                                            </div>
                                            {isLimitedAttachments && (
                                                <div className='mb-3'>
                                                    <input type='number' className='form-control' value={attachmentNumber} onChange={(e) => setAttachmentNumber(e.target.value)} placeholder='Enter max number of attachments' />
                                                </div>
                                            )}
                                            <div className='form-check mb-2'>
                                                <input className='form-check-input' type='checkbox' checked={isLimitedAttachmentType} onChange={() => handleLimitedAttachmentTypes(!isLimitedAttachmentType)} id='limitedAttachmentTypeCheck' />
                                                <label className='form-check-label' htmlFor='limitedAttachmentTypeCheck'>
                                                    Limited Attachment Types
                                                </label>
                                            </div>
                                            {isLimitedAttachmentType && (
                                                <div className='mb-3'>
                                                    <input type='text' className='form-control' value={attachmentTypeInput} onChange={(e) => setAttachmentTypeInput(e.target.value)} onKeyPress={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            handleAddAttachmentType();
                                                            e.preventDefault();
                                                        }
                                                    }} placeholder='Enter file type (e.g., .jpg) and press Enter or Space' />
                                                    <div className='mt-2'>
                                                        {attachmentTypes.map((type, index) => (
                                                            <div key={index} className='badge bg-secondary me-2 align-items-center'>
                                                                {type}
                                                                <button className='btn btn-sm btn-close' style={{ background: 'transparent var(--bs-btn-close-bg) center/0.7em auto no-repeat' }} onClick={() => handleDeleteAttachmentType(index)} aria-label='Remove'></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className='modal-footer'>
                                            <button type='button' className='btn btn-primary' style={{ marginRight: '5px' }} onClick={() => saveTask()}>Save</button>
                                            <button type='button' className='btn btn-secondary' onClick={toggleNewTaskPopup}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {showCheckUsersPopup && (
                        <>
                            <div className='modal-backdrop show' style={{ zIndex: 1049 }} onClick={toggleCheckUsersPopup}></div>
                            <div className='modal custom-modal d-block' tabIndex='-1' style={{ zIndex: 1050 }}>
                                <div className='modal-dialog'>
                                    <div className='modal-content' style={{ width: 'max-content' }}>
                                        <div className='modal-header'>
                                            <div className='col-md-6'>
                                                <h5 className='modal-title'>Check user submissions</h5>
                                            </div>
                                            <div className='col-md-6 text-end'>
                                                <button type='button' className='btn-close' aria-label='Close' onClick={toggleCheckUsersPopup}></button>
                                            </div>
                                        </div>
                                        <div className='modal-body'>
                                            <table className='table'>
                                                <thead>
                                                    <tr>
                                                        <th>Login</th>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Submitted</th>
                                                        <th>Submitted before closing</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courseSubmitters.length > 0 ? (
                                                        courseSubmitters.map(user => (
                                                            <tr key={user.userID}
                                                                className={`cursor-pointer ${selectedUser.userID === user.userID ? 'bg-selected' : user.isSubmissionTimeCorrect ? 'bg-correct' : 'bg-incorrect'}`}
                                                                onClick={() => handleSelectUser(user)}
                                                            >
                                                                <td>{user.login}</td>
                                                                <td>{user.fullName}</td>
                                                                <td>{user.typeName}</td>
                                                                <td>{user.isSubmitted ? 'Yes' : 'No'}</td>
                                                                <td>{user.isSubmissionTimeCorrect ? 'Yes' : 'No'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan='3' className='text-center'>There is no user in that course.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='modal-footer'>
                                            {selectedUser.length !== 0 ? (
                                                <button type='button' className='btn btn-primary' onClick={handleToTaskSubmissionsForUser}>Check selected</button>
                                            ) : ''}
                                            <button type='button' className='btn btn-secondary' onClick={toggleCheckUsersPopup}>Cancel</button>
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

export default CourseDetails;
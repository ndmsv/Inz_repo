import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getCourseTasks, checkIfOwnerOrAdmin, saveCourseTask, updateCourseTask, deleteTask } from '../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import './Global.css';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

function TaskSubmissions() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const selectedCourse = (location.state && location.state.course) ? location.state.course : null;
    const selectedTask = (location.state && location.state.task) ? location.state.task : null;
    const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
    const [isLimitedAttachments, setIsLimitedAttachments] = useState(false);
    const [attachmentNumber, setAttachmentNumber] = useState('');
    const [isLimitedAttachmentType, setIsLimitedAttachmentType] = useState(false);
    const [attachmentTypes, setAttachmentTypes] = useState([]);
    const [attachmentTypeInput, setAttachmentTypeInput] = useState('');
    const [currentSelectedTask, setCurrentSelectedTask] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (selectedCourse === null || selectedTask === null) {
            alert("Course or task are not defined correctly!");
            navigate("/courseDetails", { state: { course: selectedCourse } });
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);

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
        navigate("/courseDetails", { state: { course: selectedCourse } });
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(date, timezone, 'dd MMMM yyyy HH:mm');
    };

    const formatAttachmentTypes = (attachmentTypesString) => {
        return attachmentTypesString.replace(/;/g, ', ');
    };

    function handleFileChange(event) {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
    }

    function handleSubmitFiles() {
        if (selectedTask.limitedAttachments && files.length > selectedTask.attachmentsNumber) {
            alert(`You can only upload up to ${selectedTask.attachmentsNumber} files.`);
            return;
        }

        const allowedTypes = selectedTask.limitedAttachmentTypes ? selectedTask.attachmentTypes.split(';') : [];
        if (selectedTask.limitedAttachmentTypes && !files.every(file => allowedTypes.includes(file.type))) {
            alert('One or more files are of a type not permitted.');
            return;
        }

        alert('Files uploaded successfully!');
    }

    function handleDownload(file) {
        // Implement file download logic
    }
    
    function handleDelete(file) {
        setFiles(files.filter(f => f !== file));
    }

    return (
        <div>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row mt-3 me-0">
                        <div className="col-md-2">
                        </div>
                        <div className="col-md-8 text-center">
                            <h5 className="card-title mb-2">{selectedTask ? selectedTask.taskName : ""}</h5>
                            <p className="card-subtitle mb-2 text-muted">{selectedTask ? selectedTask.taskDescription : ""}</p>
                        </div>
                        <div className="col-md-2 text-end">
                            <button type="button" className="btn btn-secondary" onClick={() => handleReturn()}>Back</button>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="row ms-2 me-2 mt-3">
                        <div className="col-md-3">
                            <label htmlFor="loginInput" className="form-label">Opening date</label>
                            <input type="text" className="form-control" id="tbOpeningDate" disabled="true" value={selectedTask ? formatDate(selectedTask.openingDate) : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="loginInput" className="form-label">Closing date</label>
                            <input type="text" className="form-control" id="tbClosingDate" disabled="true" value={selectedTask ? formatDate(selectedTask.closingDate) : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="loginInput" className="form-label">Limeted attachments number</label>
                            <input type="text" className="form-control" id="tbAttachmentsNumber" disabled="true" value={selectedTask ? (selectedTask.limitedAttachments ? selectedTask.attachmentsNumber : "Unlimited") : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="loginInput" className="form-label">Limited attachment types</label>
                            <textarea type="text" rows="1" className="form-control" id="tbAttachmentTypes" disabled="true" value={selectedTask ? (selectedTask.limitedAttachmentTypes ? formatAttachmentTypes(selectedTask.attachmentTypes) : "Unlimited") : ""} />
                        </div>
                    </div>
                    <div className="row ms-2 me-2 mt-3">
                        <div className="col-md-6">
                            <input type="file" className="form-control" multiple onChange={handleFileChange} />
                        </div>
                        <div className="col-md-6">
                            <button className="btn btn-primary" onClick={handleSubmitFiles}>Upload</button>
                        </div>
                    </div>
                    <div className="row mt-3 ms-2 me-2">
                        <div className="col-md-2">
                            {files.map((file, index) => (
                                <div key={index} className="card mb-4">
                                    <div className="card-body text-center">
                                    <h6 className="card-title">{file.name}</h6>
                                    <button className="btn btn-success btn-sm me-1" onClick={() => handleDownload(file)}>Download</button>
                                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(file)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskSubmissions;
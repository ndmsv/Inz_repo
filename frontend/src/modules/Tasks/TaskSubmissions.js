import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import { checkIfOwnerOrAdmin, saveTaskSubmission, getTaskSubmissions, downloadFile } from '../../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Global/Global.css';
import './TaskSubmissions.css';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import JSZip from 'jszip';

function TaskSubmissions() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const selectedCourse = (location.state && location.state.course) ? location.state.course : null;
    const selectedTask = (location.state && location.state.task) ? location.state.task : null;
    const selectedUser = (location.state && location.state.selectedUser) ? location.state.selectedUser : null;
    const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
    const [files, setFiles] = useState([]);
    const [submissionNote, setSubmissionNote] = useState('');

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

                const submissionsData = await getTaskSubmissions(selectedTask.taskId, selectedUser ? selectedUser.login : username);
                if (submissionsData.isSuccess && submissionsData.data.length > 0) {

                    const submission = submissionsData.data[0];
                    setSubmissionNote(submission.submissionNote);

                    fetchAndSetFiles(submission.attachments);
                } else if (!submissionsData.isSuccess) {
                    alert(submissionsData.message || "Failed to load submissions");
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

    const fetchAndSetFiles = async (attachments) => {
        setFiles([]);
        for (const attachment of attachments) {
            const result = await downloadFile(attachment.attachmentID);
            if (result.isSuccess && result.data) {
                try {
                    const file = new File([result.data], attachment.fileName, { type: 'application/octet-stream' });
                    setFiles(prevFiles => [...prevFiles, file]);
                } catch (error) {
                    console.error("Error creating file from blob: ", error);
                }
            } else {
                console.error("Failed to download file: ", attachment.fileName);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(date, timezone, 'dd MMMM yyyy HH:mm');
    };

    const formatAttachmentTypes = (attachmentTypesString) => {
        return attachmentTypesString.replace(/;/g, ', ');
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedTask.limitedAttachments && (selectedFiles.length + files.length) > selectedTask.attachmentsNumber) {
            alert(`You can only upload up to ${selectedTask.attachmentsNumber} files total.`);
            return;
        }

        const allowedTypes = selectedTask.limitedAttachmentTypes ? selectedTask.attachmentTypes.split(';').map(type => type.trim()) : [];
        const invalidFiles = selectedFiles.filter(file => !allowedTypes.some(type => file.name.endsWith(type)));
        if (selectedTask.limitedAttachmentTypes && invalidFiles.length > 0) {
            alert('One or more files are of a type not permitted.');
            return;
        }

        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleDownload = (file) => {
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDelete = (file) => {
        setFiles(files.filter(f => f !== file));
    };

    const handleDownloadAll = () => {
        const zip = new JSZip();
        const folderName = `${selectedTask.taskName} - ${selectedUser? (selectedUser.fullName !== " " ? selectedUser.fullName: selectedUser.login) : username}`;
        const folder = zip.folder(folderName);

        files.forEach(file => {
            folder.file(file.name, file, { binary: true });
        });

        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                const link = document.createElement('a');
                const url = window.URL.createObjectURL(content);
                link.href = url;
                link.download = `${folderName}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error("Error zipping files:", error));
    };

    const handleSubmit = async () => {
        const result = await saveTaskSubmission(selectedTask.taskId, username, submissionNote, files);
        if (result.isSuccess) {
            alert('Submission saved successfully!');

            handleReturn();
        } else {
            alert(`Failed to save submission: ${result.message}`);
        }
    };

    return (
        <div className='parent-div'>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row mt-3 ms-0 me-0">
                        <div className="col-md-2">
                            <button type="button" className="btn btn-primary me-1" onClick={handleDownloadAll}>Download All</button>
                        </div>
                        <div className="col-md-8 text-center">
                            <h5 className="card-title mb-2">{selectedTask ? selectedTask.taskName : ""}</h5>
                            <p className="card-subtitle mb-2 text-muted">{selectedTask ? selectedTask.taskDescription : ""}</p>
                        </div>
                        <div className="col-md-2 text-end">
                            {!selectedUser &&
                                <button type="button" className="btn btn-success me-1" onClick={handleSubmit}>Save</button>
                            }
                            <button type="button" className="btn btn-secondary" onClick={handleReturn}>Back</button>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="row ms-2 me-2 mt-3">
                        <div className="col-md-3">
                            <label htmlFor="tbOpeningDate" className="form-label">Opening date</label>
                            <input type="text" className="form-control" id="tbOpeningDate" disabled={true} value={selectedTask ? formatDate(selectedTask.openingDate) : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="tbClosingDate" className="form-label">Closing date</label>
                            <input type="text" className="form-control" id="tbClosingDate" disabled={true} value={selectedTask ? formatDate(selectedTask.closingDate) : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="tbAttachmentsNumber" className="form-label">Limeted attachments number</label>
                            <input type="text" className="form-control" id="tbAttachmentsNumber" disabled={true} value={selectedTask ? (selectedTask.limitedAttachments ? selectedTask.attachmentsNumber : "Unlimited") : ""} />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="tbAttachmentTypes" className="form-label">Limited attachment types</label>
                            <textarea type="text" rows={1} className="form-control" id="tbAttachmentTypes" disabled={true} value={selectedTask ? (selectedTask.limitedAttachmentTypes ? formatAttachmentTypes(selectedTask.attachmentTypes) : "Unlimited") : ""} />
                        </div>
                    </div>
                    <div className="row ms-2 me-2 mt-3">
                        <div className="col-md-6 offset-md-3">
                            <label htmlFor="file-upload" className="form-label">
                                Submission notes
                            </label>
                            <textarea id="tbSubmissionNotes" className="form-control" rows={3} value={submissionNote} disabled={selectedUser} onChange={(e) => setSubmissionNote(e.target.value)} />
                        </div>
                    </div>
                    {!selectedUser &&
                        <div className="row ms-2 me-2 mt-3">
                            <div className="col-md-4 offset-md-4">
                                <label htmlFor="file-upload" className="btn btn-primary form-control">
                                    Choose Files
                                </label>
                                <input id="file-upload" type="file" className="form-control" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                            </div>
                        </div>
                    }
                    <div className="row mt-3 ms-2 me-2">
                        <div className="col-md-12">
                            <div className="d-flex flex-wrap">
                                {files.map((file, index) => (
                                    <div key={index} className="card mb-4 me-2" style={{ width: '18rem' }}>
                                        <div className="card-body text-center">
                                            <h6 className="card-title">{file.name}</h6>
                                            <button className="btn btn-success btn-sm me-1" onClick={() => handleDownload(file)}>Download</button>
                                            {!selectedUser &&
                                                <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(file)}>Delete</button>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskSubmissions;
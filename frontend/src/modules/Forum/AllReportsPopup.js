import React, { useState, useEffect } from 'react';
import { getReportsByPost, resolveReport, deletePost, resolveAllReports, getReportsForComment, deletePostComment } from '../../services/apiService';
import '../Global/Global.css';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import iconEdit from '../../assets/icon-edit.png';
import iconDelete from '../../assets/icon-delete.png';
import iconResolve from '../../assets/icon-resolve.png';

function AllReportsPopup({ togglePopup, username, post, comment, reloadPosts, showPostPopupHandler, showCommentPopupHandler }) {
    const [reports, setReports] = useState([]);
    const [reportType, setReportType] = useState('');
    const [resolveComment, setResolveComment] = useState([]);
    const [generalResolveComment, setGeneralResolveComment] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (comment == null) {
            setReportType('post');
            const result = await getReportsByPost(post.id, username);

            if (result.isSuccess) {
                const anyUnresolved = result.data.some(report => report.isResolved !== true);
                if(!anyUnresolved) {
                    togglePopup();
                    return;
                }
                
                setReports(result.data);
                setResolveComment(result.data.map(report => report.resolveComment || ''));
            } else {
                alert(`Failed to get reports: ${result.message}`);
            }
        } else {
            setReportType('comment');
            const result = await getReportsForComment(comment.id, username);

            if (result.isSuccess) {
                const anyUnresolved = result.data.some(report => report.isResolved !== true);
                if(!anyUnresolved) {
                    togglePopup();
                    return;
                }

                setReports(result.data);
                setResolveComment(result.data.map(report => report.resolveComment || ''));
            } else {
                alert(`Failed to get reports: ${result.message}`);
            }
        }
    };

    const handleCommentChange = (index, value) => {
        const updatedComments = [...resolveComment];
        updatedComments[index] = value;
        setResolveComment(updatedComments);
    };

    const setResolveReport = async (report, index) => {
        const resolveCommentValue = resolveComment[index];
        if (resolveCommentValue === '') {
            alert('Resolve comment cannot be empty.');
            return false;
        }

        const result = await resolveReport(report.id, username, resolveCommentValue);
        if (result.isSuccess) {
            return true;
        } else {
            alert(`Failed to resolve: ${result.message}`);
            return false;
        }
    };

    const resolveHandler = async (report, index) => {
        const confirm = window.confirm('Are you sure you want to resolve report?');
        if (!confirm) {
            return false;
        }

        const resolved = await setResolveReport(report, index);
        if (resolved) {
            alert('Report resolved succesfully.');
            fetchData();
            reloadPosts();
        }
    }

    const resolveAndEdit = async (report, index) => {
        const confirm = window.confirm(`Are you sure you want to resolve report and then edit the ${reportType}?`);
        if (!confirm) {
            return false;
        }

        const resolved = await setResolveReport(report, index);
        if (resolved) {
            togglePopup();
            if (reportType === 'post') {
                showPostPopupHandler(post.id);
            } else {
                showCommentPopupHandler(comment, post);
            }
        }
    };

    const resolveAndDelete = async (report, index) => {
        const confirm = window.confirm(`Are you sure you want to resolve report and then delete the ${reportType}?`);
        if (!confirm) {
            return false;
        }
        const resolved = await setResolveReport(report, index);
        if (resolved) {
            if (reportType === 'post') {
                handleDeletePost(post.id);
            } else {
                handleDeleteComment(comment.id);
            }
        }
    };

    const handleDeletePost = async (postID) => {
        const response = await deletePost(postID, username);
        alert(response.message);

        if (response.isSuccess) {
            togglePopup();
            reloadPosts();
        }
    };

    const handleDeleteComment = async (commentID) => {
        const response = await deletePostComment(commentID, username);
        alert(response.message);

        if (response.isSuccess) {
            togglePopup();
            reloadPosts();
        }
    };

    const setResolveAllReports = async () => {
        if (generalResolveComment === '') {
            alert('General resolve comment cannot be empty when you resolve all reports.');
            return false;
        }

        const commentID = comment !== null ? comment.id : null;

        const result = await resolveAllReports(post.id, commentID, username, generalResolveComment);
        if (result.isSuccess) {
            return true;
        } else {
            alert(`Failed to resolve: ${result.message}`);
            return false;
        }
    };

    const resolveAllHandler = async () => {
        const confirm = window.confirm('Are you sure you want to resolve all reports?');
        if (!confirm) {
            return false;
        }

        const resolved = await setResolveAllReports();
        if (resolved) {
            alert('Reports resolved succesfully.');
            reloadPosts();
            togglePopup();
        }
    }

    const resolveAllAndEdit = async () => {
        const confirm = window.confirm(`Are you sure you want to resolve all reports and then edit the ${reportType}?`);
        if (!confirm) {
            return false;
        }

        const resolved = await setResolveAllReports();
        if (resolved) {
            reloadPosts();
            togglePopup();

            if (reportType === 'post') {
                showPostPopupHandler(post.id);
            } else {
                showCommentPopupHandler(comment, post);
            }
        }
    };

    const resolveAllAndDelete = async () => {
        const confirm = window.confirm(`Are you sure you want to resolve all reports and then delete the ${reportType}?`);
        if (!confirm) {
            return false;
        }
        const resolved = await setResolveAllReports();
        if (resolved) {
            if (reportType === 'post') {
                handleDeletePost(post.id);
            } else {
                handleDeleteComment(comment.id);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(date, timezone, 'dd MMMM yyyy HH:mm');
    };

    return (
        <>
            <div className="modal-backdrop show" style={{ zIndex: 1049 }} onClick={togglePopup}></div>
            <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog" style={{ maxWidth: '50%' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="col-md-6">
                                <h5 className="modal-title">Reports on "{post.postTitle}"</h5>
                            </div>
                            <div className="col-md-6 text-end">
                                <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={togglePopup}></button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {reports.map((report, index) => (
                                <div key={index} className="card mb-4 me-2 w-100" style={{ backgroundColor: report.isResolved ? 'lightgreen' : 'transparent' }}>
                                    <div className="card-body text-center">
                                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{report.reportReason}</p>
                                        <h6 className="card-text">Reported on: {formatDate(report.createdOn)}</h6>
                                        <h6 className="card-text">By: {report.reportingUser}</h6>
                                        <div className="row">
                                            <div className="mt-3 mb-3">
                                                <label htmlFor={`txtComment-${index}`} className="form-label">Resolve comment</label>
                                                <textarea
                                                    className="form-control"
                                                    id={`txtComment-${index}`}
                                                    rows={2}
                                                    value={resolveComment[index] || ''}
                                                    onChange={(e) => handleCommentChange(index, e.target.value)}
                                                    disabled={report.isResolved}
                                                    placeholder='Type your resolving comment'
                                                ></textarea>
                                            </div>
                                            {report.isResolved &&
                                                <>
                                                    <h6 className="card-text">Resolved on: {formatDate(report.resolvedOn)}</h6>
                                                    <h6 className="card-text">Resolved by: {report.resolvingUser}</h6>
                                                </>
                                            }
                                            {!report.isResolved &&
                                                <div className="col-12 text-center">
                                                    <button className="btn image-btn" title="Resolve report" onClick={() => resolveHandler(report, index)}>
                                                        <img
                                                            src={iconResolve}
                                                            alt="Resolve"
                                                            width="24"
                                                            height="24"
                                                        />
                                                    </button>
                                                    <button className="btn image-btn" onClick={() => resolveAndEdit(report, index)} title='Resolve and edit'>
                                                        <img
                                                            src={iconEdit}
                                                            alt="Edit"
                                                            width="24"
                                                            height="24"
                                                        />
                                                    </button>
                                                    <button className="btn image-btn" onClick={() => resolveAndDelete(report, index)} title="Resolve and delete">
                                                        <img
                                                            src={iconDelete}
                                                            alt="Delete"
                                                            width="24"
                                                            height="24"
                                                        />
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer" style={{ backgroundColor: 'lightgray' }}>
                            <div className="row w-100 text-center">
                                <div className="mt-3 mb-3">
                                    <label htmlFor='txtGeneralComment' className="form-label">General resolve comment</label>
                                    <textarea
                                        className="form-control"
                                        id='txtGeneralComment'
                                        rows={2}
                                        value={generalResolveComment}
                                        onChange={(e) => setGeneralResolveComment(e.target.value)}
                                        placeholder='Type general comment for resolving all reports'
                                    ></textarea>
                                </div>
                                <div className="col-12 text-center">
                                    <button className="btn image-btn" title="Resolve all reports" onClick={() => resolveAllHandler()}>
                                        <img
                                            src={iconResolve}
                                            alt="Resolve"
                                            width="24"
                                            height="24"
                                        />
                                    </button>
                                    <button className="btn image-btn" onClick={() => resolveAllAndEdit()} title="Resolve all reports and edit">
                                        <img
                                            src={iconEdit}
                                            alt="Edit"
                                            width="24"
                                            height="24"
                                        />
                                    </button>
                                    <button className="btn image-btn" onClick={() => resolveAllAndDelete()} title="Resolve all reports and delete">
                                        <img
                                            src={iconDelete}
                                            alt="Delete"
                                            width="24"
                                            height="24"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AllReportsPopup;

import React, { useState } from 'react';
import { reportViolation } from '../../services/apiService';
import '../Global/Global.css';

function ReportPopup({ togglePopup, username, post, comment }) {
    const [reportReason, setReportReason] = useState('');

    const handleSubmit = async () => {
        if (reportReason === '') {
            alert('Report reason cannot be empty.');
            return;
        }

        const commentID = comment !== null ? comment.id : null;

        const result = await reportViolation(post.id, commentID, username, reportReason);
        if (result.isSuccess) {
            alert(result.message);
            togglePopup();
        } else {
            alert(`Failed to report: ${result.message}`);
        }
    };

    return (
        <>
            <div className='modal-backdrop show' style={{ zIndex: 1049 }} onClick={togglePopup}></div>
            <div className='modal d-block' tabIndex='-1' style={{ zIndex: 1050 }}>
                <div className='modal-dialog' style={{ 'maxWidth': '50%' }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='col-md-6'>
                                <h5 className='modal-title'>Report violation by {comment !== null ? comment.userDisplayName : post.createdBy}</h5>
                            </div>
                            <div className='col-md-6 text-end'>
                                <button type='button' className='btn-close' data-dismiss='modal' aria-label='Close' onClick={togglePopup}></button>
                            </div>
                        </div>
                        <div className='modal-body'>
                            {comment !== null &&
                                <>
                                    <div className='mb-3'>
                                        <label htmlFor='txtComment' className='form-label'>Reported comment</label>
                                        <textarea className='form-control' id='txtComment' rows={2} value={comment.postContent} disabled='true'></textarea>
                                    </div>
                                </>
                            }
                            {comment === null &&
                                <>
                                    <div className='mb-3'>
                                        <label htmlFor='txtPostTitle' className='form-label'>Reported post title</label>
                                        <textarea className='form-control' id='txtPostTitle' rows={2} value={post.postTitle} disabled='true'></textarea>
                                    </div>
                                </>
                            }
                            <div className='mb-3'>
                                <label htmlFor='txtReportReason' className='form-label'>Report reason</label>
                                <textarea className='form-control' id='txtReportReason' rows={3} placeholder='Type your reason to report' onChange={(e) => setReportReason(e.target.value)} value={reportReason}></textarea>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-primary me-1' onClick={handleSubmit}>Save</button>
                            <button type='button' className='btn btn-secondary' onClick={togglePopup}>Back</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReportPopup;

import React, { useState, useEffect } from 'react';
import { savePostComment } from '../../services/apiService';
import '../Global/Global.css';

function PostPopup({ togglePopup, username, reloadPosts, selectedComment, postID }) {
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setComment(selectedComment.postContent);
        };

        fetchData();

    }, []);

    const handleSubmit = async () => {
        if (comment === '') {
            alert('Comment cannot be empty.');
            return;
        }

        const result = await savePostComment(selectedComment.id, postID, title, username, comment);
        if (result.isSuccess) {
            alert(result.message);
            togglePopup();
            reloadPosts();
        } else {
            alert(`Failed to save comment: ${result.message}`);
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
                                <h5 className='modal-title'>Create new post</h5>
                            </div>
                            <div className='col-md-6 text-end'>
                                <button type='button' className='btn-close' data-dismiss='modal' aria-label='Close' onClick={togglePopup}></button>
                            </div>
                        </div>
                        <div className='modal-body'>
                            <div className='mb-3'>
                                <label htmlFor='txtContent' className='form-label'>Comment</label>
                                <textarea className='form-control' id='txtContent' placeholder='Comment the post' rows={5} onChange={(e) => setComment(e.target.value)} value={comment}></textarea>
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

export default PostPopup;

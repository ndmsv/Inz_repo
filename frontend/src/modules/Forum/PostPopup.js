import React, { useState, useEffect } from 'react';
import { savePostSubmission, getSelectedPost, downloadPostFile } from '../../services/apiService';
import '../Global/Global.css';

function PostPopup({ togglePopup, username, reloadPosts, postID }) {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const limitedAttachments = 10;

    useEffect(() => {
        const fetchData = async () => {
            if (postID !== null) {
                const data = await getSelectedPost(postID, username);

                if (data.isSuccess) {
                    const post = data.data;
                    setTitle(post.postTitle);
                    setPostContent(post.postDescription);

                    await fetchAndSetFiles(post)
                }
                else {
                    alert(data.message);
                }
            }
        };

        fetchData();

    }, []);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (limitedAttachments && (selectedFiles.length + files.length) > limitedAttachments) {
            alert(`You can only upload up to ${limitedAttachments} files total.`);
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

    const handleSubmit = async () => {
        if (title === '') {
            alert('Title is required.');
            return;
        }

        const result = await savePostSubmission(postID, username, title, postContent, files);
        if (result.isSuccess) {
            alert(result.message);
            togglePopup();
            reloadPosts();
        } else {
            alert(`Failed to save submission: ${result.message}`);
        }
    };

    const fetchAndSetFiles = async (post) => {
        const attachments = post.attachments;
        let files = [];

        if (attachments !== null) {
            for (const attachment of attachments) {
                const result = await downloadPostFile(attachment.attachmentID);
                if (result.isSuccess && result.data) {
                    try {
                        const file = new File([result.data], attachment.fileName, { type: 'application/octet-stream' });
                        files.push(file);
                    } catch (error) {
                        console.error('Error creating file from blob: ', error);
                    }
                } else {
                    console.error('Failed to download file: ', attachment.fileName);
                }
            }
        }

        setFiles(files);
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
                                <label htmlFor='txtTitle' className='form-label'>Title</label>
                                <input type='text' className='form-control' id='txtTitle' placeholder='Enter your title' onChange={(e) => setTitle(e.target.value)} value={title} />
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='txtContent' className='form-label'>Post content</label>
                                <textarea className='form-control' id='txtContent' placeholder='Enter your post content' rows={12} onChange={(e) => setPostContent(e.target.value)} value={postContent}></textarea>
                            </div>
                            <div className='row ms-2 me-2 mt-3'>
                                <div className='col-md-4 offset-md-4'>
                                    <label htmlFor='file-upload' className='btn btn-primary form-control'>
                                        Choose Files
                                    </label>
                                    <input id='file-upload' type='file' className='form-control' multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>
                            </div>
                            <div className='row mt-3 ms-2 me-2'>
                                <div className='col-md-12'>
                                    <div className='d-flex flex-wrap'>
                                        {files.map((file, index) => (
                                            <div key={index} className='card mb-4 me-2' style={{ width: '18rem' }}>
                                                <div className='card-body text-center'>
                                                    <h6 className='card-title'>{file.name}</h6>
                                                    <button className='btn btn-success btn-sm me-1' onClick={() => handleDownload(file)}>Download</button>
                                                    <button className='btn btn-danger btn-sm me-1' onClick={() => handleDelete(file)}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

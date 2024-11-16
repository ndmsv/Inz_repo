import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import PostPopup from './PostPopup';
import { getUserPosts, downloadPostFile } from '../../services/apiService';
import '../Global/Global.css';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import upArrowRegular from '../../assets/up-arrow.png';
import upArrowGreen from '../../assets/up-arrow-green.png';
import downArrowRegular from '../../assets/down-arrow.png';
import downArrowRed from '../../assets/down-arrow-red.png';

function UserPosts() {
    const [username,] = React.useState(localStorage.getItem('username') || null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPostID, setSelectedPostID] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const data = await getUserPosts(username);

                if (data.isSuccess) {
                    const updatedPosts = await Promise.all(data.data.map(async post => {
                        await fetchAndSetFiles(post);
                        return post;
                    }));

                    setPosts(updatedPosts);
                }
                else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, []);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const showPostPopup = (postID) => {
        setSelectedPostID(postID);
        setShowPopup(true)
    };

    const reloadPosts = async () => {
        const data = await getUserPosts(username);

        if (data.isSuccess) {
            const updatedPosts = await Promise.all(data.data.map(async post => {
                await fetchAndSetFiles(post);
                return post;
            }));

            setPosts(updatedPosts);
        }
        else {
            alert(data.message);
        }
    };

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(date, timezone, 'dd MMMM yyyy HH:mm');
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

        post.convertedAttachments = files;
    };

    const deletePost = async (post) => {

    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='parent-div'>
            <Navbar />
            <div className='panel panel-default'>
                <div className='panel-body'>
                    <div className='row mt-3 me-0'>
                        <div className='col-md-4 ms-2'>
                            <button type='button' className='btn btn-primary' onClick={() => showPostPopup(null)}>New post</button>
                        </div>
                        <div className='col-md-4 text-center'>
                            <h3>Your posts</h3>
                        </div>
                    </div>
                    <div className='col-md-12 mt-3'>
                        <div className='d-flex flex-wrap'>
                            {isLoading ? (
                                <div className='d-flex justify-content-center align-items-center' style={{ height: '30vh' }}>
                                    <div className='spinner-border text-primary' role='status'>
                                        <span className='sr-only'></span>
                                    </div>
                                </div>
                            ) : currentPosts.length > 0 ? (
                                currentPosts.map((post) => (
                                    <div className='card mb-4 me-2' key={post.id} style={{ width: '90%' }}>
                                        <div className='card-body text-center d-flex flex-column'>
                                            <div className='card-content'>
                                                <h5 className='card-title'>{post.postTitle}</h5>
                                                <p className='card-subtitle mb-2 text-muted' style={{ whiteSpace: 'pre-wrap' }}>{post.postDescription}</p>
                                                <p className='card-text'>Creation date: {formatDate(post.createdOn)}</p>
                                                {post.editedOn &&
                                                    <p className='card-text'>Last edited on: {formatDate(post.editedOn)}</p>
                                                }
                                                <div className='row mt-3 ms-2 me-2'>
                                                    <div className='col-md-12'>
                                                        <div className='d-flex flex-wrap'>
                                                            {post.convertedAttachments && post.convertedAttachments.map((file, index) => (
                                                                <div key={index} className='card mb-4 me-2' style={{ width: '18rem' }}>
                                                                    <div className='card-body text-center'>
                                                                        <h6 className='card-title'>{file.name}</h6>
                                                                        <button className='btn btn-success btn-sm me-1' onClick={() => handleDownload(file)}>Download</button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='card-actions'>
                                                <div className='row'>
                                                    <div className='col-4 text-start align-self-end'>
                                                        <span>{post.votesCount} Like{![-1, 1].includes(post.votesCount) ? 's' : ''}</span>
                                                    </div>
                                                    <div className='col-4 test-center'>
                                                        <button className='btn btn-primary me-1' onClick={() => showPostPopup(post.id)}>
                                                            Edit post
                                                        </button>
                                                    </div>
                                                    <div className='col-4 text-end'>
                                                        <button className='btn btn-danger' onClick={() => deletePost(post)}>
                                                            Delete post
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '30vh' }}>
                                    <h3>You did not created any posts yet!</h3>
                                </div>
                            )}
                        </div>
                    </div>
                    <nav>
                        <ul className='pagination justify-content-center'>
                            {[...Array(Math.ceil(posts.length / postsPerPage)).keys()].map(number => (
                                <li key={number + 1} className='page-item'>
                                    <button onClick={() => paginate(number + 1)} className={`page-link ${currentPage === number + 1 ? 'page-link-active' : ''}`}>
                                        {number + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {showPopup && <PostPopup togglePopup={togglePopup} username={username} reloadPosts={reloadPosts} postID={selectedPostID} />}
                </div>
            </div>
        </div>
    );
}

export default UserPosts;
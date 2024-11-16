import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import NewPostPopup from './PostPopup';
import { getForumPosts, downloadPostFile, voteOnPost } from '../../services/apiService';
import '../Global/Global.css';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import upArrowRegular from '../../assets/up-arrow.png';
import upArrowGreen from '../../assets/up-arrow-green.png';
import downArrowRegular from '../../assets/down-arrow.png';
import downArrowRed from '../../assets/down-arrow-red.png';

function MainForum() {
    const [username,] = React.useState(localStorage.getItem('username') || null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPostCategory, setCurrentPostCategory] = useState('Hot');
    const [timeframeValue, setTimeframeValue] = useState('AllTime');
    const [selectedPostID, setSelectedPostID] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const btnHot = document.getElementById('btnHot');
                if (btnHot && currentPostCategory == 'Hot') {
                    btnHot.checked = true;
                }

                const data = await getForumPosts(username, currentPostCategory, timeframeValue);

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

    }, [currentPostCategory, timeframeValue]);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const showPostPopup = (postID) => {
        setSelectedPostID(postID);
        setShowPopup(true)
    };

    const reloadPosts = async () => {
        const data = await getForumPosts(username, currentPostCategory, timeframeValue);

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

    const upvotePost = (post) => {
        const voted = !(post.voted && post.liked);
        const liked = !(post.voted && post.liked);

        callVoteOnPost(post, voted, liked);
    };

    const downvotePost = (post) => {
        const voted = !post.voted || post.liked;
        const liked = false;

        callVoteOnPost(post, voted, liked);
    };

    const callVoteOnPost = async (post, voted, liked) => {
        const data = await voteOnPost(post.id, username, voted, liked);

        if (!data.isSuccess) {
            alert('Error while voting: ' + data.message);
        } else {
            reloadPosts();
        }
    };

    const handleTimeframeChange = (event) => {
        setTimeframeValue(event.target.value);
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
                            <div className='btn-group' role='group'>
                                <input type='radio' className='btn-check' name='btnRadio' id='btnHot' onClick={() => setCurrentPostCategory('Hot')} />
                                <label className='btn btn-outline-primary' htmlFor='btnHot'>Hot</label>

                                <input type='radio' className='btn-check' name='btnRadio' id='btnNew' onClick={() => setCurrentPostCategory('New')} />
                                <label className='btn btn-outline-primary' htmlFor='btnNew'>New</label>

                                <input type='radio' className='btn-check' name='btnRadio' id='btnTop' onClick={() => setCurrentPostCategory('Top')} />
                                <label className='btn btn-outline-primary' htmlFor='btnTop'>Top</label>
                            </div>
                        </div>
                    </div>
                    {currentPostCategory === 'Top' &&
                        <div className='row justify-content-md-center mt-3 me-0'>
                            <div className='ms-3 col-md-1'>
                                <select className='form-select' id='timeframeSelect' onChange={handleTimeframeChange} value={timeframeValue}>
                                    <option defaultValue value='AllTime'>All Time</option>
                                    <option value='Year'>Year</option>
                                    <option value='Month'>Month</option>
                                    <option value='Week'>Week</option>
                                    <option value='Day'>Day</option>
                                    <option value='TwelveHours'>12 Hours</option>
                                    <option value='SixHours'>6 Hours</option>
                                    <option value='TwoHours'>2 Hours</option>
                                </select>
                            </div>
                        </div>
                    }
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
                                                    <div className='col-4 text-start'>
                                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => upvotePost(post)}>
                                                            <img
                                                                src={
                                                                    post.voted
                                                                        ? (post.liked ? upArrowGreen : upArrowRegular)
                                                                        : upArrowRegular
                                                                }
                                                                alt='Upvote'
                                                                width='24'
                                                                height='24'
                                                            />
                                                        </button>
                                                        <span>{post.votesCount}</span>
                                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => downvotePost(post)}>
                                                            <img
                                                                src={
                                                                    post.voted
                                                                        ? (!post.liked ? downArrowRed : downArrowRegular)
                                                                        : downArrowRegular
                                                                }
                                                                alt='Downvote'
                                                                width='24'
                                                                height='24'
                                                            />
                                                        </button>
                                                    </div>
                                                    <div className='col-4 test-center'>
                                                        {post.isEditible &&
                                                            <button className='btn btn-primary me-1' onClick={() => showPostPopup(post.id)}>
                                                                Edit post
                                                            </button>
                                                        }
                                                    </div>
                                                    <div className='col-4 text-end'>
                                                        {post.isEditible &&
                                                            <button className='btn btn-danger'>
                                                                Delete post
                                                            </button>

                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '30vh' }}>
                                    <h3>There are no posts now!</h3>
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
                    {showPopup && <NewPostPopup togglePopup={togglePopup} username={username} reloadPosts={reloadPosts} postID={selectedPostID} />}
                </div>
            </div>
        </div>
    );
}

export default MainForum;
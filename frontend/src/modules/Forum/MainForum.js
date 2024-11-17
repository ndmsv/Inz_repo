import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import NewPostPopup from './PostPopup';
import PostsCards from './PostsCards';
import { getForumPosts, downloadPostFile } from '../../services/apiService';
import '../Global/Global.css';

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
                        <PostsCards isLoading={isLoading} currentPosts={currentPosts} allPosts={posts} setAllPosts={setPosts} showPostPopup={showPostPopup} userCards={false} username={username} reloadPosts={reloadPosts} />
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
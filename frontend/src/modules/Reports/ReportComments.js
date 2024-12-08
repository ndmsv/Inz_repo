import React, { useState, useEffect } from 'react';
import Navbar from '../Global/Navbar';
import PostsCards from '../Forum/PostsCards';
import CommentPopup from '../Forum/CommentPopup';
import AllReportsPopup from '../Forum/AllReportsPopup';
import { getReportPosts, downloadPostFile } from '../../services/apiService';
import '../Global/Global.css';

function ReportComments() {
    const [username,] = React.useState(localStorage.getItem('username') || null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPostID, setSelectedPostID] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [showAllReportsPopup, setShowAllReportsPopup] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                reloadPosts();
            } catch (error) {
                alert('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, []);

    const reloadPosts = async () => {
        const isForComment = true;
        const data = await getReportPosts(username, isForComment);

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

    const showCommentPopupHandler = (comment, post) => {
        setSelectedComment(comment);
        setShowCommentPopup(true);
        setSelectedPostID(post.id);
    };

    const toggleCommentPopup = () => {
        setShowCommentPopup(!showCommentPopup);
    };

    const showAllReportsPopupHandler = (post, comment) => {
        setSelectedComment(comment);
        setSelectedPost(post);

        setShowAllReportsPopup(true);
    };

    const toggleAllReportsPopup = () => {
        setShowAllReportsPopup(!showAllReportsPopup);
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
                        <div className='col-md-12 text-center'>
                            <h3>Reported comments</h3>
                        </div>
                    </div>
                    <div className='col-md-12 mt-3'>
                        <PostsCards 
                            isLoading={isLoading} 
                            currentPosts={currentPosts} 
                            allPosts={posts} 
                            setAllPosts={setPosts} 
                            showPostPopup={false} 
                            userCards={true} 
                            username={username} 
                            reloadPosts={reloadPosts} 
                            showCommentPopupHandler={showCommentPopupHandler} 
                            showReportPopupHandler={false}
                            isReportPosts={false}
                            showAllReportsPopupHandler={showAllReportsPopupHandler}
                            isReportComments={true} />
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
                    {showCommentPopup && <CommentPopup togglePopup={toggleCommentPopup} username={username} reloadPosts={reloadPosts} postID={selectedPostID} selectedComment={selectedComment} />}
                    {showAllReportsPopup &&
                        <AllReportsPopup
                            togglePopup={toggleAllReportsPopup}
                            username={username}
                            post={selectedPost}
                            comment={selectedComment}
                            reloadPosts={reloadPosts}
                            showPostPopupHandler={false}
                            showCommentPopupHandler = {showCommentPopupHandler}
                        />
                    }
                </div>
            </div>
        </div>
    );
}

export default ReportComments;
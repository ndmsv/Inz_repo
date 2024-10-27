import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getJoinCourses, joinCourse, checkJoinPassword } from '../services/apiService';
import './Global.css';

function MainForum() {
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getJoinCourses(username);
                if (data.isSuccess) {
                }
                else {
                    alert(data.message)
                }
            } catch (error) {
                alert('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='parent-div'>
            <Navbar />
            <div className="panel panel-default">
                <div className="panel-body">
                    <div className="col-md-12 mt-5">
                        <div className="d-flex flex-wrap">
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: "30vh" }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only"></span>
                                    </div>
                                </div>
                            ) : currentPosts.length > 0 ? (
                                currentPosts.map((post) => (
                                    <div className="card mb-4 me-2" key={post.postId} style={{ width: '45%' }}>
                                        <div className="card-body text-center d-flex flex-column">
                                            <div className="card-content">
                                                <h5 className="card-title">{post.postTitle}</h5>
                                                <p className="card-subtitle mb-2 text-muted">{post.postDescription}</p>
                                                <p className="card-text">Creation date: {post.openingDate}</p>
                                            </div>
                                            <div className="card-actions">
                                                <div className="row">
                                                    <div className="col-8 text-start">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "30vh" }}>
                                    <h3>There are no posts now!</h3>
                                </div>
                            )}
                        </div>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {[...Array(Math.ceil(posts.length / postsPerPage)).keys()].map(number => (
                                <li key={number + 1} className="page-item">
                                    <button onClick={() => paginate(number + 1)} className={`page-link ${currentPage === number + 1 ? 'page-link-active' : ''}`}>
                                        {number + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default MainForum;
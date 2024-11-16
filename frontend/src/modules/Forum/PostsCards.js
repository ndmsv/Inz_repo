import React from 'react';
import { voteOnPost, deletePost } from '../../services/apiService';
import '../Global/Global.css';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import upArrowRegular from '../../assets/up-arrow.png';
import upArrowGreen from '../../assets/up-arrow-green.png';
import downArrowRegular from '../../assets/down-arrow.png';
import downArrowRed from '../../assets/down-arrow-red.png';

function PostsCards({ isLoading, currentPosts, showPostPopup, userCards, username, reloadPosts }) {

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

    const handleDeletePost = async (postID) => {
        const confirmStop = window.confirm('Are you sure you want to delete post?');
        if (!confirmStop) {
            return;
        }

        const response = await deletePost(postID, username);
        alert(response.message);

        if (response.isSuccess) {
            reloadPosts();
        }
    };

    return (
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
                            <div className='row'>
                                <h5 className='card-title'>{post.postTitle}</h5>
                                <p className='card-text'>Creation date: {formatDate(post.createdOn)}</p>
                                {post.editedOn &&
                                    <p className='card-text'>Last edited on: {formatDate(post.editedOn)}</p>
                                }
                                <p className='card-subtitle mt-2 text-muted' style={{ whiteSpace: 'pre-wrap' }}>{post.postDescription}</p>
                                <div className='row mt-3 ms-0 me-0'>
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
                                <div className='row ms-0 me-0 ps-0 pe-0'>
                                    <div className='col-4 text-start'>
                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => upvotePost(post)} disabled={userCards}>
                                            <img
                                                src={
                                                    !userCards && post.voted
                                                        ? (post.liked ? upArrowGreen : upArrowRegular)
                                                        : upArrowRegular
                                                }
                                                alt='Upvote'
                                                width='24'
                                                height='24'
                                            />
                                        </button>
                                        <span>{post.votesCount}</span>
                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => downvotePost(post)} disabled={userCards}>
                                            <img
                                                src={
                                                    !userCards && post.voted
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
                                    </div>
                                    <div className='col-4 text-end'>
                                        {post.isEditible &&
                                            <button className='btn btn-primary me-1' onClick={() => showPostPopup(post.id)}>
                                                Edit post
                                            </button>
                                        }
                                        {post.isEditible &&
                                            <button className='btn btn-danger' onClick={() => handleDeletePost(post.id)}>
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
                    <h3>{userCards ? 'You did not created any posts yet!' : 'There are no posts now!'}</h3>
                </div>
            )}
        </div>
    );
}

export default PostsCards;
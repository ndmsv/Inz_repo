import React, { useState } from 'react';
import { voteOnPost, deletePost, savePostComment, getSelectedPostComments, deletePostComment } from '../../services/apiService';
import '../Global/Global.css';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import upArrowRegular from '../../assets/up-arrow.png';
import upArrowGreen from '../../assets/up-arrow-green.png';
import downArrowRegular from '../../assets/down-arrow.png';
import downArrowRed from '../../assets/down-arrow-red.png';
import iconEdit from '../../assets/icon-edit.png';
import iconDelete from '../../assets/icon-delete.png';
import iconAlert from '../../assets/icon-alert.png';

function PostsCards({ isLoading, currentPosts, allPosts, setAllPosts, showPostPopup, userCards, username, reloadPosts, showCommentPopupHandler }) {
    const [commentFields, setCommentFields] = useState({});

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

    const handleCommentChange = (postId, value) => {
        setCommentFields(prevComments => ({
            ...prevComments,
            [postId]: value
        }));
    };

    const saveComment = async (post) => {
        const postContent = commentFields[post.id]?.trim();
        if (postContent !== null && postContent !== '') {
            const response = await savePostComment(null, post.id, username, postContent);

            if (response.isSuccess) {
                commentFields[post.id] = '';
                const postIndex = allPosts.findIndex(p => p.id === post.id);
                handleShowPostComments(allPosts[postIndex], true);
            }
        } else {
            alert('You cannot add empty comment.');
        }
    };

    const handleShowPostComments = async (post, stay) => {
        const postIndex = allPosts.findIndex(p => p.id === post.id);

        if (postIndex !== -1) {
            const updatedPosts = [...allPosts];

            if (updatedPosts[postIndex].comments && !stay) {
                updatedPosts[postIndex].comments = null;
            } else {
                const data = await getSelectedPostComments(post.id, username);
                if (data.isSuccess) {
                    updatedPosts[postIndex].comments = data.data;
                }
            }

            setAllPosts(updatedPosts);
        } else {
            console.error('Post not found.');
        }
    };

    const handleDeleteComment = async (commentID) => {
        const confirmStop = window.confirm('Are you sure you want to delete comment?');
        if (!confirmStop) {
            return;
        }

        const response = await deletePostComment(commentID, username);
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
                                <h6 className='card-text'>By: {post.createdBy}</h6>
                                <h6 className='card-text'>Creation date: {formatDate(post.createdOn)}</h6>
                                {post.editedOn &&
                                    <h6 className='card-text'>Last edited on: {formatDate(post.editedOn)}</h6>
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
                                <div className='row ms-0 me-0 mb-2 ps-0 pe-0'>
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
                                    <div className='col-4 test-center align-items-center' style={{ display: 'grid' }}>
                                        <h6 className='register-label mb-0' style={{ cursor: 'pointer', padding: 0 }} onClick={() => handleShowPostComments(post, false)}>
                                            {post.comments != null ? '↑ Hide all comments (' + post.commentsCount + ') ↑' : '↓ Show all comments (' + post.commentsCount + ') ↓'}
                                        </h6>
                                    </div>
                                    <div className='col-4 text-end'>
                                        <button className='btn' style={{ background: 'none', border: 'none' }} title='Report post'>
                                            <img
                                                src={iconAlert}
                                                alt='Alert'
                                                width='24'
                                                height='24'
                                            />
                                        </button>
                                        {post.isEditible &&
                                            <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => showPostPopup(post.id)} title='Edit post'>
                                                <img
                                                    src={iconEdit}
                                                    alt='Edit'
                                                    width='24'
                                                    height='24'
                                                />
                                            </button>
                                        }
                                        {post.isEditible &&
                                            <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => handleDeletePost(post.id)} title='Delete post'>
                                                <img
                                                    src={iconDelete}
                                                    alt='Delete'
                                                    width='24'
                                                    height='24'
                                                />
                                            </button>
                                        }
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'lightgray' }}>
                                    <div className='row mt-3 ms-0 me-0'>
                                        <div className='col-md-12'>
                                            <div className='d-flex flex-wrap'>
                                                {post.comments != null && post.comments.length > 0 && post.comments.map((comment, index) => (
                                                    <div key={index} className='card mb-4 me-2' style={{ width: '84%' }}>
                                                        <div className='card-body text-center'>
                                                            <p className='card-text' style={{ whiteSpace: 'pre-wrap' }}>{comment.postContent}</p>
                                                            <h6 className='card-title'>Creation date: {formatDate(comment.createdOn)}</h6>
                                                            {comment.updatedOn &&
                                                                <h6 className='card-text'>Last edited on: {formatDate(comment.updatedOn)}</h6>
                                                            }
                                                            <div className='row'>
                                                                <div className='col-8 offset-2 align-self-center'>
                                                                    <h6 className='card-text'>By: {comment.userDisplayName}</h6>
                                                                </div>
                                                                {comment.isEditible &&
                                                                    <div className='col-2 text-end'>
                                                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => showCommentPopupHandler(comment, post)} title='Edit comment'>
                                                                            <img
                                                                                src={iconEdit}
                                                                                alt='Edit'
                                                                                width='24'
                                                                                height='24'
                                                                            />
                                                                        </button>
                                                                        <button className='btn' style={{ background: 'none', border: 'none' }} onClick={() => handleDeleteComment(comment.id)} title='Delete comment'>
                                                                            <img
                                                                                src={iconDelete}
                                                                                alt='Delete'
                                                                                width='24'
                                                                                height='24'
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row ms-0 me-0 ps-0 pe-0 justify-content-center'>
                                        <div className='col-10 mt-2 mb-2'>
                                            <textarea className='form-control' id='txtComment' placeholder='Comment the post' rows={4} value={commentFields[post.id] || ''}
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}>
                                            </textarea>
                                        </div>
                                    </div>
                                    <div className='row ms-0 me-0 ps-0 pe-0 mb-2'>
                                        <div className='col-11 text-end'>
                                            <button className='btn btn-success' onClick={() => saveComment(post)}>
                                                Save comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '30vh' }}>
                    <h3>{userCards ? 'You have not created any posts yet!' : 'There are no posts now!'}</h3>
                </div>
            )}
        </div>
    );
}

export default PostsCards;
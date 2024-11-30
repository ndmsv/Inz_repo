import axios from 'axios';

const API_URL = 'https://localhost:5000/';

const handleAxiosError = (error) => {
    if (error.message) {
        return { message: error.message, isSuccess: false };
    }
    else if (error.response) {
        return { message: error.response.data.message, isSuccess: false };
    } else {
        return { message: 'An error occurred. Please try again.', isSuccess: false };
    }
};

export const fetchData = async () => {
    try {
        const response = await axios.get(`${API_URL}test`);
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the data:', error);
    }
};

export const loginUser = async (login, password) => {
    try {
        const response = await axios.post(`${API_URL}Login/login`, {
            login,
            password
        });
        return { message: response.data.message, isSuccess: response.data.isSuccess, password: response.data.password };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkLogin = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkLogin`, {
            login
        });
        return { message: response.data.message, isSuccess: response.data.isSuccess };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkTypePassword = async (typeID, Password) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkTypePassword`, {
            typeID,
            Password
        });
        return { message: response.data.message, isSuccess: response.data.isSuccess };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const registerUser = async (login, password, type, name, surname) => {
    try {
        const response = await axios.post(`${API_URL}Login/registerUser`, {
            login,
            password,
            type,
            name,
            surname
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkUserDetails = async (login, password) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkUserDetails`, {
            login,
            password
        });
        return { isAdminOrTeacher: response.data.isAdminOrTeacher, role: response.data.role, isSuccess: response.data.isSuccess, fullname: response.data.fullname };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const registerCourse = async (name, description, ownerName, password) => {
    try {
        const response = await axios.post(`${API_URL}Course/registerCourse`, {
            name,
            description,
            ownerName,
            password
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getJoinCourses = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Course/getJoinCourses`, {
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getMyCourses = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Course/getMyCourses`, {
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const joinCourse = async (courseID, login) => {
    try {
        const response = await axios.post(`${API_URL}Course/joinCourse`, {
            courseID,
            login
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkJoinPassword = async (courseID, login, password) => {
    try {
        const response = await axios.post(`${API_URL}Course/checkJoinPassword`, {
            courseID,
            login,
            password
        });
        return { message: response.data.message, isSuccess: response.data.isSuccess };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const leaveCourse = async (courseID, login) => {
    try {
        const response = await axios.post(`${API_URL}Course/leaveCourse`, {
            courseID,
            login
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getEligibleUsers = async (courseID) => {
    try {
        const response = await axios.post(`${API_URL}Course/getEligibleUsers`, {
            courseID
        });
        return { data: response.data, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const addNewOwners = async (courseId, userIds) => {
    try {
        const response = await axios.post(`${API_URL}Course/addNewOwners`, {
            courseId,
            userIds
        });
        return { data: response.data, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const stopOwnership = async (courseID, login) => {
    try {
        const response = await axios.post(`${API_URL}Course/stopOwnership`, {
            courseID,
            login
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getCourseTasks = async (courseID, login) => {
    try {
        const response = await axios.post(`${API_URL}Task/getCourseTasks`, {
            courseID,
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkIfOwnerOrAdmin = async (login, courseID) => {
    try {
        const response = await axios.post(`${API_URL}Task/checkIfOwnerOrAdmin`, {
            login,
            courseID
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const saveCourseTask = async (courseID, taskName, taskDescription, openingDate, closingDate, limitedAttachments, attachmentsNumber, limitedAttachmentTypes, attachmentTypes) => {
    try {
        const response = await axios.post(`${API_URL}Task/saveCourseTask`, {
            courseID,
            taskName,
            taskDescription,
            openingDate: openingDate.toISOString(),
            closingDate: closingDate.toISOString(),
            limitedAttachments,
            attachmentsNumber,
            limitedAttachmentTypes,
            attachmentTypes,
            taskID: null
        });
        return { message: response.data.message, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const updateCourseTask = async (taskID, courseID, taskName, taskDescription, openingDate, closingDate, limitedAttachments, attachmentsNumber, limitedAttachmentTypes, attachmentTypes) => {
    try {
        const response = await axios.post(`${API_URL}Task/updateCourseTask`, {
            courseID,
            taskName,
            taskDescription,
            openingDate: openingDate.toISOString(),
            closingDate: closingDate.toISOString(),
            limitedAttachments,
            attachmentsNumber,
            limitedAttachmentTypes,
            attachmentTypes,
            taskID
        });
        return { message: response.data.message, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const deleteTask = async (taskID, login) => {
    try {
        const response = await axios.post(`${API_URL}Task/deleteTask`, {
            taskID,
            login
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error.message);
    }
};

export const saveTaskSubmission = async (taskId, login, submissionNote, files) => {
    const formData = new FormData();
    formData.append('TaskID', taskId);
    formData.append('Login', login);
    formData.append('SubmissionNote', submissionNote);
    files.forEach(file => {
        formData.append('Files', file);
    });

    try {
        const response = await axios.post(`${API_URL}Submission/saveTaskSubmission`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return { message: response.data.message, isSuccess: true, submissionId: response.data.submissionId };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getTaskSubmissions = async (taskID, login) => {
    try {
        const response = await axios.post(`${API_URL}Submission/getTaskSubmissions`, {
            taskID,
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const downloadFile = async (attachmentID) => {
    try {
        const response = await axios.post(`${API_URL}Submission/downloadFile`, {
            attachmentID
        }, {
            responseType: 'blob'
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const checkSubmissionsInCourse = async (courseID, taskID) => {
    try {
        const response = await axios.post(`${API_URL}Task/checkSubmissionsInCourse`, {
            courseID,
            taskID
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const deleteCourse = async (courseID) => {
    try {
        const response = await axios.post(`${API_URL}Course/deleteCourse`, {
            courseID
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getForumPosts = async (login, type, timeframe) => {
    try {
        const response = await axios.post(`${API_URL}Forum/getForumPosts`, {
            login,
            type,
            timeframe
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const savePostSubmission = async (postId, login, postTitle, postDescription, files) => {
    const formData = new FormData();
    if (postId !== null && postId !== undefined) {
        formData.append('PostID', postId);
    }
    formData.append('Login', login);
    formData.append('PostTitle', postTitle);
    formData.append('PostDescription', postDescription);
    files.forEach(file => {
        formData.append('Files', file);
    });

    try {
        const response = await axios.post(`${API_URL}Forum/savePostSubmission`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return { message: response.data.message, isSuccess: true, postId: response.data.postId };
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const downloadPostFile = async (attachmentID) => {
    try {
        const response = await axios.post(`${API_URL}Forum/downloadPostFile`, {
            attachmentID
        }, {
            responseType: 'blob'
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const voteOnPost = async (postID, login, voted, liked) => {
    try {
        const response = await axios.post(`${API_URL}Forum/voteOnPost`, {
            postID,
            login,
            voted,
            liked
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getUserPosts = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Forum/getUserPosts`, {
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getSelectedPost = async (postID, login) => {
    try {
        const response = await axios.post(`${API_URL}Forum/getSelectedPost`, {
            postID,
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const deletePost = async (postID, login) => {
    try {
        const response = await axios.post(`${API_URL}Forum/deletePost`, {
            postID,
            login
        });
        return { message: response.data.message, data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const savePostComment = async (commentID, postID, login, postContent) => {
    try {
        const response = await axios.post(`${API_URL}Forum/savePostComment`, {
            commentID,
            postID,
            login,
            postContent
        });
        return { message: response.data.message, data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const getSelectedPostComments = async (postID, login) => {
    try {
        const response = await axios.post(`${API_URL}Forum/getSelectedPostComments`, {
            postID,
            login
        });
        return { data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const deletePostComment = async (commentID, login) => {
    try {
        const response = await axios.post(`${API_URL}Forum/deletePostComment`, {
            commentID,
            login
        });
        return { message: response.data.message, data: response.data, isSuccess: true};
    } catch (error) {
        return handleAxiosError(error);
    }
};
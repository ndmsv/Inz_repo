import axios from 'axios';

const API_URL = 'https://localhost:5000/';

const handleAxiosError = (error) => {
    if (error.response) {
        return { message: error.response.data.message, isSuccess: false };
    } else {
        return { message: "An error occurred. Please try again.", isSuccess: false };
    }
};

export const fetchData = async () => {
    try {
        const response = await axios.get(`${API_URL}test`);
        return response.data;
    } catch (error) {
        console.error("There was an error fetching the data:", error);
    }
};

export const loginUser = async (login, password) => {
    try {
        const response = await axios.post(`${API_URL}Login/login`, {
            login,
            password
        });
        return { message: response.data.message, isSuccess: response.data.isSuccess };
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

export const checkIfTeacher = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkIfTeacher`, {
            login
        });
        return { isAdminOrTeacher: response.data.isAdminOrTeacher, role: response.data.role };
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
import axios from 'axios';

const API_URL = 'https://localhost:5000/';

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
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        if (error.response) {
            return { message: error.response.data.message, isSuccess: false };
        } else {
            return { message: "An error occurred. Please try again.", isSuccess: false };
        }
    }
};

export const checkLogin = async (login) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkLogin`, {
            login
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        if (error.response) {
            return { message: error.response.data.message, isSuccess: false };
        } else {
            return { message: "An error occurred. Please try again.", isSuccess: false };
        }
    }
};

export const checkTypePassword = async (typeID, Password) => {
    try {
        const response = await axios.post(`${API_URL}Login/checkTypePassword`, {
            typeID,
            Password
        });
        return { message: response.data.message, isSuccess: true };
    } catch (error) {
        if (error.response) {
            return { message: error.response.data.message, isSuccess: false };
        } else {
            return { message: "An error occurred. Please try again.", isSuccess: false };
        }
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
        if (error.response) {
            return { message: error.response.data.message, isSuccess: false };
        } else {
            return { message: "An error occurred. Please try again.", isSuccess: false };
        }
    }
};
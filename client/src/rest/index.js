import axios from "axios";
import qs from 'qs';

export const paramsSerializer = (obj) => qs.stringify(obj, { indices: false });
export const apiClient = axios.create({
    paramsSerializer,
});
export const USER_TOKEN = 'token';

apiClient.interceptors.response.use(
    response => response,
    error => {
        const {response} = error;
        if (response) {
            switch (response.status) {
                case 401: {
                    if (window.location.pathname === '/login') {
                        return Promise.resolve(response);
                    } else {
                        clearToken();
                        window.location.replace('/login');
                    }
                    break;
                }
                case 403:
                    window.location.replace('/forbidden');
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Authentication
 * @param username
 * @param password
 * @returns {Promise<Response>}
 */
export function auth(username, password) {
    return restPost(`${process.env.REACT_APP_BACKEND_API_VERSION}/singin`, {login: username, password: password});
}

/**
 * Register new user
 * @param user
 * @returns {Promise<Response>}
 */
export function register(user) {
    return restPost(`${process.env.REACT_APP_BACKEND_API_VERSION}/singup`, user);
}

/**
 * Get current user
 * @returns {Promise<*>}
 */
export function getCurrentUser() {
    return restGet(`${process.env.REACT_APP_BACKEND_API_VERSION}/current-user`).then(response => response.data);
}

/**
 * Get user
 * @param id
 * @returns {Promise<*>}
 */
export function getUser(id) {
    return restGet(`${process.env.REACT_APP_BACKEND_API_VERSION}/users/${id}`).then(response => response.data);
}

/**
 * Check Login
 * @param login
 * @returns {Promise<*>}
 */
export function checkLogin(login) {
    return restGet(`${process.env.REACT_APP_BACKEND_API_VERSION}/singup/${login}`).then(response => response.data);
}

/**
 * Get friends
 * @param id
 * @param search
 * @returns {Promise<*>}
 */
export function getFriends(id, search) {
    const params = {
        id,
        search
    }
    return restGet(`${process.env.REACT_APP_BACKEND_API_VERSION}/friends`, params).then(response => response.data);
}

/**
 * Get friends
 * @param id
 * @param search
 * @returns {Promise<*>}
 */
export function getUnknownUsers(id, search) {
    const params = {
        id,
        search
    }
    return restGet(`${process.env.REACT_APP_BACKEND_API_VERSION}/friends/unknown`, params).then(response => response.data);
}

/**
 * Add new friend
 * @param userId
 * @param friendId
 * @returns {Promise<unknown>}
 */
export function addFriend(userId, friendId) {
    return restPost(`${process.env.REACT_APP_BACKEND_API_VERSION}/friends`, {userId, friendId});
}

/**
 * Save changing by user
 * @param user
 * @returns {Promise}
 */
export function saveUser(user) {
    return restPut(`${process.env.REACT_APP_BACKEND_API_VERSION}/users`, user);
}

/**
 * Delete User by id
 * @param id
 * @returns {Promise}
 */
export function deleteUser(id) {
    return restDelete(`${process.env.REACT_APP_BACKEND_API_VERSION}/users/${id}`);
}

/**
 * Remove friend by user id
 * @param userId
 * @param friendId
 * @returns {Promise}
 */
export function removeFriend(userId, friendId) {
    return restDelete(`${process.env.REACT_APP_BACKEND_API_VERSION}/friends`, {userId, friendId});
}

/**
 * Save JWT token
 * @param token
 */
export function setToken(token) {
    localStorage.setItem(USER_TOKEN, token);
}

/**
 * Get JWT token
 * @returns {*}
 */
export function getToken() {
    return localStorage.getItem(USER_TOKEN);
}

/**
 * Clear JWT token
 * @returns void
 */
export function clearToken() {
    localStorage.removeItem(USER_TOKEN);
}

/**
 * Check JWT token exist
 * @returns {boolean}
 */
export function hasToken() {
    return !!localStorage.getItem('token');
}

/**
 * DELETE HTTP request
 * @param path
 * @param data
 * @param headers
 * @returns {Promise}
 */
async function restDelete(path, data, headers = {}) {
    const config = await getConfig(headers);
    return apiClient.delete(
        path,
        {
            data: data,
            ...config
        }
    );
}

/**
 * POST HTTP request
 * @param path
 * @param data
 * @param headers
 * @returns {Promise}
 */
async function restPost(path, data, headers = {}) {
    return apiClient.post(
        path,
        data,
        await getConfig(headers)
    );
}

/**
 * PUT HTTP request
 * @param path
 * @param data
 * @param headers
 * @returns {Promise}
 */
async function restPut(path, data, headers = {}) {
    return apiClient.put(
        path,
        data,
        await getConfig(headers)
    );
}

/**
 * GET HTTP request
 * @param path Эндпоинт
 * @param params Параметры в формате Object
 * @param config
 * @returns {Promise<any>}
 */
async function restGet(path, params = null, config = {}) {
    const queryParams = params ? `?${createQueryParams(params)}` : '';
    return apiClient.get(
        `${path}${queryParams}`,
        await getConfig(config)
    ).catch(error => console.error(error));
}

/**
 * Configuration for axios
 * @param headers
 * @returns Config
 */
const getConfig = async (headers) => {
    const token = await getToken();
    return {
        baseURL:  process.env.NODE_ENV === 'production' ?
            process.env.REACT_APP_BACKEND_API_BASE_URL_PROD :
            process.env.REACT_APP_BACKEND_API_BASE_URL_DEV,
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? token : "",
            Accept: '*/*',
            ...headers
        }
    };
};

/**
 * Complete request params
 * @param params
 * @returns {string}
 */
function createQueryParams(params) {
    return Object.keys(params)
        .filter(key => params[key])
        .map((key) => {
            return `${key}=${params[key]}`;
        })
        .join('&');
}
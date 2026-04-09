import API from "./authApi.js";

export const getArticles = () => API.get("/articles");
export const getArticleById = (id) => API.get(`/articles/${id}`);
export const createArticle = (data) => API.post("/articles/create", data);
export const updateArticle = (id, data) => API.put(`/articles/${id}`, data);
export const deleteArticle = (id) => API.delete(`/articles/${id}`);

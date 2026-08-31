import { apiRequest } from "./client.js";

export const getCompanyDashboard = ({ signal } = {}) => apiRequest("/companies/me", { authenticated: true, signal });
export const saveCompany = (body) => apiRequest("/companies/me", { method: "PUT", authenticated: true, body });
export const addCompanyEmployee = (email) => apiRequest("/companies/me/employees", { method: "POST", authenticated: true, body: { email } });
export const removeCompanyEmployee = (id) => apiRequest(`/companies/me/employees/${id}`, { method: "DELETE", authenticated: true });
export const createCompanyJob = (body) => apiRequest("/companies/me/jobs", { method: "POST", authenticated: true, body });

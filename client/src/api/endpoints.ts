import client from './client';
import { 
  LoginResponse, ApiResponse, User, Order, Zone, 
  FinancialSummary, Carrier, Customer 
} from '../types';

export const login = (data: any) => client.post<ApiResponse<LoginResponse>>('/auth/login', data).then(r => r.data);
export const getMe = () => client.get<ApiResponse<User>>('/auth/me').then(r => r.data);

export const getOrders = (params?: any) => client.get<ApiResponse<Order[]>>('/orders', { params }).then(r => r.data);
export const getOrderById = (id: string) => client.get<ApiResponse<Order>>(`/orders/${id}`).then(r => r.data);
export const createOrder = (data: any) => client.post<ApiResponse<any>>('/orders', data).then(r => r.data);
export const getPendingDispatch = () => client.get<ApiResponse<Order[]>>('/orders/pending-dispatch').then(r => r.data);

export const dispatchOrder = (data: any) => client.post<ApiResponse<any>>('/dispatch', data).then(r => r.data);

export const getZones = () => client.get<ApiResponse<Zone[]>>('/pricing/zones').then(r => r.data);
export const calculateRate = (data: any) => client.post<ApiResponse<any>>('/pricing/calculate', data).then(r => r.data);

export const getFinancialSummary = () => client.get<ApiResponse<FinancialSummary>>('/accounting/summary').then(r => r.data);

export const getCarriers = () => client.get<ApiResponse<Carrier[]>>('/carriers').then(r => r.data);

export const getCustomers = () => client.get<ApiResponse<Customer[]>>('/customers').then(r => r.data);
export const createCustomer = (data: any) => client.post<ApiResponse<any>>('/customers', data).then(r => r.data);

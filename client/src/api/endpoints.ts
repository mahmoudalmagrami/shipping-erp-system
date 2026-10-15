import client from './client';
import { 
  LoginResponse, ApiResponse, User, Order, Zone, 
  FinancialSummary, Carrier, Customer, DashboardAnalytics 
} from '../types';

export const login = (data: any) => client.post<ApiResponse<LoginResponse>>('/auth/login', data).then(r => r.data);
export const getMe = () => client.get<ApiResponse<User>>('/auth/me').then(r => r.data);

export const getOrders = (params?: any) => client.get<ApiResponse<Order[]>>('/orders', { params }).then(r => r.data);
export const getOrderById = (id: string | number) => client.get<ApiResponse<Order>>(`/orders/${id}`).then(r => r.data);
export const createOrder = (data: any) => client.post<ApiResponse<any>>('/orders', data).then(r => r.data);
export const cancelOrder = (id: string | number) => client.post<ApiResponse<any>>(`/orders/${id}/cancel`).then(r => r.data);
export const getPendingDispatch = () => client.get<ApiResponse<Order[]>>('/orders/pending-dispatch').then(r => r.data);

export const dispatchOrder = (data: any) => client.post<ApiResponse<any>>('/dispatch', data).then(r => r.data);

export const getZones = () => client.get<ApiResponse<Zone[]>>('/pricing/zones').then(r => r.data);
export const calculateRate = (data: any) => client.post<ApiResponse<any>>('/pricing/calculate', data).then(r => r.data);
export const updatePricingTier = (tierId: string | number, data: any) => client.put<ApiResponse<any>>(`/pricing/tiers/${tierId}`, data).then(r => r.data);

export const getFinancialSummary = () => client.get<ApiResponse<FinancialSummary>>('/accounting/summary').then(r => r.data);
export const createReceiptVoucher = (data: any) => client.post<ApiResponse<any>>('/accounting/vouchers/receipt', data).then(r => r.data);
export const createPaymentVoucher = (data: any) => client.post<ApiResponse<any>>('/accounting/vouchers/payment', data).then(r => r.data);

export const getCarriers = (params?: any) => client.get<ApiResponse<Carrier[]>>('/carriers', { params }).then(r => r.data);
export const getCarrierById = (id: string | number) => client.get<ApiResponse<Carrier>>(`/carriers/${id}`).then(r => r.data);
export const createCarrier = (data: any) => client.post<ApiResponse<Carrier>>('/carriers', data).then(r => r.data);
export const updateCarrier = (id: string | number, data: any) => client.put<ApiResponse<Carrier>>(`/carriers/${id}`, data).then(r => r.data);
export const deleteCarrier = (id: string | number) => client.delete<ApiResponse<any>>(`/carriers/${id}`).then(r => r.data);
export const getCarrierStatement = (id: string | number) => client.get<ApiResponse<any>>(`/carriers/${id}/statement`).then(r => r.data);

export const getCustomers = (params?: any) => client.get<ApiResponse<Customer[]>>('/customers', { params }).then(r => r.data);
export const getCustomerById = (id: string | number) => client.get<ApiResponse<Customer>>(`/customers/${id}`).then(r => r.data);
export const createCustomer = (data: any) => client.post<ApiResponse<any>>('/customers', data).then(r => r.data);
export const updateCustomer = (id: string | number, data: any) => client.put<ApiResponse<any>>(`/customers/${id}`, data).then(r => r.data);
export const deleteCustomer = (id: string | number) => client.delete<ApiResponse<any>>(`/customers/${id}`).then(r => r.data);
export const getCustomerStatement = (id: string | number) => client.get<ApiResponse<any>>(`/customers/${id}/statement`).then(r => r.data);

export const getUsers = () => client.get<ApiResponse<User[]>>('/users').then(r => r.data);
export const createUser = (data: any) => client.post<ApiResponse<any>>('/users', data).then(r => r.data);
export const updateUser = (id: string | number, data: any) => client.put<ApiResponse<any>>(`/users/${id}`, data).then(r => r.data);
export const toggleUserActive = (id: string | number) => client.put<ApiResponse<any>>(`/users/${id}/toggle`).then(r => r.data);
export const updateUserPassword = (id: string | number, data: any) => client.put<ApiResponse<any>>(`/users/${id}/password`, data).then(r => r.data);

export const getTrialBalance = () => client.get<ApiResponse<any>>('/reports/trial-balance').then(r => r.data);
export const getIncomeStatement = () => client.get<ApiResponse<any>>('/reports/income-statement').then(r => r.data);
export const getBalanceSheet = () => client.get<ApiResponse<any>>('/reports/balance-sheet').then(r => r.data);

export const getDashboardAnalytics = (params?: { days?: number }) => 
  client.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard', { params }).then(r => r.data);



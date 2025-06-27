export type EmailQueue = {
    id: string;
    type: string;
    subject?: string;
    body?: string;
    status: string;
    customer_email?: string;
    created_at: string;
};
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: "admin" | "cashier";
    branch_id: number | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    menu_items?: MenuItem[];
}

export interface MenuItem {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string; // decimal comes as string from Laravel
    image: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: Category;
    recipes?: Recipe[];
    cost?: number;
    food_cost_percentage?: number;
}

export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    cost_per_unit: string;
    created_at: string;
    updated_at: string;
    inventory?: Inventory;
}

export interface Recipe {
    id: number;
    menu_item_id: number;
    ingredient_id: number;
    quantity: string;
    created_at: string;
    updated_at: string;
    ingredient?: Ingredient;
    menu_item?: MenuItem;
}

export interface Inventory {
    id: number;
    ingredient_id: number;
    quantity_on_hand: string;
    restock_threshold: string;
    created_at: string;
    updated_at: string;
    ingredient?: Ingredient;
    is_low_stock?: boolean;
}

export interface Order {
    id: number;
    order_number: string;
    branch_id: number | null;
    user_id: number;
    shift_id: number | null;
    subtotal: string;
    discount?: string;
    tax: string;
    total: string;
    payment_method: "cash" | "card" | "qris";
    status: "pending" | "completed" | "cancelled";
    cancelled_by: number | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    cancelledBy?: User;
    shift?: Shift;
    items?: OrderItem[];
}

export interface Shift {
    id: number;
    branch_id: number | null;
    user_id: number;
    opening_cash: string;
    closing_cash: string | null;
    notes: string | null;
    status: "open" | "closed";
    opened_at: string;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    orders?: Order[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
    cost: string;
    created_at: string;
    updated_at: string;
    menu_item?: MenuItem;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface Branch {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    model_type: string;
    model_id: number;
    payload: any | null;
    ip_address: string | null;
    created_at: string;
    user?: User;
}

export interface InventoryTransfer {
    id: number;
    from_branch_id: number;
    to_branch_id: number;
    ingredient_id: number;
    quantity: string;
    status: "pending" | "approved" | "rejected";
    requested_by: number;
    approved_by: number | null;
    rejected_by: number | null;
    approved_at: string | null;
    rejected_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    from_branch?: Branch;
    to_branch?: Branch;
    ingredient?: Ingredient;
    requested_by_user?: User;
    approved_by_user?: User;
    rejected_by_user?: User;
}

export interface DaySummary {
    date: string;
    order_count: number;
    total_revenue: number;
}

export type PageProps<T extends object = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    branches?: Branch[];
    active_branch_id?: number | null;
    flash?: {
        success?: string;
        error?: string;
    };
    active_shift?: Shift | null;
};

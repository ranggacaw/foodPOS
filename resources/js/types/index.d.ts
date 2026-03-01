export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: "admin" | "cashier";
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
    user_id: number;
    shift_id: number | null;
    subtotal: string;
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
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
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

export type PageProps<T extends object = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    active_shift?: Shift | null;
};

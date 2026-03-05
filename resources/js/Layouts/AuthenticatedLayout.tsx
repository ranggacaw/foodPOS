import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import PwaInstallBanner from '@/Components/PwaInstallBanner';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { PageProps } from '@/types';

export default function Authenticated({
    header,
    hideNavigation = false,
    children,
}: PropsWithChildren<{ header?: ReactNode; hideNavigation?: boolean }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-100">
            {!hideNavigation && (
                <nav className="border-b border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </NavLink>

                                    {isAdmin && (
                                        <>
                                            <NavLink
                                                href={route('admin.categories.index')}
                                                active={route().current('admin.categories.*')}
                                            >
                                                Categories
                                            </NavLink>
                                            <NavLink
                                                href={route('admin.menu-items.index')}
                                                active={route().current('admin.menu-items.*')}
                                            >
                                                Menu Items
                                            </NavLink>
                                            <NavLink
                                                href={route('admin.ingredients.index')}
                                                active={route().current('admin.ingredients.*')}
                                            >
                                                Ingredients
                                            </NavLink>
                                            <NavLink
                                                href={route('admin.inventory.index')}
                                                active={route().current('admin.inventory.*')}
                                            >
                                                Inventory
                                            </NavLink>
                                            <NavLink
                                                href={route('admin.reports.index')}
                                                active={route().current('admin.reports.*')}
                                            >
                                                Reports
                                            </NavLink>
                                        </>
                                    )}

                                    <NavLink
                                        href={route('pos.index')}
                                        active={route().current('pos.index')}
                                    >
                                        POS
                                    </NavLink>

                                    {!isAdmin && (
                                        <NavLink
                                            href={route('pos.orders.history')}
                                            active={route().current('pos.orders.history')}
                                        >
                                            Order History
                                        </NavLink>
                                    )}

                                    <NavLink
                                        href={route('pos.history.index')}
                                        active={route().current('pos.history.*')}
                                    >
                                        Transaction History
                                    </NavLink>

                                    <NavLink
                                        href={route('pos.shifts.index')}
                                        active={route().current('pos.shifts.*')}
                                    >
                                        Shifts
                                    </NavLink>
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                >
                                                    {user.name}

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? 'block' : 'hidden') +
                            ' sm:hidden'
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                Dashboard
                            </ResponsiveNavLink>

                            {isAdmin && (
                                <>
                                    <ResponsiveNavLink
                                        href={route('admin.categories.index')}
                                        active={route().current('admin.categories.*')}
                                    >
                                        Categories
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('admin.menu-items.index')}
                                        active={route().current('admin.menu-items.*')}
                                    >
                                        Menu Items
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('admin.ingredients.index')}
                                        active={route().current('admin.ingredients.*')}
                                    >
                                        Ingredients
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('admin.inventory.index')}
                                        active={route().current('admin.inventory.*')}
                                    >
                                        Inventory
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('admin.reports.index')}
                                        active={route().current('admin.reports.*')}
                                    >
                                        Reports
                                    </ResponsiveNavLink>
                                </>
                            )}

                            <ResponsiveNavLink
                                href={route('pos.index')}
                                active={route().current('pos.index')}
                            >
                                POS
                            </ResponsiveNavLink>

                            {!isAdmin && (
                                <ResponsiveNavLink
                                    href={route('pos.orders.history')}
                                    active={route().current('pos.orders.history')}
                                >
                                    Order History
                                </ResponsiveNavLink>
                            )}

                            <ResponsiveNavLink
                                href={route('pos.history.index')}
                                active={route().current('pos.history.*')}
                            >
                                Transaction History
                            </ResponsiveNavLink>

                            <ResponsiveNavLink
                                href={route('pos.shifts.index')}
                                active={route().current('pos.shifts.*')}
                            >
                                Shifts
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {!hideNavigation && header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {flash?.success && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main>{children}</main>
            <PwaInstallBanner />
        </div>
    );
}

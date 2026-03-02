import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Shift, PaginatedData } from '@/types';

interface Props {
    shifts: PaginatedData<Shift>;
}

export default function ShiftHistory({ shifts }: Props) {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Shift History</h2>}
        >
            <Head title="Shifts" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Shift Records</h3>
                        </div>

                        <ul role="list" className="divide-y divide-gray-200">
                            {shifts.data.map((shift) => (
                                <li key={shift.id}>
                                    <Link href={route('pos.shifts.show', shift.id)} className="block hover:bg-gray-50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-indigo-600">
                                                    Shift #{shift.id} — {shift.user?.name}
                                                </p>
                                                <div className="ml-2 flex flex-shrink-0">
                                                    {shift.status === 'open' ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                            Closed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>
                                                    Opened: <time dateTime={shift.opened_at}>{formatDate(shift.opened_at)}</time>
                                                </p>
                                                {shift.status === 'closed' && shift.closed_at && (
                                                    <p>
                                                        Closed: <time dateTime={shift.closed_at}>{formatDate(shift.closed_at)}</time>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 sm:mt-0">
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    Opening Cash: Rp {parseFloat(shift.opening_cash).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            {shifts.data.length === 0 && (
                                <li>
                                    <div className="px-4 py-12 text-center text-sm text-gray-500">
                                        No shifts found.
                                    </div>
                                </li>
                            )}
                        </ul>

                        {/* Pagination */}
                        {shifts.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 flex items-center justify-between">
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{shifts.from}</span> to <span className="font-medium">{shifts.to}</span> of <span className="font-medium">{shifts.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => shifts.prev_page_url && router.get(shifts.prev_page_url)}
                                                disabled={!shifts.prev_page_url}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => shifts.next_page_url && router.get(shifts.next_page_url)}
                                                disabled={!shifts.next_page_url}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

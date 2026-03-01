import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Shift } from '@/types';

interface Props {
    shift: Shift;
    expected_cash: number;
}

export default function CloseShift({ shift, expected_cash }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        closing_cash: expected_cash.toString(),
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('pos.shifts.update', shift.id));
    };

    const difference = parseFloat(data.closing_cash || '0') - expected_cash;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Close Shift</h2>}
        >
            <Head title="Close Shift" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-8 shadow-sm sm:rounded-lg">
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Close Current Shift</h3>
                            <p className="mt-1 text-sm text-gray-500">Review expected cash and enter actual closing cash.</p>
                        </div>

                        <div className="mb-6 rounded-md bg-gray-50 p-4">
                            <dl className="divide-y divide-gray-200">
                                <div className="flex justify-between py-2 text-sm">
                                    <dt className="text-gray-500">Opening Cash</dt>
                                    <dd className="font-medium text-gray-900">Rp {parseFloat(shift.opening_cash).toLocaleString('id-ID')}</dd>
                                </div>
                                <div className="flex justify-between py-2 text-sm">
                                    <dt className="text-gray-500">Cash Sales</dt>
                                    <dd className="font-medium text-gray-900">Rp {(expected_cash - parseFloat(shift.opening_cash)).toLocaleString('id-ID')}</dd>
                                </div>
                                <div className="flex justify-between py-3 text-base">
                                    <dt className="font-bold text-gray-900">Expected Cash in Drawer</dt>
                                    <dd className="font-bold text-indigo-600">Rp {expected_cash.toLocaleString('id-ID')}</dd>
                                </div>
                            </dl>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="closing_cash" className="block text-sm font-medium text-gray-700">
                                    Actual Cash in Drawer (Rp)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        id="closing_cash"
                                        min="0"
                                        step="0.01"
                                        value={data.closing_cash}
                                        onChange={(e) => setData('closing_cash', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.closing_cash && (
                                    <p className="mt-2 text-sm text-red-600">{errors.closing_cash}</p>
                                )}
                                <div className="mt-2 text-sm">
                                    {difference === 0 ? (
                                        <span className="text-green-600 font-medium">Drawer matches perfectly.</span>
                                    ) : difference > 0 ? (
                                        <span className="text-blue-600 font-medium">+ Rp {Math.abs(difference).toLocaleString('id-ID')} over.</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">- Rp {Math.abs(difference).toLocaleString('id-ID')} short.</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes (Optional, required if short/over)
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Explain any discrepancies here..."
                                        required={difference !== 0}
                                    />
                                </div>
                                {errors.notes && (
                                    <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                            >
                                {processing ? 'Closing Shift...' : 'Confirm Closing Cash'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

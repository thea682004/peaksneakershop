import { Checkbox, Button, Input } from 'antd/lib'
import { useState, useMemo } from "react"
import {
    CaretSortIcon,
} from "@radix-ui/react-icons"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useAppSelector } from '../../redux/storage'
import { set, updateSelected } from '../../redux/features/promotion-selected-item'
import { useDispatch } from "react-redux";
import { ReduceString } from '../../lib/functional'

export default function ListTable({ data, onRowClick, activeProductId }) {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})

    const dispatch = useDispatch();

    const selectedProduct = useAppSelector((state) => state.promotionReducer.value.selected)

    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={
                            selectedProduct.length > 0 && selectedProduct.every(target => target.selected)
                        }
                        onChange={(value) => {
                            dispatch(set({
                                value: {
                                    selected: data.map(product => {
                                        return {
                                            id: product.id, selected: !!value.target.checked, children: product.lstProductDetails.map(detail => {
                                                return { id: detail.id, selected: !!value.target.checked }
                                            })
                                        }
                                    })
                                }
                            }))
                            if (value.target.checked && data.length > 0 && onRowClick) {
                                onRowClick(data[0])
                            }
                        }}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='flex justify-center' onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        disabled={!!selectedProduct.find(pro => pro.id == row.original.id)?.disable}
                        checked={(selectedProduct.find(value => value.id == row.original.id)?.selected || false)}
                        onChange={(value) => {
                            dispatch(updateSelected({ id: row.original.id, selected: !!value.target.checked }))
                            if (onRowClick) onRowClick(row.original)
                        }}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "stt",
            header: () => <div className="text-center">STT</div>,
            cell: ({ row }) => <div className="text-center text-xl">{row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <div
                        className='flex items-center justify-center min-h-16'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Tên sản phẩm
                        <CaretSortIcon className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => <div className="lowercase text-xl">{ReduceString({ string: row.original.name, maxLength: 20 })}</div>,
        },
        {
            accessorKey: "style",
            header: () => <div className="text-center">Phong cách</div>,
            cell: ({ row }) => {
                return (<div className='flex justify-center text-xl'>
                    {row.original.style ? row.original.style.name : "Không có"}
                </div>)
            },
        },
        {
            accessorKey: "brand",
            header: ({ column }) => {
                return (
                    <div className='flex justify-center'>Thương hiệu</div>
                )
            },
            cell: ({ row }) => <div className="lowercase text-center text-xl">{row.original.brand ? row.original.brand.name : "Không có"}</div>,
        },
    ], [data, dispatch, selectedProduct, onRowClick]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <>
            <div className="w-full">
                <div className="rounded-md border">
                    <div className='my-3'>
                        <Input placeholder='Tìm kiếm theo tên' onChange={e => { table.getColumn("name").setFilterValue(e.target.value) }} />
                    </div>
                    <table className="min-w-full border">
                        <thead className='ant-table-thead'>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className='ant-table-cell py-5'>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-slate-50 divide-y divide-gray-200">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`cursor-pointer ${row.original.id === activeProductId ? "bg-blue-200" : "hover:bg-slate-100"}`}
                                        onClick={() => onRowClick && onRowClick(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))
                                        }
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-4 whitespace-nowrap text-xl text-gray-500 text-center"
                                    >
                                        Không có kết quả
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">

                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

function minMaxPrice(ProductDetail) {
    if (!ProductDetail || ProductDetail.length === 0) {
        return [null, null];
    }

    let minPrice = ProductDetail[0].price;
    let maxPrice = ProductDetail[0].price;
    ProductDetail.forEach(productDetail => {
        const price = productDetail.price;
        if (price < minPrice) {
            minPrice = price;
        }
        if (price > maxPrice) {
            maxPrice = price;
        }
    });

    return `${numberToPrice(minPrice)} - ${numberToPrice(maxPrice)}`;
}

const numberToPrice = (value) => {
    const formattedAmount = Number.parseFloat(value.toString()).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    return formattedAmount;
}

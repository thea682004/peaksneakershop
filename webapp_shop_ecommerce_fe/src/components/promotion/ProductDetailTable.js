import { Checkbox, Button } from 'antd/lib'
import { FaImage } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useAppSelector } from '../../redux/storage'
import { toggleChildren } from '../../redux/features/promotion-selected-item'
import { useDispatch } from "react-redux";
import Table from '../../components/ui/table'
import HexToColor from '../../ultils/HexToColorName'

const numberToPrice = (value) => {
    const formattedAmount = Number.parseFloat(value.toString()).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    return formattedAmount;
}


const ProductDetailTable = ({ data }) => {
    const [belowSorting, setBelowSorting] = useState([])
    const [belowColumnFilters, setBelowColumnFilters] = useState([])
    const [belowColumnVisibility, setBelowColumnVisibility] = useState({})
    const [belowRowSelection, setBelowRowSelection] = useState({})

    const selectedProduct = useAppSelector((state) => state.promotionReducer.value.selected);

    const dispatch = useDispatch();

    const belowColumns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div></div>
            ),
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={isChildSelected(selectedProduct, row.original.parentId, row.original.id)}
                        onClick={(value) => { dispatch(toggleChildren({ id: row.original.id, parentId: row.original.parentId, value: !!value.target.checked })) }}
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
            accessorKey: "imageUrl",
            header: () => <div className="text-center flex justify-center"><FaImage /></div>,
            cell: ({ row }) => {
                return <div className="text-center flex justify-center font-medium max-h-16 text-xl">
                    {row.original.imageUrl ? <img className="w-16 aspect-square" src={row.original.imageUrl.split("|")[0]} alt=""></img> : "không có"}
                </div>
            },
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <div className='text-center'>Tên</div>
                )
            },
            cell: ({ row }) => <div className="text-center text-xl">{row.original.name} [{HexToColor(row.original.color.name)} - {row.original.size.name}]</div>,
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-center">Số lượng</div>,
            cell: ({ row }) => {

                return <div className='flex justify-center items-center'>
                    <div className="text-center font-medium text-xl">{row.original.quantity}</div>
                </div>
            },
        },
        {
            accessorKey: "price",
            header: () => <div className="text-center">Đơn giá</div>,
            cell: ({ row }) => {

                return <div className="text-center font-medium text-xl text-black-500">{numberToPrice(row.original.price)}</div>
            },
        },
    ], [dispatch, selectedProduct]);

    const belowTable = useReactTable({
        data: data,
        columns: belowColumns,
        onSortingChange: setBelowSorting,
        onColumnFiltersChange: setBelowColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setBelowColumnVisibility,
        onRowSelectionChange: setBelowRowSelection,
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
        state: {
            sorting: belowSorting,
            columnFilters: belowColumnFilters,
            columnVisibility: belowColumnVisibility,
            rowSelection: belowRowSelection,
        },
    })

    useEffect(() => {
        const keysArray = Object.keys(belowRowSelection).map(Number);
        if (keysArray.length > 0) {
            keysArray.map(key => {
                const row = belowTable.getRow(key.toString());
                dispatch(toggleChildren({ id: row.original.id, parentId: row.original.parentId, value: true }))
            })
        }
    }, [belowRowSelection, belowTable, dispatch])


    return (
        <>
            <div className="mr-4">
                <div className="rounded-md border">
                    {Table(belowTable, flexRender, belowColumns)}
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">

                    </div>
                    <div className="space-x-2 flex items-center">

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => belowTable.previousPage()}
                            disabled={!belowTable.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center gap-1">
                            <div>Page</div>
                            <strong>
                                {belowTable.getState().pagination.pageIndex + 1} of{" "}
                                {belowTable.getPageCount()}
                            </strong>
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => belowTable.nextPage()}
                            disabled={!belowTable.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

function isChildSelected(selectedProduct, parentId, childId) {
    const product = selectedProduct.find(slt => slt.id == parentId);
    if (!product) return false;
    const child = product.children.find(child => child.id == childId);
    return child ? child.selected : false;
}

export default ProductDetailTable;

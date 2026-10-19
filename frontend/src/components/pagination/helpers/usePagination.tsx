import { AsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from '@store/hooks'
import { AppDispatch, RootState } from '@store/store'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WebLarekAPI } from '../../../utils/weblarek-api'

interface PaginatedResponse {
    pagination: {
        totalPages: number
    }
}

interface PaginationResult<U> {
    data: U[]
    totalPages: number
    currentPage: number
    limit: number
    nextPage: () => void
    prevPage: () => void
    setPage: (page: number) => void
    setLimit: (limit: number) => void
}

interface PaginationThunkConfig {
    extra: WebLarekAPI
    state: RootState
    dispatch: AppDispatch
}

const usePagination = <T extends PaginatedResponse, U>(
    asyncAction: AsyncThunk<T, Record<string, unknown>, PaginationThunkConfig>,
    selector: (state: RootState) => U[],
    defaultLimit: number
): PaginationResult<U> => {
    const dispatch = useDispatch()
    const data = useSelector(selector)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalPages, setTotalPages] = useState(1)
    const queryString = searchParams.toString()

    const currentPage = Math.max(
        1,
        Math.min(Number(searchParams.get('page')) || 1, Math.max(1, totalPages))
    )
    const limit = Number(searchParams.get('limit')) || defaultLimit

    useEffect(() => {
        let active = true
        const params = Object.fromEntries(new URLSearchParams(queryString))

        const fetchData = async () => {
            const response = await dispatch(
                asyncAction({ ...params, page: currentPage, limit })
            )

            if (!active || !asyncAction.fulfilled.match(response)) {
                return
            }

            const pages = response.payload.pagination.totalPages
            setTotalPages(pages)

            if (currentPage > Math.max(1, pages)) {
                const updatedParams = new URLSearchParams(queryString)
                updatedParams.set('page', '1')
                setSearchParams(updatedParams)
            }
        }

        void fetchData()

        return () => {
            active = false
        }
    }, [asyncAction, currentPage, dispatch, limit, queryString, setSearchParams])

    const updateURL = (
        newParams: Record<string, string | number | undefined>
    ) => {
        const updatedParams = new URLSearchParams(searchParams)

        Object.entries(newParams).forEach(([key, value]) => {
            if (value !== undefined) {
                updatedParams.set(key, String(value))
            } else {
                updatedParams.delete(key)
            }
        })

        setSearchParams(updatedParams)
    }

    const nextPage = () => {
        if (currentPage < totalPages) {
            updateURL({ page: currentPage + 1, limit })
        }
    }

    const prevPage = () => {
        if (currentPage > 1) {
            updateURL({ page: currentPage - 1, limit })
        }
    }

    const setPage = (page: number) => {
        const newPage = Math.max(1, Math.min(page, Math.max(1, totalPages)))
        updateURL({ page: newPage, limit })
    }

    const setLimit = (newLimit: number) => {
        updateURL({ page: 1, limit: newLimit })
    }

    return {
        data,
        totalPages,
        currentPage,
        limit,
        nextPage,
        prevPage,
        setPage,
        setLimit,
    }
}

export default usePagination

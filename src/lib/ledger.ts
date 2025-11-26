import { LedgerFilters } from "@/types/ledger"

type ExtraParams = Record<string, string | number | undefined | null>

export function buildLedgerQuery(filters: LedgerFilters, extras?: ExtraParams) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (key === "page") {
      if (!value) return
      params.set("page", value.toString())
      return
    }

    if (typeof value === "string" && value === "all") {
      return
    }

    params.set(key, value.toString())
  })

  if (extras) {
    Object.entries(extras).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}


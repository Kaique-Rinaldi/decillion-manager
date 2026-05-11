import { describe, it, expect } from "vitest"
import { normalize, formatCurrency } from "../../utils/format"

describe("normalize", () => {
  it("remove acentos", () => {
    expect(normalize("João")).toBe("joao")
  })
})
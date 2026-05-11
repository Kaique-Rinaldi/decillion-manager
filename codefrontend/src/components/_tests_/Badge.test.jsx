import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

function Badge({ label }) {
  return <span>{label}</span>
}

describe("Badge", () => {
  it("renderiza texto", () => {
    render(<Badge label="Pago" />)

    expect(screen.getByText("Pago")).toBeInTheDocument()
  })
})
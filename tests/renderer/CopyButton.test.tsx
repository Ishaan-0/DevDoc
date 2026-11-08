// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, test, expect, beforeEach } from 'vitest'
import { CopyButton } from '../../renderer/components/CopyButton'

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
  return writeText
}

beforeEach(() => {
  mockClipboard()
})

test('CopyButton writes command to clipboard on click', async () => {
  const user = userEvent.setup()
  const writeText = mockClipboard()
  render(<CopyButton command="pip uninstall old-package" />)
  await user.click(screen.getByRole('button'))
  expect(writeText).toHaveBeenCalledWith('pip uninstall old-package')
})

test('CopyButton shows "Copied!" briefly after click', async () => {
  const user = userEvent.setup()
  mockClipboard()
  render(<CopyButton command="echo hi" />)
  await user.click(screen.getByRole('button'))
  expect(screen.getByText('Copied!')).toBeInTheDocument()
})
